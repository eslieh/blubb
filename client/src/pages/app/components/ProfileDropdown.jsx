import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, Shield, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import styles from './ProfileDropdown.module.css';
import { logout } from '@/utils/auth';

export default function ProfileDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Don't render if user is null or undefined
  if (!user) {
    return null;
  }

  return (
    <div className={styles.profileDropdown} ref={dropdownRef}>
      <motion.div 
        className={styles.profileTrigger}
        onClick={toggleDropdown}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img 
          src={user.image || "https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg"} 
          className={styles.profileImage} 
          alt={`${user.name || 'User'}'s profile`} 
        />
        <motion.div
          className={styles.chevron}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.dropdownMenu}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.userInfo}>
              <img 
                src={user.image || "https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg"} 
                className={styles.menuProfileImage} 
                alt={`${user.name || 'User'}'s profile`} 
              />
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.name || 'Unknown User'}</span>
                <span className={styles.userEmail}>{user.email || 'user@example.com'}</span>
              </div>
            </div>
            
            <div className={styles.divider}></div>
            
            <div className={styles.menuItems}>
              <Link href="/app/profile/edit" className={styles.menuItem}>
                <Settings size={16} />
                <span>Edit Profile</span>
              </Link>
              
              <Link href="/privacy-policy" className={styles.menuItem}>
                <Shield size={16} />
                <span>Privacy Policy</span>
              </Link>
              
              <div className={styles.divider}></div>
              
              <button 
                className={`${styles.menuItem} ${styles.logoutItem}`}
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 