import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, User, Mail, Camera, Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import Header from '../components/Header';
import styles from '../../../styles/App.module.css';
import { isAuthenticated, getUserData, setCookie } from '@/utils/auth';
import { userApi, apiErrors } from '@/utils/api';
import { uploadImageToCloudinary, validateImageFile, UPLOAD_PRESETS } from '@/utils/cloudinary';
import { DEMO_MODE } from '@/utils/demo';

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [profileImage, setProfileImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
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
        email: userData.email,
        image: userData.profile || "https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg"
      });
      setFormData({
        name: userData.name || '',
        email: userData.email || ''
      });
      setProfileImage(userData.profile || '');
      setImagePreview(userData.profile || "https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg");
    }
  }, [router]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const uploadResult = await uploadImageToCloudinary(file, UPLOAD_PRESETS.AVATARS);
      
      if (uploadResult.success) {
        setProfileImage(uploadResult.url);
        setImagePreview(uploadResult.url);
      } else {
        setError(uploadResult.error);
        // Reset preview to original image
        setImagePreview(user?.image || "https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg");
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setError('Failed to upload image. Please try again.');
      setImagePreview(user?.image || "https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg");
    } finally {
      setIsUploading(false);
    }
  };

  const demoUpdateProfile = async (profileData) => {
    console.log('Demo mode: Updating profile...', profileData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!profileData.name.trim()) {
      return {
        success: false,
        error: 'Name is required'
      };
    }

    // Simulate successful update
    const updatedUser = {
      ...getUserData(),
      name: profileData.name,
      profile: profileData.profile
    };

    return {
      success: true,
      data: {
        user: updatedUser
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const profileData = {
        name: formData.name.trim(),
        profile: profileImage
      };

      let result;
      if (DEMO_MODE) {
        result = await demoUpdateProfile(profileData);
      } else {
        result = await userApi.updateProfile(profileData);
      }

      if (result.success) {
        // Update local storage with new user data
        const currentUserData = getUserData();
        const updatedUserData = {
          ...currentUserData,
          name: profileData.name,
          profile: profileData.profile
        };
        
        setCookie('user_data', updatedUserData, 7);
        
        // Update local state
        setUser(prev => ({
          ...prev,
          name: profileData.name,
          image: profileData.profile || prev.image
        }));

        setSuccess('Profile updated successfully!');
        
        // Redirect back to app after a short delay
        setTimeout(() => {
          router.push('/app');
        }, 2000);
      } else {
        setError(apiErrors.parseError(result.error));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
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
        <title>Edit Profile - Blubb.</title>
        <meta name="description" content="Update your profile information" />
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
              {/* Success/Error Messages */}
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: success ? '#86efac' : '#fca5a5',
                    padding: '1rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem',
                    border: `1px solid ${success ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {success || error}
                </motion.div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      border: '3px solid rgba(255, 107, 8, 0.3)'
                    }} 
                  />
                  <button 
                    type="button"
                    onClick={handleImageClick}
                    disabled={isUploading}
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      background: isUploading ? 'rgba(156, 163, 175, 1)' : 'rgba(255, 107, 8, 1)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '35px',
                      height: '35px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    {isUploading ? (
                      <Loader size={16} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Camera size={16} color="white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  marginTop: '0.5rem' 
                }}>
                  Click the camera icon to upload a new profile picture
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    <User size={16} />
                    Name *
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isUpdating}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      fontSize: '1rem',
                      opacity: isUpdating ? 0.6 : 1
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
                    name="email"
                    value={formData.email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '1rem',
                      cursor: 'not-allowed'
                    }}
                  />
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: 'rgba(255, 255, 255, 0.5)', 
                    marginTop: '0.25rem' 
                  }}>
                    Email cannot be changed
                  </p>
                </div>

                <motion.button 
                  type="submit"
                  className={styles.primaryButton}
                  disabled={isUpdating || isUploading || !formData.name.trim()}
                  whileHover={{ scale: isUpdating ? 1 : 1.02 }}
                  whileTap={{ scale: isUpdating ? 1 : 0.98 }}
                  style={{ 
                    marginTop: '1rem',
                    opacity: (isUpdating || isUploading || !formData.name.trim()) ? 0.6 : 1,
                    cursor: (isUpdating || isUploading || !formData.name.trim()) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isUpdating ? (
                    <>
                      <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </section>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
} 