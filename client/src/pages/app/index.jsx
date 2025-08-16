import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Users, Plus, ExternalLink, Clock, MessageCircle } from 'lucide-react';
import Header from './components/Header';
import styles from '../../styles/App.module.css';
import typography from './components/Typography.module.css';
import { isAuthenticated, getUserData } from '@/utils/auth';
import { roomsApi, roomUtils, apiErrors } from '@/utils/api';
import { demoRoomsApi, DEMO_MODE } from '@/utils/demo';

export default function Home() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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

    // Load user's rooms
    loadRooms();
  }, [router]);

  const loadRooms = async () => {
    setIsLoading(true);
    setError('');

    try {
      let result;
      if (DEMO_MODE) {
        result = await demoRoomsApi.getRooms();
      } else {
        result = await roomsApi.getRooms();
      }

      if (result.success) {
        const formattedRooms = result.data.rooms.map(room => roomUtils.formatRoom(room));
        setRooms(formattedRooms);
      } else {
        setError(apiErrors.parseError(result.error));
      }
    } catch (error) {
      console.error('Load rooms error:', error);
      setError('Failed to load rooms. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'waiting': return '#f59e0b';
      case 'full': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRoomStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'waiting': return 'Waiting';
      case 'full': return 'Full';
      case 'empty': return 'Empty';
      default: return 'Unknown';
    }
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
        <title>Blubb. - Where vibes meet and magic happens ✨</title>
        <meta name="description" content="Drop into rooms, share your energy, and connect with your people in real time. It's giving main character energy." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
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

        {/* Hero Section */}
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
              Hello, <br />{user?.name || 'Friend'} ✨
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className={typography.modernSubtextWide}
            >
              Drop into audio rooms where the conversations hit different. No cap, just real talks with your tribe 💯
            </motion.p>
            
            <motion.div 
              className={styles.heroButtons} 
              variants={fadeInUp}
              style={{ marginBottom: '2rem' }}
            >
              <Link href="/app/create">
                <motion.button 
                  className={styles.primaryButton}
                  {...scaleOnHover}
                  style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}
                >
                  <Plus size={18} />
                  Create Room 🚀
                </motion.button>
              </Link>
              
              <Link href="/app/join">
                <motion.button 
                  className={styles.secondaryButton}
                  {...scaleOnHover}
                  style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}
                >
                  <ExternalLink size={18} />
                  Join a Room 🏠
                </motion.button>
              </Link>
            </motion.div>

            {/* Your Rooms Section */}
            <motion.div variants={fadeInUp} style={{ marginTop: '3rem', width: '100%' }}>
              <h2 style={{ 
                color: '#fff', 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Your Rooms
              </h2>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#fca5a5',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}
                >
                  {error}
                  <button 
                    onClick={loadRooms}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fca5a5',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      marginLeft: '0.5rem'
                    }}
                  >
                    Retry
                  </button>
                </motion.div>
              )}

              {isLoading ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  padding: '2rem',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  Loading your rooms...
                </div>
              ) : rooms.length > 0 ? (
                <motion.div 
                  style={{ 
                    display: 'grid', 
                    gap: '1rem',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    maxWidth: '1000px',
                    margin: '0 auto'
                  }}
                  variants={staggerChildren}
                >
                  {rooms.map((room) => (
                    <motion.div
                      key={room.id}
                      variants={fadeInUp}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => router.push(`/app/room/${room.id}`)}
                    >
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h3 style={{ 
                            color: '#fff', 
                            fontSize: '1.1rem', 
                            fontWeight: '600',
                            margin: 0,
                            flex: 1
                          }}>
                            {room.name}
                          </h3>
                          <span style={{
                            background: getRoomStatusColor(roomUtils.getRoomStatus(room)),
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            marginLeft: '0.5rem'
                          }}>
                            {getRoomStatusText(roomUtils.getRoomStatus(room))}
                          </span>
                        </div>
                        {room.description && (
                          <p style={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            fontSize: '0.9rem',
                            margin: '0.5rem 0',
                            lineHeight: '1.4'
                          }}>
                            {room.description}
                          </p>
                        )}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.6)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Users size={14} />
                            {room.participantsCount}/{room.maxParticipants}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={14} />
                            {formatTimeAgo(room.createdAt)}
                          </span>
                        </div>
                        <ExternalLink size={16} style={{ opacity: 0.5 }} />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  variants={fadeInUp}
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <MessageCircle size={48} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '1rem' }} />
                  <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No rooms yet</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
                    Create your first room or join an existing one to get started
                  </p>
                  {/* <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/app/create">
                      <motion.button 
                        className={styles.primaryButton}
                        {...scaleOnHover}
                        style={{ padding: '0.75rem 1.5rem' }}
                      >
                        <Plus size={16} />
                        Create Room
                      </motion.button>
                    </Link>
                    <Link href="/app/join">
                      <motion.button 
                        className={styles.secondaryButton}
                        {...scaleOnHover}
                        style={{ padding: '0.75rem 1.5rem' }}
                      >
                        <ExternalLink size={16} />
                        Join Room
                      </motion.button>
                    </Link>
                  </div> */}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </section>
      </div>
    </>
  );
}       