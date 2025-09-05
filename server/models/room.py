import uuid
from models import db
from sqlalchemy.dialects.postgresql import UUID
 
class Room(db.Model):
    __tablename__ = 'rooms'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    participants = db.relationship('RoomParticipant', backref='room', lazy=True)
    notifications = db.relationship('Notification', backref='room', lazy=True)


class RoomParticipant(db.Model):
    __tablename__ = 'room_participants'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = db.Column(UUID(as_uuid=True), db.ForeignKey('rooms.id'), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    is_muted = db.Column(db.Boolean, default=False)

