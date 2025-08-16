# Room Management API

## API Endpoints Summary
all apis are sent with accesstoken authorisation

### 1. **RoomListResource**
- **GET** `/rooms` — List all rooms for the current user  

{
    "rooms": [
        {
            "id": 2,
            "name": "squad",
            "description": "description",
            "created_by": 1,
            "created_at": "2025-08-14T23:11:03.628772",
            "participants_count": 1
        }
    ]
}

- **POST** `/rooms` — Create a new room  
payload: {
    "name": "roomname",
    "description": "descr"
}
responce {
    "message": "Room created successfully",
    "room": {
                "id": room.id,
                "name": room.name,
                "description": room.description,
                "created_by": room.created_by,
                "created_at": room.created_at.isoformat()
            }
}

### 2. **RoomDetailResource**
- **GET** `/rooms/{room_id}` — Get details of a single room  
{
    "room": {
        "id": 2,
        "name": "squad",
        "description": "description",
        "created_by": 1,
        "created_at": "2025-08-14T23:11:03.628772",
        "participants_count": 1,
        "max_participants": 10,
        "is_full": false,
        "creator": {
            "id": 1,
            "name": "vick",
            "profile": "https://lh3.googleusercontent.com/a/ACg8ocK2oCkbJ505A9IFylxSHa-vDrpmxoqsJV02rFZ8j2Yx-IHPZpBy=s96-c"
        },
        "participants": [
            {
                "id": 1,
                "name": "vick",
                "profile": "https://lh3.googleusercontent.com/a/ACg8ocK2oCkbJ505A9IFylxSHa-vDrpmxoqsJV02rFZ8j2Yx-IHPZpBy=s96-c",
                "joined_at": "2025-08-14T23:21:37.190085",
                "is_muted": false
            }
        ]
    }
}


### 3. **RoomParticipantsResource**
- **GET** `/rooms/{room_id}/participants` — Get participants of a specific room  

{
    "participants": [
        {
            "id": 1,
            "name": "vick",
            "profile": "profile_url",
            "joined_at": "2025-08-14T23:21:37.190085",
            "is_muted": false
        }
    ]
}

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
