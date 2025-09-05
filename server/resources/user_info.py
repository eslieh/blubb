from flask import Flask, current_app, request
from flask_restful import Resource
from models import db, User
from flask_jwt_extended import jwt_required, get_jwt_identity
import json

class UserInfo(Resource):
    CACHE_TIMEOUT = 300  # seconds (5 minutes)

    def _get_user_from_cache(self, user_id):
        """Retrieve user info from cache or DB if not found."""
        cache = current_app.cache
        cached_data = cache.get(f"user:{user_id}")

        if cached_data:
            return json.loads(cached_data)  # return cached user info dict

        # If not cached, fetch from DB
        user = User.query.get(user_id)
        if not user:
            return None

        user_info = {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "profile": user.profile
        }

        # Store in cache
        cache.set(f"user:{user_id}", json.dumps(user_info), timeout=self.CACHE_TIMEOUT)
        return user_info

    def _invalidate_user_cache(self, user_id):
        """Remove user info from cache."""
        cache = current_app.cache
        cache.delete(f"user:{user_id}")

    @jwt_required()
    def get(self, user_id=None):
        """Get logged-in user's info (cached)."""
        current_user_id = get_jwt_identity()

        # Ensure user can only access their own info unless admins are allowed
        if user_id is None:
            user_id = current_user_id
        elif str(user_id) != str(current_user_id):
            return {"error": "Unauthorized"}, 403

        user_info = self._get_user_from_cache(user_id)
        if not user_info:
            return {"error": "User not found"}, 404

        return {"user": user_info}, 200

    @jwt_required()
    def put(self):
        """Update logged-in user's info and refresh cache."""
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
            return {"error": "User not found"}, 404                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 

        args = request.get_json()
        updated = False

        if 'name' in args and args['name'] != user.name:
            user.name = args['name']
            updated = True
        if 'profile' in args and args['profile'] != user.profile:
            user.profile = args['profile']
            updated = True

        if updated:
            db.session.commit()
            self._invalidate_user_cache(user_id)  # clear old cache                                                                                                                                                                                                                                                                                                                                                                         
            self._get_user_from_cache(user_id)    # refresh cache

        return {"message": "User info updated successfully"}, 200
