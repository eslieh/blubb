# Real-time Presence System Integration

This document explains the integration between the Flask API server and the WebRTC signaling server for real-time user presence and participant management.

## Architecture Overview

```
Flask API Server (Port 8000)          WebRTC Signaling Server (Port 5000)        React Client (Port 3000)
├── User management                    ├── WebSocket connections                   ├── useMeshRoom hook
├── Room participants                  ├── Real-time presence events              ├── Room page with live participants
├── API endpoints                      ├── User details fetching                  ├── Online indicators
└── /user/<id> endpoint               └── WebRTC signaling                        └── Mute status display

      ↑                                        ↑                                        ↑
      └──── HTTP API calls ────────────────────┼──── WebSocket events ─────────────────┘
                                              ↓
                                    Fetches user details via HTTP
```

## Key Features

### 1. Real-time User Presence
- **Join Events**: When a user joins a room, their details are fetched from the Flask API and broadcast to all participants
- **Leave Events**: When a user leaves, all participants are notified immediately
- **Status Updates**: Mute/unmute status is broadcast in real-time

### 2. Live Participant Display
- **Dynamic List**: Participants list updates automatically as users join/leave
- **Online Indicators**: Green dots show who's currently online
- **Mute Indicators**: Red microphone icons show who's muted
- **Avatar Display**: User profile pictures and names from the database

### 3. API Integration
- **User Details**: Signaling server fetches user details from Flask API
- **Fallback Handling**: Graceful degradation if API is unavailable
- **Status Tracking**: Optional last seen and status updates

## Implementation Details

### Flask API Server

#### Updated SocketIO Server (`server/socketio_server.py`)
```python
# Key changes:
- Fetches user details from API_BASE/user/<user_id>
- Emits presence:join with full user details
- Emits presence:leave with user details
- Handles user:status events for mute/unmute
- Maintains participants list with user details
```

#### New User API (`server/user_api.py`)
```python
# Endpoints:
GET /user/<user_id>          # Get user details
POST /user/<user_id>/status  # Update user status
GET /users/online           # Get online users list
```

#### Integration in Main Flask App
```python
# Add to your main Flask app:
from user_api import user_api
app.register_blueprint(user_api)
```

### WebRTC Signaling Server

#### Enhanced Node.js Server (`signaling-server/server.js`)
```javascript
// Key features:
- Fetches user details from Flask API
- Maintains user metadata with socket connections
- Broadcasts presence events with user details
- Handles demo mode for development
- Supports both JWT and demo tokens
```

### React Client

#### Enhanced useMeshRoom Hook (`src/hooks/useMeshRoom.js`)
```javascript
// New features:
- onlineParticipants state for real-time participant list
- Presence event handlers for join/leave
- Status change handlers for mute/unmute
- refreshParticipants function
```

#### Updated Room Page (`src/pages/app/room/[id].jsx`)
```javascript
// Enhancements:
- Live participant display with online indicators
- Mute status indicators
- Real-time participant count
- Refresh button for participants
```

## Setup Instructions

### 1. Flask API Server Setup

Add the user API to your Flask application:

```python
# In your main Flask app file
from user_api import user_api

def create_app():
    app = Flask(__name__)
    # ... existing setup ...
    
    # Register the user API blueprint
    app.register_blueprint(user_api)
    
    return app
```

Make sure your User model has the required fields:
```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    profile = db.Column(db.String(255))  # Profile picture URL
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen = db.Column(db.DateTime)  # Optional: for online status
```

### 2. Environment Configuration

Set the API base URL for the signaling server:

```bash
# In signaling-server/.env (optional)
API_BASE=http://localhost:8000

# In client/.env.local
NEXT_PUBLIC_SIGNAL_URL=http://localhost:5000
```

### 3. Start All Services

```bash
# Terminal 1: Flask API Server
cd server
python app.py  # Should run on port 8000

# Terminal 2: Signaling Server
cd signaling-server
npm install  # Install axios dependency
npm start    # Runs on port 5000

# Terminal 3: React Client
cd client
npm run dev  # Runs on port 3000
```

Or use the automated script:
```bash
./start-dev.sh
```

## Event Flow

### User Joins Room

1. **Client**: User joins room via existing room system
2. **Client**: WebSocket connects to signaling server with token and roomId
3. **Signaling**: Verifies token and extracts user ID
4. **Signaling**: HTTP GET to `API_BASE/user/{user_id}`
5. **Flask API**: Returns user details (name, email, profile, etc.)
6. **Signaling**: Broadcasts `presence:join` event with user details
7. **All Clients**: Update participants list and display new user

### User Leaves Room

1. **Client**: Disconnects WebSocket or leaves room
2. **Signaling**: Detects disconnect
3. **Signaling**: Broadcasts `presence:leave` event with user details
4. **All Clients**: Remove user from participants list

### Status Updates (Mute/Unmute)

1. **Client**: User toggles mute button
2. **Client**: Emits `user:status` event with `{status: {is_muted: true}}`
3. **Signaling**: Broadcasts `user:status:change` to all room participants
4. **All Clients**: Update user's mute status in UI

## Testing

### 1. Test User API
```bash
# Test user details endpoint
curl http://localhost:8000/user/1

# Expected response:
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "profile": "https://example.com/avatar.jpg",
  "created_at": "2024-01-01T00:00:00",
  "is_active": true
}
```

### 2. Test Real-time Presence
1. Open two browser windows to the same room
2. Join room in first window - should see user appear
3. Join room in second window - both should see each other
4. Toggle mute in one window - other should see mute indicator
5. Leave room in one window - other should see user disappear

## Production Considerations

### Security
- Implement proper JWT token validation
- Add rate limiting for API endpoints
- Validate user permissions for room access
- Use HTTPS in production

### Performance
- Add Redis for signaling server state in multi-server setup
- Implement connection pooling for API calls
- Add caching for frequently accessed user data
- Monitor API response times

### Monitoring
- Add logging for all presence events
- Monitor API endpoint performance
- Track WebSocket connection metrics
- Set up alerts for failed API calls

### Error Handling
- Graceful degradation when API is unavailable
- Retry logic for failed API calls
- Fallback to basic user info from JWT
- Client-side error recovery

## Troubleshooting

### Common Issues

1. **Users not appearing in participants list**
   - Check Flask API is running on port 8000
   - Verify `/user/<id>` endpoint returns valid data
   - Check signaling server logs for API call errors

2. **Presence events not working**
   - Ensure WebSocket connection is established
   - Check browser console for event handling errors
   - Verify room joining is successful

3. **API calls failing**
   - Check API_BASE environment variable
   - Verify Flask server is accessible from signaling server
   - Check for CORS issues in development

### Debug Mode

Enable debug logging in signaling server:
```javascript
// Add to server.js
const DEBUG = process.env.DEBUG === 'true';
if (DEBUG) {
  console.log('Debug mode enabled');
  // Add extra logging
}
```

Enable debug logging in React:
```javascript
// Add to useMeshRoom.js
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) {
  console.log('Mesh room debug:', { status, onlineParticipants });
}
``` 