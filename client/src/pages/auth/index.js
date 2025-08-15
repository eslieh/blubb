import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Head from "next/head";
import { Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import styles from "@/styles/Auth.module.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const scaleOnHover = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Auth submission:', formData);
  };

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <>
      <Head>
        <title>{isLogin ? 'Welcome Back' : 'Join Blubb'} - Start Your Journey</title>
        <meta name="description" content="Join thousands of people having meaningful conversations on Blubb." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <motion.div 
          className={styles.authCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <motion.div className={styles.header} variants={fadeInUp}>
            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={16} />
              <span>Back to home</span>
            </Link>
            
            <div className={styles.logoSection}>
              <h1 className={styles.logo}>Blubb</h1>
              <h2 className={styles.title}>
                {isLogin ? "Welcome back" : "Join the conversation"}
              </h2>
              <p className={styles.subtitle}>
                {isLogin 
                  ? "Sign in to continue to your account"
                  : "Create your account to get started"
                }
              </p>
            </div>
          </motion.div>

          {/* Auth Options */}
          {!showEmailForm ? (
            <motion.div 
              className={styles.authOptions}
              initial="initial"
              animate="animate"
            >
              {/* Google Signup */}
              <motion.button 
                className={styles.googleButton}
                variants={fadeInUp}
                {...scaleOnHover}
                onClick={() => console.log('Google auth')}
              >
                <GoogleIcon />
                Continue with Google
              </motion.button>

              {/* Divider */}
              <motion.div className={styles.divider} variants={fadeInUp}>
                <span>or</span>
              </motion.div>

              {/* Email Option */}
              <motion.button 
                className={styles.emailButton}
                variants={fadeInUp}
                {...scaleOnHover}
                onClick={() => setShowEmailForm(true)}
              >
                <Mail size={18} />
                Continue with email
              </motion.button>

              {/* Toggle Login/Signup */}
              <motion.div className={styles.toggleAuth} variants={fadeInUp}>
                <span>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className={styles.toggleButton}
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </motion.div>
            </motion.div>
          ) : (
            /* Email Form */
            <motion.form 
              className={styles.emailForm}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.passwordInput}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.eyeButton}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className={styles.inputGroup}>
                  <div className={styles.passwordInput}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={styles.input}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={styles.eyeButton}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <motion.button 
                type="submit"
                className={styles.submitButton}
                {...scaleOnHover}
              >
                {isLogin ? "Sign in" : "Create account"}
              </motion.button>

              <button 
                type="button"
                onClick={() => setShowEmailForm(false)}
                className={styles.backToOptions}
              >
                <ArrowLeft size={14} />
                Back to options
              </button>
            </motion.form>
          )}

          {/* Footer */}
          <motion.div className={styles.footer} variants={fadeInUp}>
            <p>
              By continuing, you agree to our{" "}
              <Link href="/terms" className={styles.link}>Terms of Service</Link> and{" "}
              <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
} 