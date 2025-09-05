import uuid
from models import db
from sqlalchemy.dialects.postgresql import UUID

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=True)
    profile = db.Column(db.Text)
    name = db.Column(db.String(100))
    role = db.Column(db.String(50), default='user')  # e.g., 'admin', 'user', 'guest'

    notifications = db.relationship('Notification', backref='user', lazy=True)
    created_rooms = db.relationship('Room', backref='creator', lazy=True)
    room_participations = db.relationship('RoomParticipant', backref='user', lazy=True)