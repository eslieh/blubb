import { API_URL } from "@/utils/config";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const MAX_MESH = 10;

export function useMeshRoom(roomId, token) {
  const [status, setStatus] = useState("connecting");
  const [muted, setMuted] = useState(true); // push-to-talk style: start muted
  const [connectedPeers, setConnectedPeers] = useState(0);
  const [onlineParticipants, setOnlineParticipants] = useState([]); // New: list of online users with details
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const audioElementsRef = useRef(new Map());
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);

  useEffect(() => {
    let disposed = false;

    async function boot() {
      try {
        // 1) Get microphone access
        const rawStream = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false,
        });
        if (disposed) return;

        // Create AudioContext pipeline
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(rawStream);
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = muted ? 0 : 1;  // start muted
        source.connect(gainNode);
        const dest = audioContextRef.current.createMediaStreamDestination();
        gainNode.connect(dest);

        gainNodeRef.current = gainNode;
        localStreamRef.current = dest.stream;

        // 2) Setup WebSocket connection
        const socketUrl = API_URL;
        const socket = io(socketUrl, {
          transports: ["websocket"],
          auth: { token, roomId: Number(roomId) },
        });
        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("Connected to signaling server");
          setStatus("connected");
        });
        
        socket.on("connected", (data) => {
          console.log("Connected with user details:", data.user);
          setStatus("connected");
        });
        
        socket.on("room:full", ({ limit }) => {
          console.log(`Room is full (${limit})`);
          setStatus(`room full (${limit})`);
          socket.disconnect();
        });
        
        socket.on("disconnect", () => {
          console.log("Disconnected from signaling server");
          setStatus("disconnected");
          setOnlineParticipants([]);
        });

        // Handle participants list (initial load)
        socket.on("participants:list", ({ participants, total }) => {
          console.log("Received participants list:", participants);
          setOnlineParticipants(participants || []);
        });

        // Handle user joining
        socket.on("presence:join", ({ user, socketId, timestamp }) => {
          console.log("User joined:", user);
          setOnlineParticipants(prev => {
            // Check if user is already in the list
            const exists = prev.some(p => p.id === user.id);
            if (!exists) {
              const newParticipant = {
                ...user,
                socket_id: socketId,
                is_online: true,
                joined_at: timestamp
              };
              return [...prev, newParticipant];
            }
            return prev;
          });
        });

        // Handle user leaving
        socket.on("presence:leave", ({ user, socketId, timestamp }) => {
          console.log("User left:", user);
          setOnlineParticipants(prev => 
            prev.filter(p => p.socket_id !== socketId)
          );
          
          // Cleanup audio for this user
          cleanupPeer(socketId);
        });

        // Handle user status changes (e.g., mute/unmute)
        socket.on("user:status:change", ({ user, socketId, status, timestamp }) => {
          console.log("User status changed:", user, status);
          setOnlineParticipants(prev => 
            prev.map(p => 
              p.socket_id === socketId 
                ? { ...p, ...status, status_updated_at: timestamp }
                : p
            )
          );
        });

        socket.on("peers:list", async ({ peers }) => {
          console.log("Received peers list:", peers);
          // limit to 9 others (MAX_MESH - 1 for self)
          const existing = peersRef.current.size;
          const freeSlots = Math.max(0, MAX_MESH - 1 - existing);
          const targets = (peers || []).slice(0, freeSlots);
          
          for (const sid of targets) {
            if (!peersRef.current.has(sid)) {
              await createPeer(sid, true);
            }
          }
        });

        socket.on("webrtc:offer", async (msg) => {
          console.log("Received WebRTC offer from:", msg.from);
          const from = msg.from;
          let pc = peersRef.current.get(from);
          if (!pc) {
            pc = await createPeer(from, false);
          }
          await pc.setRemoteDescription(msg.sdp);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc:answer", { 
            to: from, 
            from: socket.id, 
            sdp: pc.localDescription 
          });
        });

        socket.on("webrtc:answer", async (msg) => {
          console.log("Received WebRTC answer from:", msg.from);
          const from = msg.from;
          const pc = peersRef.current.get(from);
          if (!pc) return;
          await pc.setRemoteDescription(msg.sdp);
        });

        socket.on("webrtc:ice", async (msg) => {
          const from = msg.from;
          const pc = peersRef.current.get(from);
          if (!pc) return;
          try { 
            await pc.addIceCandidate(msg.candidate); 
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        });

        socket.on("peer:disconnected", (peerId) => {
          console.log("Peer disconnected:", peerId);
          cleanupPeer(peerId);
        });

        // Initial discovery
        socket.emit("peers:list");
        // Request current participants
        socket.emit("participants:list");

      } catch (error) {
        console.error("Failed to initialize mesh room:", error);
        setStatus("error: " + error.message);
      }
    }

    async function createPeer(remoteSid, initiator) {
      console.log(`Creating peer connection with ${remoteSid}, initiator: ${initiator}`);
      
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }, // STUN only (pure p2p)
          // Add TURN servers in production for better connectivity
        ],
      });

      // Add local audio track
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle incoming remote audio
      pc.ontrack = (event) => {
        console.log("Received remote track from", remoteSid);
        const remoteStream = event.streams[0];
        
        // Create or reuse audio element
        let audio = audioElementsRef.current.get(remoteSid);
        if (!audio) {
          audio = document.createElement("audio");
          audio.autoplay = true;
          audio.playsInline = true;
          audio.style.display = "none"; // Hide audio elements
          document.body.appendChild(audio);
          audioElementsRef.current.set(remoteSid, audio);
        }
        
        audio.srcObject = remoteStream;
        setConnectedPeers(prev => prev + (audioElementsRef.current.has(remoteSid) ? 0 : 1));
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log(`Connection state with ${remoteSid}:`, pc.connectionState);
        if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
          cleanupPeer(remoteSid);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("webrtc:ice", { 
            to: remoteSid, 
            from: socketRef.current.id, 
            candidate: event.candidate 
          });
        }
      };

      // Create offer if we're the initiator
      if (initiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit("webrtc:offer", { 
          to: remoteSid, 
          from: socketRef.current?.id, 
          sdp: pc.localDescription 
        });
      }

      peersRef.current.set(remoteSid, pc);
      return pc;
    }

    function cleanupPeer(peerId) {
      const pc = peersRef.current.get(peerId);
      if (pc) {
        pc.close();
        peersRef.current.delete(peerId);
      }
      
      const audio = audioElementsRef.current.get(peerId);
      if (audio) {
        audio.remove();
        audioElementsRef.current.delete(peerId);
        setConnectedPeers(prev => Math.max(0, prev - 1));
      }
    }

    // Only initialize if we have roomId and token
    if (roomId && token) {
      boot();
    }

    return () => {
      disposed = true;
      
      // Cleanup all peer connections
      peersRef.current.forEach(pc => pc.close());
      peersRef.current.clear();
      
      // Cleanup all audio elements
      audioElementsRef.current.forEach(audio => audio.remove());
      audioElementsRef.current.clear();
      
      // Stop local stream
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      
      // Disconnect socket
      socketRef.current?.disconnect();
      
      setConnectedPeers(0);
      setOnlineParticipants([]);
    };
  }, [roomId, token, muted]);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newMuted ? 0 : 1;
    }
    // Emit status change to other participants
    if (socketRef.current) {
      socketRef.current.emit("user:status", {
        status: { is_muted: newMuted }
      });
    }
  };

  const refreshParticipants = () => {
    if (socketRef.current) {
      socketRef.current.emit("participants:list");
    }
  };

  return { 
    status, 
    muted, 
    toggleMute, 
    connectedPeers, 
    onlineParticipants,
    refreshParticipants
  };
} 