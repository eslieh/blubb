import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ExternalLink, Users, Search, AlertCircle } from 'lucide-react';
import Header from './components/Header';
import styles from '../../styles/App.module.css';
import formStyles from './components/ModernForm.module.css';
import typography from './components/Typography.module.css';
import { isAuthenticated, getUserData } from '@/utils/auth';
import { roomsApi, roomUtils, apiErrors } from '@/utils/api';
import { demoRoomsApi, DEMO_MODE } from '@/utils/demo';

export default function Join() {
  const [roomInput, setRoomInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth');
      return;
    }
    
    const userData = getUserData();
    if (userData) {
      setUser({
        name: userData.name,
        image: userData.profile || "https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg"
      });
    }
  }, [router]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleOnHover = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  };

  // Extract room ID from URL or use direct room ID
  const extractRoomId = (input) => {
    const trimmedInput = input.trim();
    
    // If it's a full URL
    if (trimmedInput.includes('/room/')) {
      const roomIdMatch = trimmedInput.match(/\/room\/([a-zA-Z0-9]+)/);
      return roomIdMatch ? roomIdMatch[1] : null;
    }
    
    // If it's just a room ID (alphanumeric string)
    if (/^[a-zA-Z0-9]+$/.test(trimmedInput)) {
      return trimmedInput;
    }
    
    return null;
  };

  const validateRoomId = (roomId) => {
    // Basic validation - room ID should be alphanumeric and reasonable length
    return roomId && roomId.length >= 1 && roomId.length <= 50 && /^[a-zA-Z0-9]+$/.test(roomId);
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!roomInput.trim()) {
      setError('Please enter a room URL or ID');
      return;
    }

    setError('');
    setIsJoining(true);

    try {
      const roomId = extractRoomId(roomInput);
      
      if (!roomId || !validateRoomId(roomId)) {
        setError('Invalid room URL or ID. Please check and try again.');
        setIsJoining(false);
        return;
      }

      // First, check if the room exists
      let roomCheckResult;
      if (DEMO_MODE) {
        roomCheckResult = await demoRoomsApi.getRoomDetails(roomId);
      } else {
        roomCheckResult = await roomsApi.getRoomDetails(roomId);
      }

      if (!roomCheckResult.success) {
        if (roomCheckResult.error.includes('not found') || roomCheckResult.error.includes('404')) {
          setError('Room not found. Please check the room ID and try again.');
        } else {
          setError(apiErrors.parseError(roomCheckResult.error));
        }
        setIsJoining(false);
        return;
      }

      const room = roomCheckResult.data.room;

      // Check if room is joinable
      if (!roomUtils.isRoomJoinable(room)) {
        setError('This room is currently full. Please try again later.');
        setIsJoining(false);
        return;
      }

      // Try to join the room
      let joinResult;
      if (DEMO_MODE) {
        joinResult = await demoRoomsApi.joinRoom(roomId);
      } else {
        joinResult = await roomsApi.joinRoom(roomId);
      }

      if (joinResult.success) {
        // Successfully joined, redirect to the room
        router.push(`/app/room/${roomId}`);
      } else {
        setError(apiErrors.parseError(joinResult.error));
        setIsJoining(false);
      }

    } catch (error) {
      console.error('Join room error:', error);
      setError('Failed to join room. Please try again.');
      setIsJoining(false);
    }
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className={styles.container}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Join Room - Blubb.</title>
        <meta name="description" content="Join an existing audio room and connect with others" />
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
            className={styles.heroContent}
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            <motion.h1 
              variants={fadeInUp}
              className={typography.modernHeadline}
            >
              Join a Room 🏠
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className={typography.modernSubtext}
            >
              Got an invite? Drop the link or room ID below and let's get this conversation started! ✨
            </motion.p>
            
            <motion.form 
              onSubmit={handleJoinRoom}
              variants={fadeInUp}
              className={formStyles.modernCard}
            >
              <div className={formStyles.formGroup}>
                <label className={formStyles.formLabel}>
                  Room URL or ID
                </label>
                <div className={formStyles.inputWithIcon}>
                  <input
                    type="text"
                    value={roomInput}
                    onChange={(e) => {
                      setRoomInput(e.target.value);
                      setError(''); // Clear error when user types
                    }}
                    placeholder="https://blubb.app/room/abc123 or just abc123"
                    disabled={isJoining}
                    className={`${formStyles.modernInputWithIcon} ${error ? formStyles.error : ''}`}
                  />
                  <Search 
                    size={18} 
                    className={formStyles.inputIcon}
                  />
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={formStyles.errorMessage}
                  >
                    <AlertCircle size={16} />
                    {error}
                  </motion.div>
                )}
              </div>

              {/* Demo hint */}
              {DEMO_MODE && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#93c5fd',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    marginBottom: '1rem',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}
                >
                  💡 Demo rooms available: Try ID "1" or "2"
                </motion.div>
              )}

              <motion.button
                type="submit"
                className={`${styles.primaryButton} ${formStyles.primaryButton}`}
                disabled={isJoining || !roomInput.trim()}
                {...scaleOnHover}
                style={{ 
                  opacity: (!roomInput.trim() || isJoining) ? 0.6 : 1,
                  cursor: (!roomInput.trim() || isJoining) ? 'not-allowed' : 'pointer'
                }}
              >
                {isJoining ? (
                  'Joining Room...'
                ) : (
                  <>
                    <ExternalLink size={16} />
                    Join Room
                  </>
                )}
              </motion.button>
            </motion.form>

            <motion.div 
              variants={fadeInUp}
              className={formStyles.infoCard}
            >
              <div className={formStyles.infoCardContent}>
                <h3 className={formStyles.infoTitle}>
                  How to Join:
                </h3>
                <div className={formStyles.infoList}>
                  <p>• Paste the full room URL someone shared with you</p>
                  <p>• Or just enter the room ID (the part after /room/)</p>
                  <p>• Hit join and start vibing! 🎵</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className={formStyles.callToAction}
            >
              <p className={formStyles.callToActionText}>
                Don't have a room to join?
              </p>
              <Link href="/app/create">
                <motion.button
                  className={`${styles.secondaryButton} ${formStyles.callToActionButton}`}
                  {...scaleOnHover}
                >
                  <Users size={16} />
                  Create Your Own Room
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </>
  );
}