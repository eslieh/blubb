// Demo utility for testing authentication flow when backend is not available
import { handleAuthCallback, redirectToGoogleAuth as originalRedirectToGoogleAuth, getUserData } from './auth';

export const simulateGoogleAuthCallback = () => {
  // Simulate the callback URL parameters that would come from the backend
  const mockAuthData = {
    token: 'demo_access_token_' + Date.now(),
    email: 'demo@blubb.app',
    id: 'demo_user_123',
    name: 'Demo User',
    profile: 'https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg'
  };

  // Create URLSearchParams to simulate the callback
  const urlParams = new URLSearchParams();
  Object.entries(mockAuthData).forEach(([key, value]) => {
    if (value) urlParams.set(key, value);
  });

  // Process the authentication
  const userData = handleAuthCallback(urlParams);
  
  if (userData) {
    console.log('Demo authentication successful:', userData);
    // Redirect to app
    window.location.href = '/app';
  } else {
    console.error('Demo authentication failed');
  }
};

// Override the Google auth redirect for demo purposes
export const demoRedirectToGoogleAuth = () => {
  console.log('Demo mode: Simulating Google OAuth...');
  
  // Show a brief loading state, then simulate success
  setTimeout(() => {
    simulateGoogleAuthCallback();
  }, 1000);
};

// Demo email/password authentication
export const demoSignInWithEmail = async (email, password) => {
  console.log('Demo mode: Simulating email sign-in...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate validation
  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required'
    };
  }
  
  if (password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters long'
    };
  }
  
  // Simulate specific user scenarios
  if (email === 'error@test.com') {
    return {
      success: false,
      error: 'Invalid email or password'
    };
  }
  
  if (email === 'notfound@test.com') {
    return {
      success: false,
      error: 'No account found with this email address'
    };
  }
  
  // Simulate successful sign-in
  const mockUserData = {
    token: 'demo_email_token_' + Date.now(),
    email: email,
    id: 'demo_email_user_' + Date.now(),
    name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    profile: null,
    loginTime: new Date().toISOString()
  };
  
  return {
    success: true,
    user: mockUserData
  };
};

export const demoSignUpWithEmail = async (name, email, password) => {
  console.log('Demo mode: Simulating email sign-up...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Simulate validation
  if (!name || !email || !password) {
    return {
      success: false,
      error: 'All fields are required'
    };
  }
  
  if (password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters long'
    };
  }
  
  // Simulate email already exists scenario
  if (email === 'existing@test.com') {
    return {
      success: false,
      error: 'An account with this email already exists'
    };
  }
  
  // Simulate server error scenario
  if (email === 'error@test.com') {
    return {
      success: false,
      error: 'Server error. Please try again later.'
    };
  }
  
  // Simulate successful sign-up
  const mockUserData = {
    token: 'demo_signup_token_' + Date.now(),
    email: email,
    id: 'demo_signup_user_' + Date.now(),
    name: name,
    profile: null,
    loginTime: new Date().toISOString()
  };
  
  return {
    success: true,
    user: mockUserData
  };
};

// Helper function to get current user ID
const getCurrentUserId = () => {
  const userData = getUserData();
  return userData ? userData.id : 'demo_user_123';
};

// Demo User Profile API
export const demoUserApi = {
  // PUT /user - Update user profile
  updateProfile: async (profileData) => {
    console.log('Demo mode: Updating user profile...', profileData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!profileData.name || !profileData.name.trim()) {
      return {
        success: false,
        error: 'Name is required'
      };
    }

    // Simulate successful update
    const updatedUser = {
      ...getUserData(),
      name: profileData.name.trim(),
      profile: profileData.profile
    };

    return {
      success: true,
      data: {
        user: updatedUser,
        message: 'Profile updated successfully'
      }
    };
  },

  // GET /user - Get current user profile
  getProfile: async () => {
    console.log('Demo mode: Getting user profile...');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userData = getUserData();
    if (!userData) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    return {
      success: true,
      data: {
        user: userData
      }
    };
  }
};

// Demo Room Management API
let demoRooms = [
  {
    id: 1,
    name: 'Welcome Room',
    description: 'A place to get started with Blubb',
    created_by: 'demo_user_123',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    participants_count: 3,
    max_participants: 10,
    is_full: false,
    creator: {
      id: 'demo_user_123',
      name: 'Demo User',
      profile: 'https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg'
    },
    participants: [
      {
        id: 'demo_user_123',
        name: 'Demo User',
        email: 'demo@blubb.app',
        profile: 'https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg',
        joined_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        is_muted: false
      },
      {
        id: 'demo_user_456',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        profile: null,
        joined_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        is_muted: false
      },
      {
        id: 'demo_user_789',
        name: 'Bob Smith',
        email: 'bob@example.com',
        profile: null,
        joined_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        is_muted: true
      }
    ]
  },
  {
    id: 2,
    name: 'Tech Talk',
    description: 'Discussions about the latest in technology',
    created_by: 'demo_user_456',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    participants_count: 1,
    max_participants: 10,
    is_full: false,
    creator: {
      id: 'demo_user_456',
      name: 'Alice Johnson',
      profile: null
    },
    participants: [
      {
        id: 'demo_user_456',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        profile: null,
        joined_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_muted: false
      }
    ]
  }
];

export const demoRoomsApi = {
  // GET /rooms - List all rooms for the current user
  getRooms: async () => {
    console.log('Demo mode: Fetching rooms...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        rooms: demoRooms
      }
    };
  },

  // POST /rooms - Create a new room
  createRoom: async (roomData) => {
    console.log('Demo mode: Creating room...', roomData);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!roomData.name || !roomData.name.trim()) {
      return {
        success: false,
        error: 'Room name is required'
      };
    }

    const currentUserId = getCurrentUserId();
    const userData = getUserData();

    const newRoom = {
      id: Date.now(),
      name: roomData.name,
      description: roomData.description || '',
      created_by: currentUserId,
      created_at: new Date().toISOString(),
      participants_count: 1,
      max_participants: 10,
      is_full: false,
      creator: {
        id: currentUserId,
        name: userData?.name || 'Demo User',
        profile: userData?.profile || 'https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg'
      },
      participants: [
        {
          id: currentUserId,
          name: userData?.name || 'Demo User',
          email: userData?.email || 'demo@blubb.app',
          profile: userData?.profile || 'https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg',
          joined_at: new Date().toISOString(),
          is_muted: false
        }
      ]
    };

    demoRooms.unshift(newRoom);

    return {
      success: true,
      data: {
        message: 'Room created successfully',
        room: newRoom
      }
    };
  },

  // GET /rooms/{room_id} - Get details of a single room
  getRoomDetails: async (roomId) => {
    console.log('Demo mode: Fetching room details...', roomId);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const room = demoRooms.find(r => r.id.toString() === roomId.toString());
    
    if (!room) {
      return {
        success: false,
        error: 'Room not found'
      };
    }

    return {
      success: true,
      data: {
        room: room
      }
    };
  },

  // GET /rooms/{room_id}/participants - Get participants of a specific room
  getRoomParticipants: async (roomId) => {
    console.log('Demo mode: Fetching room participants...', roomId);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const room = demoRooms.find(r => r.id.toString() === roomId.toString());
    
    if (!room) {
      return {
        success: false,
        error: 'Room not found'
      };
    }

    return {
      success: true,
      data: {
        participants: room.participants
      }
    };
  },

  // POST /rooms/{room_id}/join - Join a room
  joinRoom: async (roomId) => {
    console.log('Demo mode: Joining room...', roomId);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const room = demoRooms.find(r => r.id.toString() === roomId.toString());
    
    if (!room) {
      return {
        success: false,
        error: 'Room not found'
      };
    }

    if (room.is_full || room.participants_count >= room.max_participants) {
      return {
        success: false,
        error: 'Room is full'
      };
    }

    const currentUserId = getCurrentUserId();
    const userData = getUserData();

    // Check if already joined
    const alreadyJoined = room.participants.some(p => p.id.toString() === currentUserId.toString());
    if (alreadyJoined) {
      return {
        success: false,
        error: 'You have already joined this room'
      };
    }

    // Add user to room
    const newParticipant = {
      id: currentUserId,
      name: userData?.name || 'Demo User',
      email: userData?.email || 'demo@blubb.app',
      profile: userData?.profile || 'https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg',
      joined_at: new Date().toISOString(),
      is_muted: false
    };

    room.participants.push(newParticipant);
    room.participants_count = room.participants.length;

    return {
      success: true,
      data: {
        message: 'Successfully joined the room'
      }
    };
  },

  // DELETE /rooms/{room_id}/leave - Leave a room
  leaveRoom: async (roomId) => {
    console.log('Demo mode: Leaving room...', roomId);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const room = demoRooms.find(r => r.id.toString() === roomId.toString());
    
    if (!room) {
      return {
        success: false,
        error: 'Room not found'
      };
    }

    const currentUserId = getCurrentUserId();

    // Check if user is in the room
    const participantIndex = room.participants.findIndex(p => p.id.toString() === currentUserId.toString());
    if (participantIndex === -1) {
      return {
        success: false,
        error: 'You are not in this room'
      };
    }

    // Remove user from room
    room.participants.splice(participantIndex, 1);
    room.participants_count = room.participants.length;

    return {
      success: true,
      data: {
        message: 'Successfully left the room'
      }
    };
  }
};

export const demoCacheApi = {
  // POST /cache/warmup - Warm up cache for frequently accessed data
  warmupCache: async () => {
    console.log('Demo mode: Warming up cache...');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      data: {
        message: 'Cache warmed up successfully'
      }
    };
  }
};

// Export a flag to enable demo mode
export const DEMO_MODE = process.env.NODE_ENV === 'production' && !process.env.DISABLE_DEMO; 