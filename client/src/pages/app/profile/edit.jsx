import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Camera } from 'lucide-react';
import Header from '../components/Header';
import styles from '../../../styles/App.module.css';

export default function EditProfile() {
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

  return (
    <>
      <Head>
        <title>Edit Profile - Blubb.</title>
        <meta name="description" content="Update your profile information" />
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
            variants={fadeInUp}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <Link href="/app" style={{ color: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center' }}>
                <ArrowLeft size={20} />
              </Link>
              <motion.h1 className={styles.headline} style={{ margin: 0, fontSize: '2.5rem' }}>
                Edit Profile
              </motion.h1>
            </div>
            
            <motion.div 
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                padding: '2rem', 
                borderRadius: '16px',
                maxWidth: '500px',
                margin: '0 auto'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={user.image} 
                    alt="Profile" 
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      border: '3px solid rgba(255, 107, 8, 0.3)'
                    }} 
                  />
                  <button style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    background: 'rgba(255, 107, 8, 1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '35px',
                    height: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <Camera size={16} color="white" />
                  </button>
                </div>
              </div>

              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    <User size={16} />
                    Name
                  </label>
                  <input 
                    type="text" 
                    defaultValue={user.name}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    <Mail size={16} />
                    Email
                  </label>
                  <input 
                    type="email" 
                    defaultValue={user.email}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <motion.button 
                  className={styles.primaryButton}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ marginTop: '1rem' }}
                >
                  Save Changes
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </>
  );
} 