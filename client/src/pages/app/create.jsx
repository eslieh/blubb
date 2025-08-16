import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Copy, Check, Users, MessageCircle, ExternalLink } from 'lucide-react';
import Header from './components/Header';
import styles from '../../styles/App.module.css';
import formStyles from './components/ModernForm.module.css';
import typography from './components/Typography.module.css';

export default function Create() {
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [createdRoom, setCreatedRoom] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

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

  // Generate a unique room ID
  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setIsCreating(true);
    
    // Simulate room creation process
    setTimeout(() => {
      const roomId = generateRoomId();
      const newRoom = {
        id: roomId,
        name: roomName.trim(),
        description: roomDescription.trim(),
        creator: user.name,
        createdAt: new Date().toISOString(),
        url: `${window.location.origin}/app/room/${roomId}`,
        participants: 1
      };
      
      setCreatedRoom(newRoom);
      setIsCreating(false);
    }, 1500);
  };

  const copyRoomUrl = async () => {
    if (createdRoom) {
      try {
        await navigator.clipboard.writeText(createdRoom.url);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const resetForm = () => {
    setCreatedRoom(null);
    setRoomName('');
    setRoomDescription('');
    setCopiedUrl(false);
  };

  return (
    <>
      <Head>
        <title>Create Room - Blubb.</title>
        <meta name="description" content="Create your own audio room and invite friends to join the conversation" />
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
            <AnimatePresence mode="wait">
              {!createdRoom ? (
                <motion.div
                  key="create-form"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.h1 
                    variants={fadeInUp}
                    className={typography.modernHeadline}
                  >
                    Create Your Room ✨
                  </motion.h1>
                  
                  <motion.p 
                    variants={fadeInUp}
                    className={typography.modernSubtext}
                  >
                    Set up your space where conversations flow and connections grow 🚀
                  </motion.p>
                  
                  <motion.form 
                    onSubmit={handleCreateRoom}
                    variants={fadeInUp}
                    className={formStyles.modernCard}
                  >
                    <div className={formStyles.formGroup}>
                      <label className={formStyles.formLabel}>
                        Room Name *
                      </label>
                      <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="What's your room about?"
                        required
                        className={formStyles.modernInput}
                      />
                    </div>

                    <div className={formStyles.formGroupLarge}>
                      <label className={formStyles.formLabel}>
                        Description (Optional)
                      </label>
                      <textarea
                        value={roomDescription}
                        onChange={(e) => setRoomDescription(e.target.value)}
                        placeholder="Tell people what to expect..."
                        rows={3}
                        className={formStyles.modernTextarea}
                      />
                    </div>

                    <motion.button
                      type="submit"
                      className={`${styles.primaryButton} ${formStyles.primaryButton}`}
                      disabled={isCreating || !roomName.trim()}
                      {...scaleOnHover}
                      style={{ 
                        opacity: (!roomName.trim() || isCreating) ? 0.6 : 1,
                        cursor: (!roomName.trim() || isCreating) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isCreating ? 'Creating Room...' : 'Create Room 🚀'}
                    </motion.button>
                  </motion.form>
                </motion.div>
              ) : (
                <motion.div
                  key="room-created"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.h1 className={typography.modernHeadlineLarge}>
                    Room Created! 🎉
                  </motion.h1>
                  
                  <motion.div className={formStyles.resultCard}>
                    <div className={formStyles.resultHeader}>
                      <h2 className={formStyles.resultTitle}>
                        {createdRoom.name}
                      </h2>
                      {createdRoom.description && (
                        <p className={formStyles.resultDescription}>
                          {createdRoom.description}
                        </p>
                      )}
                      <div className={formStyles.resultStats}>
                        <span className={formStyles.statItem}>
                          <Users size={16} />
                          {createdRoom.participants} participant
                        </span>
                        <span className={formStyles.statItem}>
                          <MessageCircle size={16} />
                          Just created
                        </span>
                      </div>
                    </div>

                    <div className={formStyles.shareSection}>
                      <label className={formStyles.shareLabel}>
                        Room Link
                      </label>
                      <div className={formStyles.shareContainer}>
                        <input
                          type="text"
                          value={createdRoom.url}
                          readOnly
                          className={formStyles.shareInput}
                        />
                        <motion.button
                          onClick={copyRoomUrl}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`${formStyles.copyButton} ${copiedUrl ? formStyles.copied : formStyles.normal}`}
                        >
                          {copiedUrl ? <Check size={16} /> : <Copy size={16} />}
                          {copiedUrl ? 'Copied!' : 'Copy'}
                        </motion.button>
                      </div>
                    </div>

                    <div className={formStyles.buttonGroup}>
                      <Link 
                        href={`/app/room/${createdRoom.id}`}
                        className={formStyles.buttonFlex}
                      >
                        <motion.button
                          className={styles.primaryButton}
                          {...scaleOnHover}
                        >
                          <ExternalLink size={16} />
                          Join Room Now
                        </motion.button>
                      </Link>
                      
                      <motion.button
                        onClick={resetForm}
                        className={`${styles.secondaryButton} ${formStyles.buttonFlex}`}
                        {...scaleOnHover}
                      >
                        Create Another Room
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </div>
    </>
  );
}       