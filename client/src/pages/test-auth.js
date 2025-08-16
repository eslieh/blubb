import { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { redirectToGoogleAuth, isAuthenticated, getUserData, logout, signInWithEmail, signUpWithEmail } from '@/utils/auth';
import { demoRedirectToGoogleAuth, demoSignInWithEmail, demoSignUpWithEmail, DEMO_MODE } from '@/utils/demo';
import styles from '@/styles/Auth.module.css';

export default function TestAuth() {
  const [authStatus, setAuthStatus] = useState(() => isAuthenticated());
  const [userData, setUserData] = useState(() => getUserData());
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');
  const [testName, setTestName] = useState('Test User');
  const [testingSignIn, setTestingSignIn] = useState(false);
  const [testingSignUp, setTestingSignUp] = useState(false);
  const [testResult, setTestResult] = useState('');

  const refreshAuthStatus = () => {
    setAuthStatus(isAuthenticated());
    setUserData(getUserData());
    setTestResult('');
  };

  const handleGoogleAuth = () => {
    if (DEMO_MODE) {
      console.log('Using demo mode for authentication');
      demoRedirectToGoogleAuth();
    } else {
      console.log('Using real Google OAuth');
      redirectToGoogleAuth();
    }
  };

  const handleLogout = () => {
    logout();
    // The logout function will redirect to /auth, but let's also update local state
    setAuthStatus(false);
    setUserData(null);
    setTestResult('');
  };

  const testEmailSignIn = async () => {
    setTestingSignIn(true);
    setTestResult('');

    try {
      let result;
      if (DEMO_MODE) {
        result = await demoSignInWithEmail(testEmail, testPassword);
      } else {
        result = await signInWithEmail(testEmail, testPassword);
      }

      if (result.success) {
        setTestResult('✅ Sign-in successful!');
        refreshAuthStatus();
      } else {
        setTestResult(`❌ Sign-in failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setTestingSignIn(false);
    }
  };

  const testEmailSignUp = async () => {
    setTestingSignUp(true);
    setTestResult('');

    try {
      let result;
      if (DEMO_MODE) {
        result = await demoSignUpWithEmail(testName, testEmail, testPassword);
      } else {
        result = await signUpWithEmail(testName, testEmail, testPassword);
      }

      if (result.success) {
        setTestResult('✅ Sign-up successful!');
        refreshAuthStatus();
      } else {
        setTestResult(`❌ Sign-up failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setTestingSignUp(false);
    }
  };

  return (
    <>
      <Head>
        <title>Authentication Test - Blubb.</title>
        <meta name="description" content="Test authentication functionality" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <motion.div 
          className={styles.authCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '700px' }}
        >
          <div className={styles.header}>
            <div className={styles.logoSection}>
              <h1 className={styles.logo}>Blubb.</h1>
              <h2 className={styles.title}>Authentication Test</h2>
              <p className={styles.subtitle}>
                {DEMO_MODE ? '🧪 Demo Mode Active' : '🔴 Production Mode'}
              </p>
            </div>
          </div>

          <div style={{ padding: '2rem' }}>
            {/* Current Status */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Current Status:</h3>
              <div style={{ 
                background: authStatus ? '#22c55e' : '#ef4444',
                color: '#fff',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                {authStatus ? '✅ Authenticated' : '❌ Not Authenticated'}
              </div>
              
              {userData && (
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>User Data:</h4>
                  <pre style={{ 
                    color: '#fff', 
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {JSON.stringify(userData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Google OAuth Test */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Google OAuth Test:</h3>
              {!authStatus ? (
                <button
                  onClick={handleGoogleAuth}
                  style={{
                    background: '#4285f4',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    width: '100%',
                    marginBottom: '1rem'
                  }}
                >
                  {DEMO_MODE ? 'Test Google Auth (Demo)' : 'Login with Google'}
                </button>
              ) : (
                <div style={{ 
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#86efac',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  ✅ Already authenticated via Google OAuth
                </div>
              )}
            </div>

            {/* Email/Password Test */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Email/Password Test:</h3>
              
              {/* Test credentials inputs */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Test Name:</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#fff',
                    width: '100%',
                    marginBottom: '0.5rem'
                  }}
                  placeholder="Enter test name"
                />
                
                <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Test Email:</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#fff',
                    width: '100%',
                    marginBottom: '0.5rem'
                  }}
                  placeholder="Enter test email"
                />
                
                <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Test Password:</label>
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#fff',
                    width: '100%',
                    marginBottom: '1rem'
                  }}
                  placeholder="Enter test password"
                />
              </div>

              {/* Test buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  onClick={testEmailSignIn}
                  disabled={testingSignIn || testingSignUp || !testEmail || !testPassword}
                  style={{
                    background: '#059669',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    flex: 1,
                    opacity: (testingSignIn || testingSignUp || !testEmail || !testPassword) ? 0.5 : 1
                  }}
                >
                  {testingSignIn ? 'Testing Sign-In...' : 'Test Sign-In'}
                </button>
                
                <button
                  onClick={testEmailSignUp}
                  disabled={testingSignIn || testingSignUp || !testName || !testEmail || !testPassword}
                  style={{
                    background: '#7c3aed',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    flex: 1,
                    opacity: (testingSignIn || testingSignUp || !testName || !testEmail || !testPassword) ? 0.5 : 1
                  }}
                >
                  {testingSignUp ? 'Testing Sign-Up...' : 'Test Sign-Up'}
                </button>
              </div>

              {/* Test result */}
              {testResult && (
                <div style={{
                  background: testResult.includes('✅') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: testResult.includes('✅') ? '#86efac' : '#fca5a5',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}>
                  {testResult}
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {authStatus && (
                <>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Logout
                  </button>
                  
                  <a
                    href="/app"
                    style={{
                      background: '#ff6b08',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      display: 'inline-block'
                    }}
                  >
                    Go to App
                  </a>
                </>
              )}
              
              <button
                onClick={refreshAuthStatus}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Refresh Status
              </button>
            </div>

            {/* Demo hints */}
            {DEMO_MODE && (
              <div style={{ 
                marginTop: '2rem', 
                fontSize: '0.9rem', 
                color: 'rgba(255, 255, 255, 0.7)',
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <h4 style={{ color: '#93c5fd', marginBottom: '0.5rem' }}>Demo Mode Test Scenarios:</h4>
                <ul style={{ marginLeft: '1rem', lineHeight: '1.6' }}>
                  <li><code>error@test.com</code> - Simulates invalid credentials</li>
                  <li><code>existing@test.com</code> - Simulates email already exists (for sign-up)</li>
                  <li><code>notfound@test.com</code> - Simulates account not found (for sign-in)</li>
                  <li>Any other email/password combination works fine</li>
                  <li>Password must be at least 6 characters</li>
                </ul>
              </div>
            )}

            <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Authentication Flow:</h4>
              <ol style={{ marginLeft: '1rem' }}>
                <li>Test Google OAuth or Email/Password authentication</li>
                <li>Backend processes credentials and returns user data + token</li>
                <li>Frontend stores data in cookies and manages session</li>
                <li>Protected pages check authentication and show user data</li>
                <li>Logout clears session and redirects to auth page</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
} 