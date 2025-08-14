# Room Management API

## API Endpoints Summary

### 1. **RoomListResource**
- **GET** `/rooms` — List all rooms for the current user  
- **POST** `/rooms` — Create a new room  

### 2. **RoomDetailResource**
- **GET** `/rooms/{room_id}` — Get details of a single room  

### 3. **RoomParticipantsResource**
- **GET** `/rooms/{room_id}/participants` — Get participants of a specific room  

### 4. **RoomJoinResource**
- **POST** `/rooms/{room_id}/join` — Join a room  

### 5. **RoomLeaveResource**
- **DELETE** `/rooms/{room_id}/leave` — Leave a room  

### 6. **CacheWarmupResource**
- **POST** `/cache/warmup` — Warm up cache for frequently accessed data  

---

## Complete Endpoint List

| Method | Endpoint                        | Description                          | Authentication |
|--------|----------------------------------|--------------------------------------|----------------|
| GET    | `/rooms`                         | List user's rooms                    | JWT Required   |
| POST   | `/rooms`                         | Create new room                      | JWT Required   |
| GET    | `/rooms/{id}`                    | Get single room details              | JWT Required   |
| GET    | `/rooms/{id}/participants`       | Get room participants                | JWT Required   |
| POST   | `/rooms/{id}/join`               | Join a room                          | JWT Required   |
| DELETE | `/rooms/{id}/leave`              | Leave a room                         | JWT Required   |
| POST   | `/cache/warmup`                  | Warm up user's cache                 | JWT Required   |
