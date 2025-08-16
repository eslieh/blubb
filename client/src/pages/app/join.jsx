import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ExternalLink, Users, Search, AlertCircle } from 'lucide-react';
import Header from './components/Header';
import styles from '../../styles/App.module.css';
import formStyles from './components/ModernForm.module.css';
import typography from './components/Typography.module.css';

export default function Join() {
  const [roomInput, setRoomInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const user = {
    name: "Victor",
    email: "victor@blubb.app",
    image: "https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg"
  };

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
    return roomId && roomId.length >= 5 && roomId.length <= 50 && /^[a-zA-Z0-9]+$/.test(roomId);
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomInput.trim()) {
      setError('Please enter a room URL or ID');
      return;
    }

    setError('');
    setIsJoining(true);

    const roomId = extractRoomId(roomInput);
    
    if (!roomId || !validateRoomId(roomId)) {
      setError('Invalid room URL or ID. Please check and try again.');
      setIsJoining(false);
      return;
    }

    // Simulate checking if room exists
    setTimeout(() => {
      // In a real app, you'd check if the room exists
      // For now, we'll assume all valid format room IDs exist
      router.push(`/app/room/${roomId}`);
    }, 1000);
  };

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