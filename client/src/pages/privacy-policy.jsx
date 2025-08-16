import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import Header from './app/components/Header';
import styles from '../styles/App.module.css';

export default function PrivacyPolicy() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <>
      <Head>
        <title>Privacy Policy - Blubb.</title>
        <meta name="description" content="Learn how we protect your privacy" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        <Header 
          showBackButton={true}
          backButtonText={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={20} />
              Back to App
            </div>
          }
          backButtonHref="/app"
        />

        <section className={styles.hero}>
          <motion.div 
            className={styles.heroContent}
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            style={{ paddingTop: '2rem', maxWidth: '800px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
              <Shield size={32} color="rgba(255, 107, 8, 1)" />
              <motion.h1 className={styles.headline} style={{ margin: 0, fontSize: '2.5rem' }}>
                Privacy Policy
              </motion.h1>
            </div>
            
            <motion.div 
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                padding: '2rem', 
                borderRadius: '16px',
                textAlign: 'left',
                lineHeight: '1.6'
              }}
            >
              <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem' }}>
                <section style={{ marginBottom: '2rem' }}>
                  <h2 style={{ color: 'rgba(255, 107, 8, 1)', marginBottom: '1rem' }}>Data Collection</h2>
                  <p style={{ marginBottom: '1rem' }}>
                    At Blubb, we collect only the information necessary to provide you with the best audio room experience. 
                    This includes your profile information, room participation data, and usage analytics to improve our service.
                  </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                  <h2 style={{ color: 'rgba(255, 107, 8, 1)', marginBottom: '1rem' }}>How We Use Your Data</h2>
                  <p style={{ marginBottom: '1rem' }}>
                    Your data is used to personalize your experience, facilitate connections with other users, 
                    and improve our platform. We never sell your personal information to third parties.
                  </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                  <h2 style={{ color: 'rgba(255, 107, 8, 1)', marginBottom: '1rem' }}>Audio Data</h2>
                  <p style={{ marginBottom: '1rem' }}>
                    Audio conversations in rooms are not recorded or stored unless explicitly requested by room participants. 
                    All audio data is processed in real-time and discarded after the session ends.
                  </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                  <h2 style={{ color: 'rgba(255, 107, 8, 1)', marginBottom: '1rem' }}>Data Security</h2>
                  <p style={{ marginBottom: '1rem' }}>
                    We employ industry-standard encryption and security measures to protect your data. 
                    Your information is stored securely and accessed only by authorized personnel when necessary.
                  </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                  <h2 style={{ color: 'rgba(255, 107, 8, 1)', marginBottom: '1rem' }}>Your Rights</h2>
                  <p style={{ marginBottom: '1rem' }}>
                    You have the right to access, modify, or delete your personal data at any time. 
                    Contact us at privacy@blubb.app for any data-related requests or concerns.
                  </p>
                </section>

                <section>
                  <h2 style={{ color: 'rgba(255, 107, 8, 1)', marginBottom: '1rem' }}>Contact Us</h2>
                  <p style={{ marginBottom: '1rem' }}>
                    If you have any questions about this Privacy Policy, please contact us at privacy@blubb.app 
                    or through our in-app support system.
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </section>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </>
  );
} 