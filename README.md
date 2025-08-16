# Blubb - Real-time Audio Rooms

A Next.js application with real-time peer-to-peer audio chat functionality using WebRTC mesh networking.

## 🎯 Features

- **Real-time Audio Chat**: Peer-to-peer audio communication in rooms
- **Mesh Networking**: Direct connections between participants (no central audio server)
- **Push-to-Talk**: Starts muted by default for better UX
- **Room Management**: Create and join audio rooms
- **Modern UI**: Built with Next.js, Framer Motion, and Lucide React

## 🏗️ Architecture

### Frontend (`/client`)
- **Next.js 15** with React 19
- **WebRTC** for peer-to-peer audio
- **Socket.IO Client** for signaling
- **Framer Motion** for animations
- **Custom Hook**: `useMeshRoom` handles all WebRTC logic

### Backend (`/signaling-server`)
- **Node.js + Express** signaling server
- **Socket.IO** for WebSocket communication
- **CORS** enabled for local development
- **Room management** with capacity limits

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with WebRTC support

### Option 1: Automatic Setup (Recommended)
```bash
# From the project root directory
./start-dev.sh
```

This script will:
- Install all dependencies
- Start the signaling server on port 5000
- Start the Next.js client on port 3000
- Show you the URLs to access

### Option 2: Manual Setup

#### 1. Start the Signaling Server
```bash
cd signaling-server
npm install
npm start
```

#### 2. Start the Next.js Client
```bash
cd client
npm install
npm run dev
```

## 🧪 Testing Audio Chat

1. Open two browser windows/tabs
2. Navigate to `http://localhost:3000` in both
3. Create or join the same room in both windows
4. Allow microphone access when prompted
5. Click the microphone button to unmute
6. Start talking! 🎤

## 📁 Project Structure

```
blubb/
├── client/                    # Next.js frontend
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useMeshRoom.js # WebRTC mesh networking hook
│   │   ├── pages/
│   │   │   └── app/
│   │   │       └── room/
│   │   │           └── [id].jsx # Room page with audio
│   │   └── utils/             # Auth, API utilities
│   ├── .env.local             # Environment variables
│   └── package.json
├── signaling-server/          # WebRTC signaling server
│   ├── server.js              # Socket.IO server
│   └── package.json
├── start-dev.sh              # Development startup script
└── README.md
```

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_SIGNAL_URL`: WebSocket signaling server URL (default: `http://localhost:5000`)

### Audio Settings
The audio configuration can be modified in `client/src/hooks/useMeshRoom.js`:

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    channelCount: 1,           // Mono audio
    echoCancellation: true,    // Remove echo
    noiseSuppression: true,    // Reduce background noise
    autoGainControl: true,     // Automatic volume adjustment
  },
  video: false,
});
```

## 🌐 How It Works

### WebRTC Mesh Network
1. **User joins room**: Connects to signaling server via WebSocket
2. **Peer discovery**: Server sends list of other participants
3. **Connection establishment**: WebRTC peer connections created
4. **Audio streaming**: Direct audio streams between all participants
5. **Automatic cleanup**: Handles disconnections and room cleanup

### Signaling Flow
```
Browser A ←→ Signaling Server ←→ Browser B
    ↓              ↓              ↓
    └─── Direct WebRTC Audio ────┘
```

## 🎛️ Controls

- **🎤 Microphone Button**: Toggle mute/unmute
- **🔊 Volume Button**: Volume controls (placeholder)
- **🚪 Leave Button**: Exit the room
- **📋 Copy Button**: Share room URL

## 🔒 Production Considerations

For production deployment:

1. **HTTPS Required**: WebRTC requires secure context
2. **TURN Servers**: Add TURN servers for better connectivity:
   ```javascript
   iceServers: [
     { urls: "stun:stun.l.google.com:19302" },
     { urls: "turn:your-turn-server.com", username: "user", credential: "pass" }
   ]
   ```
3. **Authentication**: Implement proper JWT token validation
4. **Scaling**: Use Redis for room state in multi-server setup
5. **Error Handling**: Add comprehensive error handling and reconnection

## 🐛 Troubleshooting

### Audio Not Working
- Check microphone permissions in browser
- Ensure signaling server is running on port 5000
- Check browser console for WebRTC errors
- Try refreshing the page

### Connection Issues
- Verify `.env.local` has correct `NEXT_PUBLIC_SIGNAL_URL`
- Check if ports 3000 and 5000 are available
- Test signaling server health: `http://localhost:5000/health`

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 11+)
- Mobile browsers: Requires HTTPS in production

## 📊 Monitoring

Health check endpoint provides server stats:
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "rooms": 2,
  "connections": 5
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Test audio functionality thoroughly
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

---

**Happy chatting! 🎉** 