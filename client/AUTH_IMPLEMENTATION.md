# Complete Authentication Implementation

This document describes the comprehensive authentication system for the Blubb client application, supporting both Google OAuth and email/password authentication.

## Overview

The authentication system supports multiple methods:
1. **Google OAuth** - Redirects to `API_URL/login/google` for OAuth processing
2. **Email/Password Sign-In** - Posts to `API_URL/auth/signin` for existing users
3. **Email/Password Sign-Up** - Posts to `API_URL/auth/signup` for new user registration

Upon successful authentication, user data is stored in cookies and users are redirected to the `/app` route.

## Architecture

### Frontend Components

1. **Authentication Utilities** (`src/utils/auth.js`)
   - Cookie management functions
   - Google OAuth redirection
   - Email/password authentication
   - Auth callback handling
   - User session management

2. **Demo Utilities** (`src/utils/demo.js`)
   - Development mode simulation
   - Mock authentication for testing
   - Supports all authentication methods

3. **Protected Pages**
   - All `/app/*` routes check authentication
   - Automatic redirect to `/auth` if not authenticated
   - Real user data displayed instead of hardcoded values

## File Structure

```
src/
├── utils/
│   ├── auth.js          # Main authentication utilities
│   ├── demo.js          # Demo/testing utilities
│   └── config.js        # API configuration
├── pages/
│   ├── auth/
│   │   └── index.js     # Unified login/signup page
│   ├── app/
│   │   ├── index.jsx    # Protected app home
│   │   ├── create.jsx   # Protected create room page
│   │   ├── join.jsx     # Protected join room page
│   │   └── components/
│   │       └── ProfileDropdown.jsx  # Logout functionality
│   └── test-auth.js     # Comprehensive testing page
├── styles/
│   └── Auth.module.css  # Authentication styling
```

## Authentication Methods

### 1. Google OAuth Flow

#### User Flow:
```javascript
// User clicks "Continue with Google"
redirectToGoogleAuth() // → window.location.href = "API_URL/login/google"
```

#### Backend Redirect:
```
http://localhost:3000/auth?token=ACCESS_TOKEN&email=USER_EMAIL&id=USER_ID&name=USER_NAME&profile=PROFILE_URL
```

#### Frontend Callback:
```javascript
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('token')) {
  const userData = handleAuthCallback(urlParams);
  if (userData) {
    window.location.href = '/app';
  }
}
```

### 2. Email/Password Sign-In

#### API Call:
```javascript
const result = await signInWithEmail(email, password);
// POST to API_URL/auth/signin
// Body: { email, password }
```

#### Expected Response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com", 
    "name": "User Name",
    "profile": "profile_url_or_null"
  }
}
```

### 3. Email/Password Sign-Up

#### API Call:
```javascript
const result = await signUpWithEmail(name, email, password);
// POST to API_URL/auth/signup  
// Body: { name, email, password }
```

#### Expected Response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name", 
    "profile": "profile_url_or_null"
  }
}
```

## Session Management

### Cookie Storage
User data stored in cookies with 7-day expiration:
```javascript
setCookie('auth_token', token, 7);
setCookie('user_data', {
  token,
  email,
  id,
  name,
  profile,
  loginTime: new Date().toISOString()
}, 7);
```

### Authentication Check
```javascript
export const isAuthenticated = () => {
  const token = getAuthToken();
  const userData = getUserData();
  return !!(token && userData);
};
```

## Form Validation

### Client-Side Validation
```javascript
const validateForm = () => {
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError('Please enter a valid email address');
    return false;
  }

  // Password strength
  if (password.length < 6) {
    setError('Password must be at least 6 characters long');
    return false;
  }

  // Sign-up specific validation
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
```

## Error Handling

### API Error Responses
```javascript
// Sign-in/Sign-up functions return:
{
  success: false,
  error: "User-friendly error message"
}

// Common error scenarios:
// - Invalid email format
// - Password too short
// - Email already exists (sign-up)
// - Invalid credentials (sign-in)
// - Network/server errors
```

### UI Error Display
- Real-time validation feedback
- Clear error messages with icons
- Success confirmations
- Loading states during requests

## Protected Route Implementation

```javascript
import { isAuthenticated, getUserData } from '@/utils/auth';

export default function ProtectedPage() {
  const [user, setUser] = useState(null);
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
        image: userData.profile || fallbackImage
      });
    }
  }, [router]);

  if (!user) return <LoadingState />;
  
  return <PageContent user={user} />;
}
```

## Testing & Development

### Demo Mode
Automatically enabled in development:
```javascript
export const DEMO_MODE = process.env.NODE_ENV === 'development' && !process.env.DISABLE_DEMO;
```

### Test Scenarios (Demo Mode)
- `error@test.com` - Invalid credentials
- `existing@test.com` - Email already exists (sign-up)
- `notfound@test.com` - Account not found (sign-in)
- Any other email works fine

### Test Page
Visit `http://localhost:3000/test-auth` to:
- Test all authentication methods
- View current auth status
- See stored user data
- Test logout functionality
- Try different error scenarios

## API Requirements

### Backend Endpoints

#### Google OAuth
```python
@app.route('/login/google')
def google_login():
    # Handle Google OAuth
    # On success redirect to:
    redirect_url = f"http://localhost:3000/auth?{urlencode({
        'token': access_token,
        'email': user.email,
        'id': user.id,
        'name': user.name,
        'profile': user.profile
    })}"
    return redirect(redirect_url)
```

#### Email Sign-In
```python
@app.route('/auth/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Validate credentials
    user = authenticate_user(email, password)
    if user:
        token = generate_jwt_token(user)
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'profile': user.profile
            }
        })
    else:
        return jsonify({'message': 'Invalid credentials'}), 401
```

#### Email Sign-Up
```python
@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email') 
    password = data.get('password')
    
    # Check if user exists
    if user_exists(email):
        return jsonify({'message': 'Email already exists'}), 400
    
    # Create new user
    user = create_user(name, email, password)
    token = generate_jwt_token(user)
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'profile': user.profile
        }
    })
```

## UI Features

### Authentication Form
- Unified form for sign-in/sign-up
- Toggle between modes without losing data
- Real-time validation feedback
- Password visibility toggles
- Loading states and error handling
- Success confirmations

### Visual Enhancements
- Smooth animations with Framer Motion
- Glass-morphism design
- Responsive layout
- Icons for better UX
- Demo mode indicators

### Accessibility
- Proper form labels
- Keyboard navigation
- Screen reader support
- Focus management
- Error announcements

## Security Considerations

1. **Password Requirements**
   - Minimum 6 characters
   - Client and server validation
   - Secure transmission (HTTPS)

2. **Token Management**
   - JWT tokens with expiration
   - Secure cookie storage
   - Automatic logout on expiry

3. **Input Validation**
   - Email format validation
   - XSS prevention
   - SQL injection protection

4. **Error Handling**
   - Generic error messages
   - No sensitive data exposure
   - Rate limiting (server-side)

## Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
DISABLE_DEMO=false  # Set to true to disable demo mode
```

### API Configuration
```javascript
// src/utils/config.js
const API_URL = "http://localhost:5000";
export { API_URL };
```

## Usage Examples

### Check Authentication
```javascript
import { isAuthenticated, getUserData } from '@/utils/auth';

if (isAuthenticated()) {
  const user = getUserData();
  console.log('Logged in as:', user.name);
}
```

### Sign In User
```javascript
import { signInWithEmail } from '@/utils/auth';

const result = await signInWithEmail('user@example.com', 'password123');
if (result.success) {
  // User signed in successfully
  router.push('/app');
} else {
  // Handle error
  setError(result.error);
}
```

### Sign Up User
```javascript
import { signUpWithEmail } from '@/utils/auth';

const result = await signUpWithEmail('John Doe', 'john@example.com', 'password123');
if (result.success) {
  // Account created successfully
  router.push('/app');
} else {
  // Handle error
  setError(result.error);
}
```

### Logout User
```javascript
import { logout } from '@/utils/auth';

logout(); // Clears cookies and redirects to /auth
```

### API Requests with Auth
```javascript
import { getAuthHeaders } from '@/utils/auth';

fetch('/api/protected-endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeaders() // Adds Authorization: Bearer TOKEN
  },
  body: JSON.stringify(data)
});
```

## Future Enhancements

1. **Token Refresh** - Automatic token renewal
2. **Remember Me** - Extended session duration
3. **Password Reset** - Email-based password recovery
4. **Social Logins** - Facebook, Twitter, GitHub OAuth
5. **Two-Factor Auth** - SMS/TOTP verification
6. **Session Management** - Active session monitoring
7. **Profile Management** - User profile editing

## Troubleshooting

### Common Issues

1. **Authentication Loops** - Check `isAuthenticated()` logic
2. **Cookies Not Set** - Verify domain/path settings
3. **API Connection** - Confirm `API_URL` configuration
4. **Demo Mode Issues** - Toggle `DISABLE_DEMO` environment variable
5. **Form Validation** - Check client-side validation rules

### Debug Tools

1. **Browser DevTools**
   - Application → Cookies (check stored data)
   - Network → API calls (check request/response)
   - Console → Authentication logs

2. **Test Page** - `/test-auth` for comprehensive testing

3. **Demo Mode** - Test without backend dependency

This implementation provides a complete, secure, and user-friendly authentication system that supports multiple authentication methods while maintaining a consistent user experience across the Blubb application. 