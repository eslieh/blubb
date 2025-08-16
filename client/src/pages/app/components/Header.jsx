import ProfileDropdown from './ProfileDropdown';
import Link from 'next/link';
import styles from '../../../styles/App.module.css';

export default function Header({ user, showBackButton = false, backButtonText = "Back to App", backButtonHref = "/app" }) {
  return (
    <section className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/app" style={{ textDecoration: 'none', color: 'inherit' }}>
          Blubb.
        </Link>
      </div>
      <div className={styles.profilearea}>
        {showBackButton ? (
          <Link 
            href={backButtonHref} 
            style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'rgba(255, 107, 8, 0.8)'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}
          >
            {backButtonText}
          </Link>
        ) : (
          <ProfileDropdown user={user} />
        )}
      </div>
    </section>
  );
} 