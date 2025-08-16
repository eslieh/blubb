import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { Mail, ArrowLeft, Eye, EyeOff, User, AlertCircle, CheckCircle } from "lucide-react";
import styles from "@/styles/Auth.module.css";
import { redirectToGoogleAuth, handleAuthCallback, isAuthenticated, signInWithEmail, signUpWithEmail } from "@/utils/auth";
import { demoRedirectToGoogleAuth, demoSignInWithEmail, demoSignUpWithEmail, DEMO_MODE } from "@/utils/demo";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Handle authentication callback on component mount
  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      router.push('/app');
      return;
    }

    // Handle auth callback from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token')) {
      setIsProcessingAuth(true);
      const userData = handleAuthCallback(urlParams);
      
      if (userData) {
        // Clear URL parameters and redirect to app
        window.history.replaceState({}, document.title, '/auth');
        router.push('/app');
      } else {
        setIsProcessingAuth(false);
        console.error('Failed to process authentication callback');
      }
    }
  }, [router]);

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
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // For signup, validate name and confirm password
    if (!isLogin) {
      if (!name.trim()) {
        setError('Please enter your name');
        return false;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let result;
      
      if (DEMO_MODE) {
        // Use demo functions
        if (isLogin) {
          result = await demoSignInWithEmail(formData.email, formData.password);
        } else {
          result = await demoSignUpWithEmail(formData.name, formData.email, formData.password);
        }
      } else {
        // Use real API functions
        if (isLogin) {
          result = await signInWithEmail(formData.email, formData.password);
        } else {
          result = await signUpWithEmail(formData.name, formData.email, formData.password);
        }
      }

      if (result.success) {
        setSuccess(isLogin ? 'Sign-in successful! Redirecting...' : 'Account created successfully! Redirecting...');
        
        // Redirect to app after a brief success message
        setTimeout(() => {
          router.push('/app');
        }, 1500);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Authentication error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    if (DEMO_MODE) {
      demoRedirectToGoogleAuth();
    } else {
      redirectToGoogleAuth();
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  // Show loading state during auth processing
  if (isProcessingAuth) {
    return (
      <>
        <Head>
          <title>Authenticating... - Blubb.</title>
          <meta name="description" content="Processing your authentication..." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.png" />
        </Head>

        <div className={styles.container}>
          <motion.div 
            className={styles.authCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.header}>
              <div className={styles.logoSection}>
                <h1 className={styles.logo}>Blubb.</h1>
                <h2 className={styles.title}>Signing you in...</h2>
                <p className={styles.subtitle}>Please wait while we complete your authentication</p>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #ff6b08',
                  borderRadius: '50%',
                  margin: '0 auto'
                }}
              />
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{isLogin ? 'Welcome Back' : 'Join Blubb.'} - Start Your Journey</title>
        <meta name="description" content="Join thousands of people having meaningful conversations on Blubb.." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className={styles.container}>
        <motion.div 
          className={styles.authCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Demo Mode Indicator */}
          {DEMO_MODE && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#86efac',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                textAlign: 'center',
                marginBottom: '1rem',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}
            >
              🧪 Demo Mode - No backend required
            </motion.div>
          )}

          {/* Header */}
          <motion.div className={styles.header} variants={fadeInUp}>
            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={16} />
              <span>Back to home</span>
            </Link>
            
            <div className={styles.logoSection}>
              <h1 className={styles.logo}>Blubb.</h1>
              <h2 className={styles.title}>
                {isLogin ? "Welcome back" : "Join the conversation"}
              </h2>
              <p className={styles.subtitle}>
                {isLogin 
                  ? "Sign in to continue to your account"
                  : "Create your account to get started"
                }
                {DEMO_MODE && (
                  <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.85rem', color: '#86efac' }}>
                    Demo mode is active - try any email/password
                  </span>
                )}
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
                onClick={handleGoogleAuth}
              >
                <GoogleIcon />
                Continue with Google
                {DEMO_MODE && <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>(Demo)</span>}
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
                  onClick={toggleAuthMode}
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
                  💡 Try these test scenarios:<br/>
                  • <code>error@test.com</code> - Invalid credentials<br/>
                  • <code>existing@test.com</code> - Email already exists (signup)<br/>
                  • Any other email works fine
                </motion.div>
              )}

              {/* Success/Error Messages */}
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${styles.message} ${success ? styles.success : styles.error}`}
                >
                  {success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{success || error}</span>
                </motion.div>
              )}

              {/* Name field (only for signup) */}
              {!isLogin && (
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                    disabled={isSubmitting}
                  />
                  <User size={18} className={styles.inputIcon} />
                </div>
              )}

              {/* Email field */}
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                  disabled={isSubmitting}
                />
                <Mail size={18} className={styles.inputIcon} />
              </div>

              {/* Password field */}
              <div className={styles.inputGroup}>
                <div className={styles.passwordInput}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.eyeButton}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field (only for signup) */}
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
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={styles.eyeButton}
                      disabled={isSubmitting}
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
                disabled={isSubmitting}
                style={{
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting 
                  ? (isLogin ? 'Signing in...' : 'Creating account...') 
                  : (isLogin ? "Sign in" : "Create account")
                }
              </motion.button>

              <button 
                type="button"
                onClick={() => {
                  setShowEmailForm(false);
                  setError('');
                  setSuccess('');
                }}
                className={styles.backToOptions}
                disabled={isSubmitting}
              >
                <ArrowLeft size={14} />
                Back to options
              </button>

              {/* Toggle auth mode within form */}
              <div className={styles.inlineToggle}>
                <span>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button 
                  type="button"
                  onClick={toggleAuthMode}
                  className={styles.toggleButton}
                  disabled={isSubmitting}
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </div>
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