const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios'); // Add axios for API calls

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const rooms = new Map(); // roomId -> Set of socket IDs
const sidMeta = new Map(); // sid -> {user_id, room_id, user_details}
const MAX_ROOM_SIZE = 10;
const API_BASE = process.env.API_BASE || 'http://localhost:8000'; // Flask API URL

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    connections: io.engine.clientsCount 
  });
});

// Fetch user details from API
async function fetchUserDetails(userId) {
  try {
    const response = await axios.get(`${API_BASE}/user/${userId}`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user details for ${userId}:`, error.message);
    // Return basic user info as fallback
    return {
      id: userId,
      name: `User ${userId}`,
      email: null,
      profile: null,
      created_at: new Date().toISOString()
    };
  }
}

// Get all current participants in a room with their details
function getRoomParticipants(roomId) {
  const participants = [];
  const sids = rooms.get(roomId) || new Set();
  
  for (const sid of sids) {
    const meta = sidMeta.get(sid);
    if (meta && meta.user_details) {
      const participant = {
        ...meta.user_details,
        socket_id: sid,
        is_online: true
      };
      participants.push(participant);
    }
  }
  
  return participants;
}

// Simple JWT decode (for demo - use proper JWT library in production)
function decodeToken(token) {
  try {
    // This is a simple base64 decode - replace with proper JWT verification
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    return decoded;
  } catch (error) {
    return null;
  }
}

io.on('connection', async (socket) => {
  console.log('User connected:', socket.id);
  
  const { token, roomId } = socket.handshake.auth;
  
  if (!roomId) {
    console.log('No room ID provided, disconnecting:', socket.id);
    socket.disconnect();
    return;
  }

  // Verify token and get user ID (simplified for demo)
  let userId;
  if (token && token !== 'demo-token') {
    const decoded = decodeToken(token);
    userId = decoded?.sub || decoded?.user_id;
  } else {
    // Demo mode - generate a demo user ID
    userId = Math.floor(Math.random() * 1000) + 1;
  }

  if (!userId) {
    console.log('Invalid token, disconnecting:', socket.id);
    socket.disconnect();
    return;
  }

  // Fetch user details from API
  const userDetails = await fetchUserDetails(userId);
  if (!userDetails) {
    console.log('Could not fetch user details, disconnecting:', socket.id);
    socket.disconnect();
    return;
  }

  // Convert roomId to string for consistency
  const roomIdStr = roomId.toString();

  // Join room
  if (!rooms.has(roomIdStr)) {
    rooms.set(roomIdStr, new Set());
  }
  
  const room = rooms.get(roomIdStr);
  
  // Check room capacity
  if (room.size >= MAX_ROOM_SIZE) {
    console.log(`Room ${roomIdStr} is full (${room.size}/${MAX_ROOM_SIZE})`);
    socket.emit('room:full', { limit: MAX_ROOM_SIZE });
    socket.disconnect();
    return;
  }

  room.add(socket.id);
  socket.join(roomIdStr);
  sidMeta.set(socket.id, {
    user_id: userId,
    room_id: roomIdStr,
    user_details: userDetails
  });
  
  console.log(`User ${socket.id} (${userDetails.name}) joined room ${roomIdStr} (${room.size}/${MAX_ROOM_SIZE})`);

  // Emit user joined to others in room
  socket.to(roomIdStr).emit('presence:join', {
    user: userDetails,
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });

  // Send current participants list to the new user
  const currentParticipants = getRoomParticipants(roomIdStr);
  socket.emit('participants:list', {
    participants: currentParticipants,
    total: currentParticipants.length
  });

  socket.emit('connected', { ok: true, user: userDetails });

  // Handle peer discovery
  socket.on('peers:list', () => {
    const peers = Array.from(room).filter(id => id !== socket.id);
    console.log(`Sending peer list to ${socket.id}:`, peers);
    socket.emit('peers:list', { peers });
  });

  // Get current participants with details
  socket.on('participants:list', () => {
    const participants = getRoomParticipants(roomIdStr);
    socket.emit('participants:list', {
      participants: participants,
      total: participants.length
    });
  });

  // User status updates (e.g., mute/unmute)
  socket.on('user:status', (data) => {
    const meta = sidMeta.get(socket.id);
    if (!meta) return;
    
    // Update user status in metadata
    if (data.status) {
      Object.assign(meta.user_details, data.status);
    }
    
    // Broadcast status change to room
    socket.to(roomIdStr).emit('user:status:change', {
      user: meta.user_details,
      socketId: socket.id,
      status: data.status || {},
      timestamp: new Date().toISOString()
    });
  });

  // WebRTC signaling - relay offers
  socket.on('webrtc:offer', (data) => {
    console.log(`Relaying offer from ${socket.id} to ${data.to}`);
    socket.to(data.to).emit('webrtc:offer', {
      from: socket.id,
      sdp: data.sdp
    });
  });

  // WebRTC signaling - relay answers
  socket.on('webrtc:answer', (data) => {
    console.log(`Relaying answer from ${socket.id} to ${data.to}`);
    socket.to(data.to).emit('webrtc:answer', {
      from: socket.id,
      sdp: data.sdp
    });
  });

  // WebRTC signaling - relay ICE candidates
  socket.on('webrtc:ice', (data) => {
    console.log(`Relaying ICE candidate from ${socket.id} to ${data.to}`);
    socket.to(data.to).emit('webrtc:ice', {
      from: socket.id,
      candidate: data.candidate
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const meta = sidMeta.get(socket.id);
    if (meta) {
      const userDetails = meta.user_details;
      
      room.delete(socket.id);
      sidMeta.delete(socket.id);
      
      // Notify others in room about disconnection
      socket.to(roomIdStr).emit('presence:leave', {
        user: userDetails,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Room ${roomIdStr} now has ${room.size} participants`);
      
      // Clean up empty rooms
      if (room.size === 0) {
        rooms.delete(roomIdStr);
        console.log(`Room ${roomIdStr} deleted (empty)`);
      }
    }
  });

  // Handle explicit leave
  socket.on('leave:room', () => {
    console.log(`User ${socket.id} leaving room ${roomIdStr}`);
    socket.disconnect();
  });
});

// Log server stats periodically
setInterval(() => {
  const totalConnections = io.engine.clientsCount;
  const totalRooms = rooms.size;
  const roomDetails = Array.from(rooms.entries()).map(([id, participants]) => 
    `Room ${id}: ${participants.size} participants`
  );
  
  console.log(`--- Server Stats ---`);
  console.log(`Total connections: ${totalConnections}`);
  console.log(`Active rooms: ${totalRooms}`);
  if (roomDetails.length > 0) {
    console.log('Room details:', roomDetails.join(', '));
  }
  console.log('-------------------');
}, 30000); // Every 30 seconds

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: ${API_BASE}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 