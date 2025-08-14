from flask import request, current_app
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Room, RoomParticipant, User
from datetime import datetime
import json
from functools import wraps


def cache_key_generator(*args, **kwargs):
    """Generate consistent cache keys."""
    key_parts = []
    for arg in args:
        if isinstance(arg, (str, int)):
            key_parts.append(str(arg))
    for k, v in sorted(kwargs.items()):
        key_parts.append(f"{k}:{v}")
    return ":".join(key_parts)


def cached_response(timeout=60, key_prefix=""):
    """Decorator for caching API responses."""
    def decorator(f):
        @wraps(f)
        def wrapper(self, *args, **kwargs):
            # Generate cache key
            user_id = get_jwt_identity() if hasattr(self, '_method_name') else None
            cache_key = cache_key_generator(key_prefix, user_id or "", *args)
            
            # Try to get from cache
            cached_data = current_app.cache.get(cache_key)
            if cached_data:
                return json.loads(cached_data), 200
            
            # Execute function and cache result
            result = f(self, *args, **kwargs)
            if isinstance(result, tuple) and len(result) == 2:
                data, status_code = result
                if status_code == 200:
                    current_app.cache.set(cache_key, json.dumps(data), timeout=timeout)
            
            return result
        return wrapper
    return decorator


def invalidate_cache(*patterns):
    """Decorator to invalidate cache patterns after successful operations."""
    def decorator(f):
        @wraps(f)
        def wrapper(self, *args, **kwargs):
            result = f(self, *args, **kwargs)
            
            # Only invalidate on successful operations
            if isinstance(result, tuple) and len(result) == 2:
                _, status_code = result
                if status_code in [200, 201]:
                    user_id = get_jwt_identity()
                    room_id = kwargs.get('room_id') or (args[0] if args else None)
                    
                    for pattern in patterns:
                        cache_keys = pattern.format(user_id=user_id, room_id=room_id)
                        if isinstance(cache_keys, list):
                            for key in cache_keys:
                                current_app.cache.delete(key)
                        else:
                            current_app.cache.delete(cache_keys)
            
            return result
        return wrapper
    return decorator


class CacheManager:
    """Centralized cache management for room-related data."""
    
    @staticmethod
    def get_user_rooms_key(user_id):
        return f"user:{user_id}:rooms"
    
    @staticmethod
    def get_room_participants_key(room_id):
        return f"room:{room_id}:participants"
    
    @staticmethod
    def get_room_details_key(room_id):
        return f"room:{room_id}:details"
    
    @staticmethod
    def get_user_room_membership_key(user_id, room_id):
        return f"user:{user_id}:room:{room_id}:member"
    
    @staticmethod
    def invalidate_room_related_cache(user_id, room_id):
        """Invalidate all caches related to a room and user."""
        keys_to_delete = [
            CacheManager.get_user_rooms_key(user_id),
            CacheManager.get_room_participants_key(room_id),
            CacheManager.get_room_details_key(room_id),
            CacheManager.get_user_room_membership_key(user_id, room_id)
        ]
        
        for key in keys_to_delete:
            current_app.cache.delete(key)
    
    @staticmethod
    def cache_room_membership(user_id, room_id, is_member=True, timeout=300):
        """Cache user's room membership status."""
        key = CacheManager.get_user_room_membership_key(user_id, room_id)
        current_app.cache.set(key, is_member, timeout=timeout)
    
    @staticmethod
    def get_room_membership(user_id, room_id):
        """Get cached room membership status."""
        key = CacheManager.get_user_room_membership_key(user_id, room_id)
        return current_app.cache.get(key)


class RoomListResource(Resource):
    @jwt_required()
    def get(self):
        """List all rooms for the current user with optimized caching."""
        current_user_id = get_jwt_identity()
        cache_key = CacheManager.get_user_rooms_key(current_user_id)

        # Try cache first
        cached_rooms = current_app.cache.get(cache_key)
        if cached_rooms:
            return {"rooms": json.loads(cached_rooms)}, 200

        # Optimized query with eager loading
        rooms = (
            db.session.query(Room)
            .join(RoomParticipant, Room.id == RoomParticipant.room_id)
            .filter(RoomParticipant.user_id == current_user_id)
            .options(db.joinedload(Room.participants))  # Eager load participants
            .all()
        )

        room_list = []
        for room in rooms:
            room_data = {
                "id": room.id,
                "name": room.name,
                "description": room.description,
                "created_by": room.created_by,
                "created_at": room.created_at.isoformat(),
                "participants_count": len(room.participants)
            }
            room_list.append(room_data)
            
            # Cache individual room details while we have them
            room_cache_key = CacheManager.get_room_details_key(room.id)
            current_app.cache.set(room_cache_key, json.dumps(room_data), timeout=120)

        # Cache the result with longer timeout since room membership doesn't change often
        current_app.cache.set(cache_key, json.dumps(room_list), timeout=180)

        return {"rooms": room_list}, 200

    @jwt_required()
    @invalidate_cache(
        lambda user_id, **kwargs: CacheManager.get_user_rooms_key(user_id)
    )
    def post(self):
        """Create a new room with cache invalidation."""
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data or not data.get("name"):
            return {"error": "Room name is required"}, 400

        try:
            # Use transaction for atomicity
            with db.session.begin():
                room = Room(
                    name=data["name"],
                    description=data.get("description"),
                    created_by=current_user_id
                )
                db.session.add(room)
                db.session.flush()  # Get the ID without committing

                # Add the creator as a participant
                participant = RoomParticipant(
                    room_id=room.id,
                    user_id=current_user_id,
                    joined_at=datetime.utcnow()
                )
                db.session.add(participant)

            # Cache the new room membership
            CacheManager.cache_room_membership(current_user_id, room.id, True)

            room_data = {
                "id": room.id,
                "name": room.name,
                "description": room.description,
                "created_by": room.created_by,
                "created_at": room.created_at.isoformat()
            }

            return {
                "message": "Room created successfully",
                "room": room_data
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"error": "Failed to create room"}, 500


class RoomParticipantsResource(Resource):
    @jwt_required()
    def get(self, room_id):
        """Fetch participants of a room with intelligent caching."""
        current_user_id = get_jwt_identity()
        
        # Check if user is a member (with caching)
        is_member = CacheManager.get_room_membership(current_user_id, room_id)
        if is_member is None:
            # Check database and cache result
            participant = RoomParticipant.query.filter_by(
                room_id=room_id, 
                user_id=current_user_id
            ).first()
            is_member = participant is not None
            CacheManager.cache_room_membership(current_user_id, room_id, is_member)
        
        if not is_member:
            return {"error": "Access denied"}, 403

        cache_key = CacheManager.get_room_participants_key(room_id)
        cached_participants = current_app.cache.get(cache_key)
        
        if cached_participants:
            return {"participants": json.loads(cached_participants)}, 200

        # Optimized query with eager loading
        room = (
            db.session.query(Room)
            .options(
                db.joinedload(Room.participants).joinedload(RoomParticipant.user)
            )
            .get(room_id)
        )
        
        if not room:
            return {"error": "Room not found"}, 404

        participants = [
            {
                "id": p.user.id,
                "name": p.user.name,
                "email": p.user.email,
                "joined_at": p.joined_at.isoformat() if p.joined_at else None,
                "is_muted": getattr(p, 'is_muted', False)
            }
            for p in room.participants
        ]

        # Cache with shorter timeout since participants can change more frequently
        current_app.cache.set(cache_key, json.dumps(participants), timeout=60)

        return {"participants": participants}, 200


class RoomJoinResource(Resource):
    @jwt_required()
    def post(self, room_id):
        """Join a room with optimized caching."""
        current_user_id = get_jwt_identity()
        
        # Check room existence (use cache if available)
        room_cache_key = CacheManager.get_room_details_key(room_id)
        cached_room = current_app.cache.get(room_cache_key)
        
        if not cached_room:
            room = Room.query.get(room_id)
            if not room:
                return {"error": "Room not found"}, 404
        
        # Check existing membership with cache
        is_member = CacheManager.get_room_membership(current_user_id, room_id)
        if is_member is None:
            existing = RoomParticipant.query.filter_by(
                room_id=room_id, 
                user_id=current_user_id
            ).first()
            if existing:
                CacheManager.cache_room_membership(current_user_id, room_id, True)
                return {"message": "Already joined"}, 200
            is_member = False
        elif is_member:
            return {"message": "Already joined"}, 200

        try:
            participant = RoomParticipant(
                room_id=room_id,
                user_id=current_user_id,
                joined_at=datetime.utcnow()
            )
            db.session.add(participant)
            db.session.commit()

            # Update caches
            CacheManager.invalidate_room_related_cache(current_user_id, room_id)
            CacheManager.cache_room_membership(current_user_id, room_id, True)

            return {"message": "Joined room successfully"}, 201

        except Exception as e:
            db.session.rollback()
            return {"error": "Failed to join room"}, 500


class RoomLeaveResource(Resource):
    @jwt_required()
    def delete(self, room_id):
        """Leave a room with cache management."""
        current_user_id = get_jwt_identity()
        
        # Check membership with cache
        is_member = CacheManager.get_room_membership(current_user_id, room_id)
        if is_member is False:
            return {"error": "Not a participant of this room"}, 400
        
        participant = RoomParticipant.query.filter_by(
            room_id=room_id, 
            user_id=current_user_id
        ).first()

        if not participant:
            # Update cache to reflect reality
            CacheManager.cache_room_membership(current_user_id, room_id, False)
            return {"error": "Not a participant of this room"}, 400

        try:
            db.session.delete(participant)
            db.session.commit()

            # Update caches
            CacheManager.invalidate_room_related_cache(current_user_id, room_id)
            CacheManager.cache_room_membership(current_user_id, room_id, False)

            return {"message": "Left room successfully"}, 200

        except Exception as e:
            db.session.rollback()
            return {"error": "Failed to leave room"}, 500


# Additional utility for bulk cache warming
class CacheWarmupResource(Resource):
    @jwt_required()
    def post(self):
        """Warm up cache for frequently accessed data."""
        current_user_id = get_jwt_identity()
        
        # Warm up user's rooms
        rooms = (
            db.session.query(Room)
            .join(RoomParticipant, Room.id == RoomParticipant.room_id)
            .filter(RoomParticipant.user_id == current_user_id)
            .options(db.joinedload(Room.participants))
            .all()
        )
        
        room_list = []
        for room in rooms:
            room_data = {
                "id": room.id,
                "name": room.name,
                "description": room.description,
                "created_by": room.created_by,
                "created_at": room.created_at.isoformat(),
                "participants_count": len(room.participants)
            }
            room_list.append(room_data)
            
            # Cache individual room details
            room_cache_key = CacheManager.get_room_details_key(room.id)
            current_app.cache.set(room_cache_key, json.dumps(room_data), timeout=120)
            
            # Cache membership
            CacheManager.cache_room_membership(current_user_id, room.id, True)
        
        # Cache user's room list
        user_rooms_key = CacheManager.get_user_rooms_key(current_user_id)
        current_app.cache.set(user_rooms_key, json.dumps(room_list), timeout=180)
        
        return {"message": "Cache warmed up successfully"}, 200