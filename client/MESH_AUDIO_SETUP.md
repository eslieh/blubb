# Mesh Audio Setup for Blubb Client

This setup enables real-time peer-to-peer audio communication in rooms using WebRTC mesh networking.

## What's Been Configured

### 1. Environment Variables
- Created `.env.local` with `NEXT_PUBLIC_SIGNAL_URL=http://localhost:5000`
- This points to your signaling server for WebRTC coordination

### 2. Dependencies Added
- `socket.io-client` for WebSocket communication with the signaling server

### 3. New Hook: `useMeshRoom`
- Location: `src/hooks/useMeshRoom.js`
- Handles WebRTC peer connections, audio streams, and signaling
- Features:
  - Automatic microphone access
  - Push-to-talk style (starts muted)
  - Mesh networking (up to 10 participants)
  - Automatic peer discovery and connection
  - Real-time audio streaming

### 4. Room Page Integration
- Modified `src/pages/app/room/[id].jsx` to use the mesh room hook
- Added audio connection status indicators
- Integrated mute/unmute controls with WebRTC
- Shows connected peer count

## How It Works

### User Flow
1. User joins a room through the existing room system
2. `useMeshRoom` hook initializes when `isUserInRoom` becomes true
3. Hook requests microphone permission
4. Connects to signaling server via WebSocket
5. Discovers other participants in the room
6. Establishes WebRTC peer connections for audio
7. Audio streams directly between participants (mesh network)

### Audio Features
- **Mute/Unmute**: Toggle microphone on/off
- **Auto-mute**: Starts muted by default (push-to-talk style)
- **Real-time**: Low-latency audio streaming
- **Mesh Network**: Direct peer-to-peer connections (no central server for audio)

## Next Steps: Signaling Server

You need a signaling server running on `localhost:5000`. Here's a basic Node.js implementation:

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map(); // roomId -> Set of socket IDs

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  const { token, roomId } = socket.handshake.auth;
  
  if (!roomId) {
    socket.disconnect();
    return;
  }

  // Join room
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  
  const room = rooms.get(roomId);
  
  // Check room capacity
  if (room.size >= 10) {
    socket.emit('room:full', { limit: 10 });
    socket.disconnect();
    return;
  }

  room.add(socket.id);
  socket.join(roomId.toString());
  
  console.log(`User ${socket.id} joined room ${roomId}`);
  socket.emit('connected');

  // Handle peer discovery
  socket.on('peers:list', () => {
    const peers = Array.from(room).filter(id => id !== socket.id);
    socket.emit('peers:list', { peers });
  });

  // WebRTC signaling
  socket.on('webrtc:offer', (data) => {
    socket.to(data.to).emit('webrtc:offer', {
      from: socket.id,
      sdp: data.sdp
    });
  });

  socket.on('webrtc:answer', (data) => {
    socket.to(data.to).emit('webrtc:answer', {
      from: socket.id,
      sdp: data.sdp
    });
  });

  socket.on('webrtc:ice', (data) => {
    socket.to(data.to).emit('webrtc:ice', {
      from: socket.id,
      candidate: data.candidate
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    room.delete(socket.id);
    
    // Notify others in room
    socket.to(roomId.toString()).emit('peer:disconnected', socket.id);
    
    // Clean up empty rooms
    if (room.size === 0) {
      rooms.delete(roomId);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
```

### To run the signaling server:
1. Create a new directory for the server
2. Run `npm init -y`
3. Install dependencies: `npm install express socket.io cors`
4. Save the code above as `server.js`
5. Run with `node server.js`

## Testing

1. Start the signaling server: `node server.js`
2. Start the Next.js app: `npm run dev`
3. Open two browser windows/tabs
4. Navigate to the same room in both
5. Join the room in both windows
6. You should see audio connection status and be able to talk between them

## Audio Quality Settings

The current configuration uses:
- Echo cancellation: enabled
- Noise suppression: enabled
- Auto gain control: enabled
- Single audio channel (mono)

These can be adjusted in the `useMeshRoom.js` hook's `getUserMedia` call.

## Production Considerations

For production deployment, consider:
1. **TURN servers**: Add TURN servers for better connectivity across firewalls
2. **Authentication**: Implement proper token validation in signaling server
3. **Scaling**: Use Redis for room state in multi-server deployments
4. **SSL**: Ensure HTTPS for WebRTC functionality
5. **Error handling**: Add comprehensive error handling and reconnection logic 