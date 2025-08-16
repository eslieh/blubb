import { API_URL, APP_URL } from './config';
import { getAuthHeaders } from './auth';

// Base API utility function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'Network error occurred'
    };
  }
};

// Room Management API
export const roomsApi = {
  // GET /rooms - List all rooms for the current user
  getRooms: async () => {
    return await apiRequest('/rooms');
  },

  // POST /rooms - Create a new room
  createRoom: async (roomData) => {
    return await apiRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        name: roomData.name,
        description: roomData.description
      })
    });
  },

  // GET /rooms/{room_id} - Get details of a single room
  getRoomDetails: async (roomId) => {
    return await apiRequest(`/rooms/${roomId}`);
  },

  // GET /rooms/{room_id}/participants - Get participants of a specific room
  getRoomParticipants: async (roomId) => {
    return await apiRequest(`/rooms/${roomId}/participants`);
  },

  // POST /rooms/{room_id}/join - Join a room
  joinRoom: async (roomId) => {
    return await apiRequest(`/rooms/${roomId}/join`, {
      method: 'POST'
    });
  },

  // DELETE /rooms/{room_id}/leave - Leave a room
  leaveRoom: async (roomId) => {
    return await apiRequest(`/rooms/${roomId}/leave`, {
      method: 'DELETE'
    });
  }
};

// User Profile API
export const userApi = {
  // PUT /user - Update user profile
  updateProfile: async (profileData) => {
    return await apiRequest('/user', {
      method: 'PUT',
      body: JSON.stringify({
        name: profileData.name,
        profile: profileData.profile // Cloudinary image URL
      })
    });
  },

  // GET /user - Get current user profile
  getProfile: async () => {
    return await apiRequest('/user');
  }
};

// Cache API
export const cacheApi = {
  // POST /cache/warmup - Warm up cache for frequently accessed data
  warmupCache: async () => {
    return await apiRequest('/cache/warmup', {
      method: 'POST'
    });
  }
};

// Utility functions for room management
export const roomUtils = {
  // Format room data for display
  formatRoom: (room) => ({
    id: room.id,
    name: room.name,
    description: room.description,
    createdBy: room.created_by,
    createdAt: new Date(room.created_at),
    participantsCount: room.participants_count,
    maxParticipants: room.max_participants || 10,
    isFull: room.is_full || false,
    creator: room.creator,
    participants: room.participants || [],
    url: `${APP_URL}/app/room/${room.id}`
  }),

  // Format participant data
  formatParticipant: (participant) => ({
    id: participant.id,
    name: participant.name,
    profile: participant.profile,
    joinedAt: new Date(participant.joined_at),
    isMuted: participant.is_muted || false
  }),

  // Check if room is joinable
  isRoomJoinable: (room) => {
    return !room.is_full && room.participants_count < (room.max_participants || 10);
  },

  // Get room status
  getRoomStatus: (room) => {
    if (room.is_full) return 'full';
    if (room.participants_count === 0) return 'empty';
    if (room.participants_count === 1) return 'waiting';
    return 'active';
  }
};

// Error handling utilities
export const apiErrors = {
  // Common error messages
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action. Please log in again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  ROOM_FULL: 'This room is currently full. Please try again later.',
  ALREADY_JOINED: 'You have already joined this room.',
  NOT_IN_ROOM: 'You are not currently in this room.',
  
  // Parse API error
  parseError: (error) => {
    if (typeof error === 'string') return error;
    
    // Handle common HTTP status codes
    if (error.includes('401')) return apiErrors.UNAUTHORIZED;
    if (error.includes('403')) return apiErrors.FORBIDDEN;
    if (error.includes('404')) return apiErrors.NOT_FOUND;
    if (error.includes('Network error')) return apiErrors.NETWORK_ERROR;
    
    return error || 'An unexpected error occurred';
  }
}; 