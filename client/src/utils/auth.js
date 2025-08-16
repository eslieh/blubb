import { API_URL } from './config';

// Cookie utilities
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Authentication functions
export const redirectToGoogleAuth = () => {
  const redirectUrl = `${API_URL}/login/google`;
  window.location.href = redirectUrl;
};

export const handleAuthCallback = (urlParams) => {
  const token = urlParams.get('token');
  const email = urlParams.get('email');
  const id = urlParams.get('id');
  const name = urlParams.get('name');
  const profile = urlParams.get('profile');

  if (token && email && id && name) {
    const userData = {
      token,
      email,
      id,
      name,
      profile: profile || null,
      loginTime: new Date().toISOString()
    };

    // Store user data in cookies
    setCookie('auth_token', token, 7);
    setCookie('user_data', userData, 7);
    
    return userData;
  }
  
  return null;
};

// Email/Password Authentication
export const signInWithEmail = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.access_token && data.user) {
      const userData = {
        token: data.access_token,
        email: data.user.email,
        id: data.user.id,
        name: data.user.name,
        profile: data.user.profile || null,
        loginTime: new Date().toISOString()
      };

      // Store user data in cookies
      setCookie('auth_token', data.access_token, 7);
      setCookie('user_data', userData, 7);  
      
      return { success: true, user: userData };
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Sign-in error:', error);
    return { 
      success: false, 
      error: error.message || 'Sign-in failed. Please try again.' 
    };
  }
};

export const signUpWithEmail = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.access_token && data.user) {
      const userData = {
        token: data.access_token,
        email: data.user.email,
        id: data.user.id,
        name: data.user.name,
        profile: data.user.profile || null,
        loginTime: new Date().toISOString()
      };

      // Store user data in cookies
      setCookie('auth_token', data.access_token, 7);
      setCookie('user_data', userData, 7);
      
      return { success: true, user: userData };
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Sign-up error:', error);
    return { 
      success: false, 
      error: error.message || 'Sign-up failed. Please try again.' 
    };
  }
};

export const getAuthToken = () => {
  return getCookie('auth_token');
};

export const getUserData = () => {
  return getCookie('user_data');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  const userData = getUserData();
  return !!(token && userData);
};

export const logout = () => {
  deleteCookie('auth_token');
  deleteCookie('user_data');
  window.location.href = '/auth';
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}; 