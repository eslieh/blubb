import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { roomsApi, roomUtils, apiErrors } from '@/utils/api';
import { demoRoomsApi, DEMO_MODE } from '@/utils/demo';
import { isAuthenticated, getUserData } from '@/utils/auth';
import styles from '@/styles/Auth.module.css';

export default function TestRooms() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [testRoomName, setTestRoomName] = useState('Test Room ' + Date.now());
  const [testRoomDescription, setTestRoomDescription] = useState('A test room for API testing');
  const [testRoomId, setTestRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth');
      return;
    }
    
    const userData = getUserData();
    if (userData) {
      setUser(userData);
    }

    // Load initial rooms
    loadRooms();
  }, [router]);

  const loadRooms = async () => {
    setIsLoading(true);
    setResult('Loading rooms...');

    try {
      let response;
      if (DEMO_MODE) {
        response = await demoRoomsApi.getRooms();
      } else {
        response = await roomsApi.getRooms();
      }

      if (response.success) {
        setRooms(response.data.rooms);
        setResult(`✅ Loaded ${response.data.rooms.length} rooms`);
      } else {
        setResult(`❌ Failed to load rooms: ${response.error}`);
      }
    } catch (error) {
      setResult(`❌ Error loading rooms: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async () => {
    setIsLoading(true);
    setResult('Creating room...');

    try {
      let response;
      if (DEMO_MODE) {
        response = await demoRoomsApi.createRoom({ name: testRoomName, description: testRoomDescription });
      } else {
        response = await roomsApi.createRoom({ name: testRoomName, description: testRoomDescription });
      }

      if (response.success) {
        setResult(`✅ Room created: ${response.data.room.name} (ID: ${response.data.room.id})`);
        await loadRooms(); // Refresh room list
      } else {
        setResult(`❌ Failed to create room: ${response.error}`);
      }
    } catch (error) {
      setResult(`❌ Error creating room: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoomDetails = async (roomId) => {
    setIsLoading(true);
    setResult(`Getting details for room ${roomId}...`);

    try {
      let response;
      if (DEMO_MODE) {
        response = await demoRoomsApi.getRoomDetails(roomId);
      } else {
        response = await roomsApi.getRoomDetails(roomId);
      }

      if (response.success) {
        setRoomDetails(response.data.room);
        setResult(`✅ Got room details for: ${response.data.room.name}`);
      } else {
        setResult(`❌ Failed to get room details: ${response.error}`);
        setRoomDetails(null);
      }
    } catch (error) {
      setResult(`❌ Error getting room details: ${error.message}`);
      setRoomDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoomParticipants = async (roomId) => {
    setIsLoading(true);
    setResult(`Getting participants for room ${roomId}...`);

    try {
      let response;
      if (DEMO_MODE) {
        response = await demoRoomsApi.getRoomParticipants(roomId);
      } else {
        response = await roomsApi.getRoomParticipants(roomId);
      }

      if (response.success) {
        setParticipants(response.data.participants);
        setResult(`✅ Got ${response.data.participants.length} participants`);
      } else {
        setResult(`❌ Failed to get participants: ${response.error}`);
        setParticipants([]);
      }
    } catch (error) {
      setResult(`❌ Error getting participants: ${error.message}`);
      setParticipants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (roomId) => {
    setIsLoading(true);
    setResult(`Joining room ${roomId}...`);

    try {
      let response;
      if (DEMO_MODE) {
        response = await demoRoomsApi.joinRoom(roomId);
      } else {
        response = await roomsApi.joinRoom(roomId);
      }

      if (response.success) {
        setResult(`✅ Successfully joined room`);
        await getRoomDetails(roomId); // Refresh room details
      } else {
        setResult(`❌ Failed to join room: ${response.error}`);
      }
    } catch (error) {
      setResult(`❌ Error joining room: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const leaveRoom = async (roomId) => {
    setIsLoading(true);
    setResult(`Leaving room ${roomId}...`);

    try {
      let response;
      if (DEMO_MODE) {
        response = await demoRoomsApi.leaveRoom(roomId);
      } else {
        response = await roomsApi.leaveRoom(roomId);
      }

      if (response.success) {
        setResult(`✅ Successfully left room`);
        await getRoomDetails(roomId); // Refresh room details
      } else {
        setResult(`❌ Failed to leave room: ${response.error}`);
      }
    } catch (error) {
      setResult(`❌ Error leaving room: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testRoomById = async () => {
    if (!testRoomId.trim()) {
      setResult('❌ Please enter a room ID');
      return;
    }
    await getRoomDetails(testRoomId.trim());
  };

  const clearResult = () => {
    setResult('');
    setRoomDetails(null);
    setParticipants([]);
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Room Management Test - Blubb.</title>
        <meta name="description" content="Test room management API functionality" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className={styles.container}>
        <motion.div 
          className={styles.authCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}
        >
          <div className={styles.header}>
            <div className={styles.logoSection}>
              <h1 className={styles.logo}>Blubb.</h1>
              <h2 className={styles.title}>Room Management Test</h2>
              <p className={styles.subtitle}>
                {DEMO_MODE ? '🧪 Demo Mode Active' : '🔴 Production Mode'}
              </p>
            </div>
          </div>

          <div style={{ padding: '2rem' }}>
            {/* Create Room Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Create Room:</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Room Name:</label>
                <input
                  type="text"
                  value={testRoomName}
                  onChange={(e) => setTestRoomName(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#fff',
                    width: '100%',
                    marginBottom: '0.5rem'
                  }}
                />
                
                <label style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Description:</label>
                <textarea
                  value={testRoomDescription}
                  onChange={(e) => setTestRoomDescription(e.target.value)}
                  rows={3}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#fff',
                    width: '100%',
                    marginBottom: '1rem',
                    resize: 'vertical'
                  }}
                />
                
                <button
                  onClick={createRoom}
                  disabled={isLoading || !testRoomName.trim()}
                  style={{
                    background: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    opacity: (isLoading || !testRoomName.trim()) ? 0.5 : 1
                  }}
                >
                  {isLoading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </div>

            {/* Room List Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Your Rooms ({rooms.length}):</h3>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  onClick={loadRooms}
                  disabled={isLoading}
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    opacity: isLoading ? 0.5 : 1
                  }}
                >
                  {isLoading ? 'Loading...' : 'Refresh Rooms'}
                </button>
                
                <button
                  onClick={clearResult}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Clear Results
                </button>
              </div>

              {rooms.length > 0 ? (
                <div style={{ 
                  maxHeight: '200px', 
                  overflow: 'auto',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  {rooms.map((room) => (
                    <div 
                      key={room.id} 
                      style={{
                        background: selectedRoom === room.id ? 'rgba(255, 107, 8, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: selectedRoom === room.id ? '1px solid #ff6b08' : '1px solid transparent'
                      }}
                      onClick={() => setSelectedRoom(room.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#fff' }}>{room.name}</strong>
                          <span style={{ color: 'rgba(255, 255, 255, 0.7)', marginLeft: '0.5rem' }}>
                            (ID: {room.id})
                          </span>
                          {room.description && (
                            <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                              {room.description}
                            </p>
                          )}
                          <small style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {room.participants_count || 0} participants
                          </small>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); getRoomDetails(room.id); }}
                            style={{
                              background: '#8b5cf6',
                              color: '#fff',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            Details
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); joinRoom(room.id); }}
                            style={{
                              background: '#10b981',
                              color: '#fff',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            Join
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); leaveRoom(room.id); }}
                            style={{
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            Leave
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '2rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  No rooms found. Create one to get started!
                </div>
              )}
            </div>

            {/* Test Room by ID */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Test Room by ID:</h3>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={testRoomId}
                  onChange={(e) => setTestRoomId(e.target.value)}
                  placeholder="Enter room ID to test"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#fff',
                    flex: 1
                  }}
                />
                <button
                  onClick={testRoomById}
                  disabled={isLoading || !testRoomId.trim()}
                  style={{
                    background: '#f59e0b',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    opacity: (isLoading || !testRoomId.trim()) ? 0.5 : 1
                  }}
                >
                  Test Room
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Results:</h3>
              {result && (
                <div style={{
                  background: result.includes('✅') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: result.includes('✅') ? '#86efac' : '#fca5a5',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  marginBottom: '1rem'
                }}>
                  {result}
                </div>
              )}

              {roomDetails && (
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#93c5fd', marginBottom: '0.5rem' }}>Room Details:</h4>
                  <pre style={{
                    color: '#fff',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0
                  }}>
                    {JSON.stringify(roomDetails, null, 2)}
                  </pre>
                  
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => getRoomParticipants(roomDetails.id)}
                      style={{
                        background: '#8b5cf6',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Get Participants
                    </button>
                  </div>
                </div>
              )}

              {participants.length > 0 && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <h4 style={{ color: '#6ee7b7', marginBottom: '0.5rem' }}>Participants ({participants.length}):</h4>
                  <pre style={{
                    color: '#fff',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0
                  }}>
                    {JSON.stringify(participants, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Demo hints */}
            {DEMO_MODE && (
              <div style={{ 
                fontSize: '0.9rem', 
                color: 'rgba(255, 255, 255, 0.7)',
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <h4 style={{ color: '#93c5fd', marginBottom: '0.5rem' }}>Demo Mode Notes:</h4>
                <ul style={{ marginLeft: '1rem', lineHeight: '1.6' }}>
                  <li>Demo rooms have IDs 1 and 2 by default</li>
                  <li>Created rooms get timestamp-based IDs</li>
                  <li>Join/leave operations are simulated</li>
                  <li>Room data persists during the session</li>
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
} 