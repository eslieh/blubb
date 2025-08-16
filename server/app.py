import eventlet
eventlet.monkey_patch()
import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from flask import Flask
from flask_restful import Api
from flask_caching import Cache
from flask_jwt_extended import JWTManager
from flask_dance.contrib.google import make_google_blueprint
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_cors import CORS
import redis
import ssl
from socketio_server import init_socketio, socketio

from config import Config
from models import db
from flask_restful import Resource

# Import your resources
from resources.auth import GoogleAuth, Login, Register
from resources.user_info import UserInfo
from resources.room import RoomListResource, RoomJoinResource, RoomLeaveResource, RoomParticipantsResource, RoomDetailResource, CacheWarmupResource
import sqlalchemy.pool
bcrypt = Bcrypt()


def create_app():
    app = Flask(__name__)
    
    app.config.from_object(Config)
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "poolclass": sqlalchemy.pool.NullPool
    }

    # Extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager()  
    jwt.init_app(app)
    migrate = Migrate(app, db)
    CORS(app)  # Enable CORS for all routes

    # ---- Caching (Flask-Caching) ----
    cache = Cache(app)              # Uses Config (CACHE_TYPE, etc.)
    app.cache = cache
    
    # ---- (Optional) direct Redis connection if you need it besides caching ----
    redis_url = app.config.get("CACHE_REDIS_URL")
    if redis_url:
        redis_connection_kwargs = {"decode_responses": True}
        if redis_url.startswith("rediss://"):
            redis_connection_kwargs["ssl"] = True
            redis_connection_kwargs["ssl_cert_reqs"] = ssl.CERT_NONE
        app.redis = redis.Redis.from_url(redis_url, **redis_connection_kwargs)
    
    # ---- Google OAuth blueprint ----
    google_bp = make_google_blueprint(
        client_id=Config.GOOGLE_CLIENT_ID,
        client_secret=Config.GOOGLE_CLIENT_SECRET,
        scope=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ],
        redirect_url="/auth/google",
    )
    app.register_blueprint(google_bp, url_prefix="/login")

    # ---- API resources ----
    api = Api(app)
    
    # Health check endpoint for Redis
    class HealthCheck(Resource):
        def get(self):
            try:
                app.redis.ping()
                return {"status": "healthy", "redis": "connected"}, 200
            except redis.ConnectionError:
                return {"status": "healthy", "redis": "disconnected"}, 200

    # Register all API resources (routes)
    api.add_resource(HealthCheck, '/health')

    api.add_resource(GoogleAuth, '/auth/google')
    api.add_resource(Login, '/auth/signin')
    api.add_resource(Register, '/auth/signup')
    
    api.add_resource(UserInfo, '/user/<int:user_id>', '/user')

    # Room management endpoints
    api.add_resource(RoomListResource, '/rooms')
    api.add_resource(RoomDetailResource, '/rooms/<int:room_id>')
    api.add_resource(RoomParticipantsResource, '/rooms/<int:room_id>/participants')
    api.add_resource(RoomJoinResource, '/rooms/<int:room_id>/join')
    api.add_resource(RoomLeaveResource, '/rooms/<int:room_id>/leave')

    # Utility endpoints
    api.add_resource(CacheWarmupResource, '/cache/warmup')

    return app


# For gunicorn / production import
app = create_app()
init_socketio(app)

if __name__ == '__main__':
    app.run(debug=True)
