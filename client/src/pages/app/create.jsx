import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from '../../styles/App.module.css';

export default function Create() {

    const user = {
        name: "Victor",
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

  return (
    <>
      <Head>
        <title>Blubb - Where vibes meet and magic happens ✨</title>
        <meta name="description" content="Drop into rooms, share your energy, and connect with your people in real time. It's giving main character energy." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        <section className={styles.navbar}>
          <div className={styles.logo}>Blubb</div>
          <div className={styles.profilearea}>
            <img src={user.image} className={styles.profileImage} alt="" />
          </div>
        </section>
        {/* Hero Section */}
        <section className={styles.hero}>
          <motion.div 
            className={styles.heroContent}
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            
            <motion.h1 className={styles.headline} variants={fadeInUp}>
              Hello, <br />{user?.name || null} ✨
            </motion.h1>
            
            <motion.p className={styles.subtext} variants={fadeInUp}>
              Drop into audio rooms where the conversations hit different. No cap, just real talks with your tribe 💯
            </motion.p>
            
            <motion.div className={styles.heroButtons} variants={   fadeInUp}>
              <Link href="/auth">
                <motion.button 
                  className={styles.primaryButton}
                  {...scaleOnHover}
                >
                  Let's Go 🚀
                </motion.button>
              </Link>
              
              <Link href="/about">
                <motion.button 
                  className={styles.secondaryButton}
                  {...scaleOnHover}
                >
                  Learn More 🌟
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </>
  );
}       