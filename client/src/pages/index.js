import Head from "next/head";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

export default function Home() {
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
        <title>Blubb. - Where vibes meet and magic happens ✨</title>
        <meta name="description" content="Drop into rooms, share your energy, and connect with your people in real time. It's giving main character energy." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <motion.div 
            className={styles.heroContent}
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            <motion.div className={styles.logoSection} variants={fadeInUp}>
              <div className={styles.logo}>Blubb.</div>
            </motion.div>
            
            <motion.h1 className={styles.headline} variants={fadeInUp}>
              Your voice, your vibe, <br />your digital playground ✨
            </motion.h1>
            
            <motion.p className={styles.subtext} variants={fadeInUp}>
              Drop into audio rooms where the conversations hit different. No cap, just real talks with your tribe 💯
            </motion.p>
            
            <motion.div className={styles.heroButtons} variants={fadeInUp}>
              <Link href="/auth">
                <motion.button 
                  className={styles.primaryButton}
                  {...scaleOnHover}
                >
                  Let's Go 🚀
                </motion.button>
              </Link>
            </motion.div>
            
            <div className={styles.floatingAvatars}>
              <motion.div 
                className={styles.avatar} 
                style={{top: '20%', left: '10%'}}
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                😎
              </motion.div>
              <motion.div 
                className={styles.avatar} 
                style={{top: '60%', right: '15%'}}
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -3, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                🤳
              </motion.div>
              <motion.div 
                className={styles.avatar} 
                style={{top: '80%', left: '20%'}}
                animate={{ 
                  y: [0, -25, 0],
                  rotate: [0, 4, 0]
                }}
                transition={{ 
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              >
                💫
              </motion.div>
              <motion.div 
                className={styles.avatar} 
                style={{top: '30%', right: '25%'}}
                animate={{ 
                  y: [0, -18, 0],
                  rotate: [0, -2, 0]
                }}
                transition={{ 
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                🎤
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* How it Works */}
        <motion.section 
          className={styles.howItWorks}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How We Roll 🎯
          </motion.h2>
          <motion.div 
            className={styles.steps}
            initial="initial"
            whileInView="animate"
            variants={staggerChildren}
            viewport={{ once: true }}
          >
            <motion.div className={styles.step} variants={fadeInUp} whileHover={{ y: -10 }}>
              <div className={styles.stepIcon}>🔍</div>
              <h3>Find Your Spot</h3>
              <p>Browse rooms that match your energy. Main character moment incoming 💅</p>
            </motion.div>
            <motion.div className={styles.step} variants={fadeInUp} whileHover={{ y: -10 }}>
              <div className={styles.stepIcon}>🎙️</div>
              <h3>Jump In</h3>
              <p>Speak your truth, react with emojis, or just vibe and listen. You do you bestie ✨</p>
            </motion.div>
            <motion.div className={styles.step} variants={fadeInUp} whileHover={{ y: -10 }}>
              <div className={styles.stepIcon}>🤝</div>
              <h3>Build Your Circle</h3>
              <p>Follow the ones who get it. Create your own digital family fr 💯</p>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Social Proof */}
        <motion.section 
          className={styles.socialProof}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className={styles.liveStats}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className={styles.liveIndicator}>🔥</span>
            <span className={styles.liveText}>1,204 people living their best life rn</span>
          </motion.div>
          
          <motion.div 
            className={styles.testimonials}
            initial="initial"
            whileInView="animate"
            variants={staggerChildren}
            viewport={{ once: true }}
          >
            <motion.div className={styles.testimonial} variants={fadeInUp} whileHover={{ y: -5 }}>
              <div className={styles.testimonialAvatar}>😌</div>
              <p>"Found my business bestie here and we're absolutely thriving! 💼✨"</p>
            </motion.div>
            <motion.div className={styles.testimonial} variants={fadeInUp} whileHover={{ y: -5 }}>
              <div className={styles.testimonialAvatar}>😂</div>
              <p>"The conversations here are UNMATCHED. Pure serotonin every time 🥺"</p>
            </motion.div>
            <motion.div className={styles.testimonial} variants={fadeInUp} whileHover={{ y: -5 }}>
              <div className={styles.testimonialAvatar}>🤓</div>
              <p>"This app understood the assignment. Period. 📱💯"</p>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Final CTA */}
        <motion.section 
          className={styles.finalCTA}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className={styles.ctaHeadline}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Your main character era starts now 💫
          </motion.h2>
          <Link href="/auth">
            <motion.button 
              className={styles.primaryButton}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              {...scaleOnHover}
            >
              Join the Vibe ✨
            </motion.button>
          </Link>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          className={styles.footer}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className={styles.footerLinks}>
            <motion.a 
              href="#about"
              whileHover={{ color: "#ff6b08" }}
              transition={{ duration: 0.2 }}
            >
              The Tea ☕
            </motion.a>
            <motion.a 
              href="#help"
              whileHover={{ color: "#ff6b08" }}
              transition={{ duration: 0.2 }}
            >
              Need Help? 💬
            </motion.a>
            <motion.a 
              href="#terms"
              whileHover={{ color: "#ff6b08" }}
              transition={{ duration: 0.2 }}
            >
              The Rules 📋
            </motion.a>
            <motion.a 
              href="#privacy"
              whileHover={{ color: "#ff6b08" }}
              transition={{ duration: 0.2 }}
            >
              Privacy Bestie 🔒
            </motion.a>
          </div>
        </motion.footer>
      </div>
    </>
  );
}
