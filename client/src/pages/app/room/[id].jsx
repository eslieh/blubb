import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Copy,
  Check,
  Users,
  Mic,
  MicOff,
  Volume2,
  ArrowLeft,
  LogOut,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import Header from "../components/Header";
import styles from "@/styles/App.module.css";
import roomStyles from "../components/Room.module.css";
import { isAuthenticated, getUserData } from '@/utils/auth';
import { roomsApi, roomUtils, apiErrors } from '@/utils/api';
import { demoRoomsApi, DEMO_MODE } from '@/utils/demo';
import { useMeshRoom } from '@/hooks/useMeshRoom';

export default function Room() {
  const router = useRouter();
  const { id } = router.query;
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isUserInRoom, setIsUserInRoom] = useState(false);
  const [token, setToken] = useState(null);

  // Initialize mesh room - only when user is in room
  const { status: meshStatus, muted, toggleMute, connectedPeers, onlineParticipants, refreshParticipants } = useMeshRoom(
    isUserInRoom ? id : null, 
    isUserInRoom ? token : null
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth');
      return;
    }
    
    const userData = getUserData();
    if (userData) {
      setUser({
        name: userData.name,
        email: userData.email,
        id: userData.id,
        image: userData.profile || "https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg"
      });
      // Set token for mesh room (you might get this from localStorage or userData)
      setToken(localStorage.getItem('authToken') || userData.token || 'demo-token');
    }
  }, [router]);

  // Load room data when component mounts and id is available
  useEffect(() => {
    if (id && user) {
      loadRoomDetails();
    }
  }, [id, user]);

  const loadRoomDetails = async () => {
    setIsLoading(true);
    setError('');

    try {
      let result;
      if (DEMO_MODE) {
        result = await demoRoomsApi.getRoomDetails(id);
      } else {
        result = await roomsApi.getRoomDetails(id);
      }

      if (result.success) {
        const formattedRoom = roomUtils.formatRoom(result.data.room);
        setRoom(formattedRoom);
        setParticipants(result.data.room.participants || []);
        
        // Check if current user is in the room
        const userInRoom = result.data.room.participants?.some(p => p.id.toString() === user.id.toString());
        setIsUserInRoom(userInRoom);
      } else {
        setError(apiErrors.parseError(result.error));
      }
    } catch (error) {
      console.error('Load room details error:', error);
      setError('Failed to load room details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!room || isJoining) return;

    setIsJoining(true);
    setError('');

    try {
      let result;
      if (DEMO_MODE) {
        result = await demoRoomsApi.joinRoom(room.id);
      } else {
        result = await roomsApi.joinRoom(room.id);
      }

      if (result.success) {
        // Refresh room details to get updated participant list
        await loadRoomDetails();
      } else {
        setError(apiErrors.parseError(result.error));
      }
    } catch (error) {
      console.error('Join room error:', error);
      setError('Failed to join room. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!room || isLeaving) return;

    setIsLeaving(true);
    setError('');

    try {
      let result;
      if (DEMO_MODE) {
        result = await demoRoomsApi.leaveRoom(room.id);
      } else {
        result = await roomsApi.leaveRoom(room.id);
      }

      if (result.success) {
        // Redirect back to app home after leaving
        router.push('/app');
      } else {
        setError(apiErrors.parseError(result.error));
      }
    } catch (error) {
      console.error('Leave room error:', error);
      setError('Failed to leave room. Please try again.');
    } finally {
      setIsLeaving(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const scaleOnHover = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  };

  const copyRoomUrl = async () => {
    if (room) {
      try {
        await navigator.clipboard.writeText(room.url);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } catch (err) {
        console.error("Failed to copy URL:", err);
      }
    }
  };

  const goBack = () => {
    router.push('/app');
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading Room - Blubb.</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className={styles.container}>
          <Header user={user} />
          <section className={styles.hero}>
            <motion.div
              className={roomStyles.loadingContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.h1 className={roomStyles.loadingTitle}>
                Loading Room... ⏳
              </motion.h1>
              <motion.p className={roomStyles.loadingSubtext}>
                Getting everything ready for you!
              </motion.p>
            </motion.div>
          </section>
        </div>
      </>
    );
  }

  if (!room) {
    return (
      <>
        <Head>
          <title>Room Not Found - Blubb.</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className={styles.container}>
          <Header user={user} />
          
          {/* Demo Mode Indicator */}
          {DEMO_MODE && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#86efac',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                zIndex: 1000
              }}
            >
              🧪 Demo Mode
            </motion.div>
          )}

          <section className={styles.hero}>
            <motion.div
              className={roomStyles.errorContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.h1 className={roomStyles.errorTitle}>
                Room Not Found 😔
              </motion.h1>
              <motion.p className={roomStyles.errorSubtext}>
                {error || "This room might have ended or the link is incorrect."}
              </motion.p>
              <motion.div>
                <Link href="/app">
                  <motion.button
                    className={styles.primaryButton}
                    {...scaleOnHover}
                  >
                    Back to Home
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{room.name} - Blubb.</title>
        <meta
          name="description"
          content={room.description || "Join this audio room conversation"}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <Header user={user} />
        
        {/* Demo Mode Indicator */}
        {DEMO_MODE && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              background: 'rgba(34, 197, 94, 0.1)',
              color: '#86efac',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              zIndex: 1000
            }}
          >
            🧪 Demo Mode
          </motion.div>
        )}

        <section className={roomStyles.hero}>
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className={roomStyles.roomContainer}
          >
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#fca5a5',
                  padding: '1rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Room Header */}
            <div className={roomStyles.roomHeader}>
              <h1 className={roomStyles.roomTitle}>{room.name}</h1>
              <p className={roomStyles.roomDescription}>
                {room.description || "No description provided"}
              </p>
              <div style={{ 
                fontSize: '0.85rem', 
                color: 'rgba(255, 255, 255, 0.6)', 
                marginTop: '0.5rem' 
              }}>
                Created {formatTimeAgo(room.createdAt)} • Room ID: {room.id}
              </div>
            </div>

            {/* Host Section */}
            {room.creator && (
              <div className={roomStyles.hostSection}>
                <img
                  src={room.creator.profile || user.image}
                  alt={room.creator.name}
                  className={roomStyles.hostAvatar}
                />
                <div className={roomStyles.hostName}>{room.creator.name}</div>
                <div className={roomStyles.hostRole}>Host</div>
              </div>
            )}

            {/* Participants */}
            <div className={roomStyles.participantSection}>
              <div className={roomStyles.participantAvatars}>
                {/* Show online participants from WebRTC if available, otherwise show static participants */}
                {(onlineParticipants.length > 0 ? onlineParticipants : participants).slice(0, 8).map((participant) => (
                  <div key={participant.id || participant.socket_id} style={{ position: 'relative' }}>
                    <img
                      src={participant.profile || "https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg"}
                      alt={participant.name}
                      className={roomStyles.participantAvatar}
                      title={`${participant.name}${participant.is_muted ? ' (muted)' : ''}${participant.is_online ? ' (online)' : ''}`}
                      style={{
                        opacity: participant.is_online === false ? 0.6 : 1,
                        border: participant.is_online ? '2px solid #22c55e' : '2px solid transparent'
                      }}
                    />
                    {/* Online indicator */}
                    {participant.is_online && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        border: '2px solid white'
                      }} />
                    )}
                    {/* Mute indicator */}
                    {participant.is_muted && (
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <MicOff size={10} color="white" />
                      </div>
                    )}
                  </div>
                ))}
                {/* Show overflow count */}
                {(onlineParticipants.length > 0 ? onlineParticipants : participants).length > 8 && (
                  <div className={roomStyles.participantOverflow}>
                    +{(onlineParticipants.length > 0 ? onlineParticipants : participants).length - 8}
                  </div>
                )}
                
                {/* Refresh button for participants */}
                {isUserInRoom && onlineParticipants.length > 0 && (
                  <motion.button
                    onClick={refreshParticipants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '2px dashed rgba(255, 255, 255, 0.3)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      marginLeft: '8px'
                    }}
                    title="Refresh participants"
                  >
                    🔄
                  </motion.button>
                )}
              </div>
              
              {/* Participants info */}
              {isUserInRoom && onlineParticipants.length > 0 && (
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'center'
                }}>
                  {onlineParticipants.length} online participant{onlineParticipants.length !== 1 ? 's' : ''}
                  {connectedPeers > 0 && ` • ${connectedPeers} audio connected`}
                </div>
              )}
            </div>

            {/* Room Stats */}
            <div className={roomStyles.roomStats}>
              <div className={roomStyles.statItem}>
                <span className={roomStyles.statLabel}>Participants</span>
                <span className={roomStyles.statValue}>
                  {isUserInRoom && onlineParticipants.length > 0 
                    ? `${onlineParticipants.length}/${room.maxParticipants}`
                    : `${room.participantsCount}/${room.maxParticipants}`
                  }
                </span>
              </div>
              <div className={roomStyles.statItem}>
                <span className={roomStyles.statLabel}>Status</span>
                <span className={roomStyles.statValue} style={{
                  color: roomUtils.getRoomStatus(room) === 'active' ? '#22c55e' : 
                        roomUtils.getRoomStatus(room) === 'waiting' ? '#f59e0b' : '#6b7280'
                }}>
                  {roomUtils.getRoomStatus(room) === 'active' ? 'Active' :
                   roomUtils.getRoomStatus(room) === 'waiting' ? 'Waiting' :
                   roomUtils.getRoomStatus(room) === 'full' ? 'Full' : 'Empty'}
                </span>
              </div>
            </div>

            {/* Join/Leave Room */}
            {!isUserInRoom ? (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <motion.button
                  onClick={handleJoinRoom}
                  disabled={isJoining || room.isFull}
                  className={styles.primaryButton}
                  {...scaleOnHover}
                  style={{
                    opacity: (isJoining || room.isFull) ? 0.6 : 1,
                    cursor: (isJoining || room.isFull) ? 'not-allowed' : 'pointer',
                    padding: '1rem 2rem',
                    fontSize: '1rem'
                  }}
                >
                  {isJoining ? 'Joining...' : room.isFull ? 'Room is Full' : 'Join Room'}
                </motion.button>
                {room.isFull && (
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    fontSize: '0.875rem', 
                    marginTop: '0.5rem' 
                  }}>
                    This room has reached its maximum capacity
                  </p>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#86efac',
                  padding: '1rem',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                  ✅ You're in this room!
                </div>
                
                {/* Audio Connection Status */}
                <div style={{
                  background: meshStatus === 'connected' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: meshStatus === 'connected' ? '#86efac' : '#fbbf24',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  border: `1px solid ${meshStatus === 'connected' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  {meshStatus === 'connected' ? <Wifi size={16} /> : <WifiOff size={16} />}
                  Audio: {meshStatus} {connectedPeers > 0 && `• ${connectedPeers} peers connected`}
                </div>
              </div>
            )}

            {/* Share Room */}
            <div className={roomStyles.shareSection}>
              <label className={roomStyles.shareLabel}>Invite Others</label>
              <div className={roomStyles.shareContainer}>
                <input
                  type="text"
                  value={room.url}
                  readOnly
                  className={roomStyles.shareInput}
                />
                <motion.button
                  onClick={copyRoomUrl}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${roomStyles.copyButton} ${
                    copiedUrl ? roomStyles.copied : roomStyles.normal
                  }`}
                >
                  {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
                  {copiedUrl ? "Copied!" : "Copy"}
                </motion.button>
              </div>
            </div>

            {/* Status */}
            <div className={roomStyles.roomStatus}>
              <div className={roomStyles.tipCard}>
                💡 Tip: Share the room link with friends to invite them to join
                the conversation!
              </div>
            </div>
          </motion.div>
        </section>

        {/* Audio Controls */}
        {isUserInRoom && (
          <div className={roomStyles.controlsbottm}>
            <div className={roomStyles.audioControls}>
              <motion.button
                className={roomStyles.moreButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Volume Controls"
              >
                <Volume2 size={24} />
              </motion.button>

              <motion.button
                onClick={toggleMute}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${roomStyles.micButton} ${
                  muted ? roomStyles.muted : roomStyles.unmuted
                }`}
                title={muted ? "Unmute microphone" : "Mute microphone"}
              >
                {muted ? <MicOff size={24} /> : <Mic size={24} />}
              </motion.button>

              <motion.button
                onClick={handleLeaveRoom}
                disabled={isLeaving}
                className={roomStyles.leaveButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  opacity: isLeaving ? 0.6 : 1,
                  cursor: isLeaving ? 'not-allowed' : 'pointer'
                }}
                title="Leave room"
              >
                {isLeaving ? <ArrowLeft size={24} /> : <LogOut size={24} />}
              </motion.button>
            </div>
            
            {/* Connection info */}
            {meshStatus && (
              <div style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '0.5rem'
              }}>
                {meshStatus === 'connected' && connectedPeers > 0 && 
                  `Connected to ${connectedPeers} participant${connectedPeers !== 1 ? 's' : ''}`}
                {meshStatus === 'connecting' && 'Connecting to audio...'}
                {meshStatus.includes('error') && 'Audio connection failed'}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
