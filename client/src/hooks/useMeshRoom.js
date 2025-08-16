import { API_URL } from "@/utils/config";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const MAX_MESH = 10;

export function useMeshRoom(roomId, token) {
  const [status, setStatus] = useState("connecting");
  const [muted, setMuted] = useState(true); // push-to-talk style: start muted
  const [connectedPeers, setConnectedPeers] = useState(0);
  const [onlineParticipants, setOnlineParticipants] = useState([]);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const audioElementsRef = useRef(new Map());
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const localTrackRef = useRef(null);

  useEffect(() => {
    let disposed = false;

    async function boot() {
      try {
        // 1) Get microphone with voice-optimized constraints
        const rawStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            voiceActivityDetection: true,
          },
          video: false,
        });
        if (disposed) return;

        // Create AudioContext pipeline
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(rawStream);
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = muted ? 0 : 1; // start muted
        source.connect(gainNode);
        const dest = audioContextRef.current.createMediaStreamDestination();
        gainNode.connect(dest);

        gainNodeRef.current = gainNode;
        localStreamRef.current = dest.stream;
        localTrackRef.current = dest.stream.getAudioTracks()[0] || null;

        // 2) Setup WebSocket connection
        const socket = io(API_URL, {
          transports: ["websocket"],
          auth: { token, roomId: Number(roomId) },
        });
        socketRef.current = socket;

        socket.on("connect", () => setStatus("connected"));
        socket.on("disconnect", () => {
          setStatus("disconnected");
          setOnlineParticipants([]);
        });

        socket.on("room:full", ({ limit }) => {
          setStatus(`room full (${limit})`);
          socket.disconnect();
        });

        // Merge participants list + presence sync
        socket.on("participants:list", ({ participants }) => {
          setOnlineParticipants(participants || []);
        });

        socket.on("presence:join", ({ user, socketId, timestamp }) => {
          setOnlineParticipants((prev) => {
            const exists = prev.some((p) => p.id === user.id);
            if (!exists) {
              return [
                ...prev,
                { ...user, socket_id: socketId, is_online: true, joined_at: timestamp },
              ];
            }
            return prev;
          });
        });

        socket.on("presence:leave", ({ socketId }) => {
          setOnlineParticipants((prev) => prev.filter((p) => p.socket_id !== socketId));
          cleanupPeer(socketId);
        });

        socket.on("user:status:change", ({ socketId, status, timestamp }) => {
          setOnlineParticipants((prev) =>
            prev.map((p) =>
              p.socket_id === socketId ? { ...p, ...status, status_updated_at: timestamp } : p
            )
          );
        });

        // Handle peers
        socket.on("peers:list", async ({ peers }) => {
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
          let pc = peersRef.current.get(msg.from);
          if (!pc) pc = await createPeer(msg.from, false);
          await pc.setRemoteDescription(msg.sdp);
          const answer = await pc.createAnswer();
          answer.sdp = preferOpusAndLimitBitrate(answer.sdp, 32000);
          await pc.setLocalDescription(answer);
          socket.emit("webrtc:answer", { to: msg.from, from: socket.id, sdp: pc.localDescription });
        });

        socket.on("webrtc:answer", async (msg) => {
          const pc = peersRef.current.get(msg.from);
          if (pc) await pc.setRemoteDescription(msg.sdp);
        });

        socket.on("webrtc:ice", async (msg) => {
          const pc = peersRef.current.get(msg.from);
          if (pc && msg.candidate) {
            try {
              await pc.addIceCandidate(msg.candidate);
            } catch (err) {
              console.error("ICE error:", err);
            }
          }
        });

        socket.on("peer:disconnected", (peerId) => {
          cleanupPeer(peerId);
        });

        // Initial discovery
        socket.emit("peers:list");
        socket.emit("participants:list");
      } catch (err) {
        console.error("Failed to init:", err);
        setStatus("error: " + err.message);
      }
    }

    async function createPeer(remoteSid, initiator) {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // Add TURN servers in prod
        ],
      });

      // Add local track
      if (localTrackRef.current) {
        pc.addTrack(localTrackRef.current, localStreamRef.current);
      }

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        let audio = audioElementsRef.current.get(remoteSid);
        if (!audio) {
          audio = document.createElement("audio");
          audio.autoplay = true;
          audio.playsInline = true;
          audio.style.display = "none";
          document.body.appendChild(audio);
          audioElementsRef.current.set(remoteSid, audio);
        }
        audio.srcObject = remoteStream;
        setConnectedPeers((prev) => prev + (audioElementsRef.current.has(remoteSid) ? 0 : 1));
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
          cleanupPeer(remoteSid);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("webrtc:ice", {
            to: remoteSid,
            from: socketRef.current.id,
            candidate: event.candidate,
          });
        }
      };

      if (initiator) {
        let offer = await pc.createOffer();
        offer.sdp = preferOpusAndLimitBitrate(offer.sdp, 32000);
        await pc.setLocalDescription(offer);
        socketRef.current?.emit("webrtc:offer", {
          to: remoteSid,
          from: socketRef.current?.id,
          sdp: pc.localDescription,
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
        setConnectedPeers((prev) => Math.max(0, prev - 1));
      }
    }

    function preferOpusAndLimitBitrate(sdp, maxAverageBitrate = 32000) {
      return sdp.replace(
        /a=fmtp:(111|109) .*?\r\n/g,
        (match, payloadType) =>
          `a=fmtp:${payloadType} maxplaybackrate=16000; stereo=0; sprop-stereo=0; maxaveragebitrate=${maxAverageBitrate}; cbr=1; useinbandfec=1; usedtx=1\r\n`
      );
    }

    if (roomId && token) {
      boot();
    }

    return () => {
      disposed = true;
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      audioElementsRef.current.forEach((audio) => audio.remove());
      audioElementsRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      socketRef.current?.disconnect();
      setConnectedPeers(0);
      setOnlineParticipants([]);
    };
  }, [roomId, token]);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);

    if (gainNodeRef.current) {
      // Adjust gain instead of removing the track
      gainNodeRef.current.gain.value = newMuted ? 0 : 1;
    }

    // Still notify peers about mute status for UI
    if (socketRef.current) {
      socketRef.current.emit("user:status", { status: { is_muted: newMuted } });
    }
  };


  const refreshParticipants = () => {
    socketRef.current?.emit("participants:list");
  };

  return { status, muted, toggleMute, connectedPeers, onlineParticipants, refreshParticipants };
}
