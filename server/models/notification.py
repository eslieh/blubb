import uuid
from models import db
from sqlalchemy.dialects.postgresql import UUID


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    room_id = db.Column(UUID(as_uuid=True), db.ForeignKey('rooms.id'), nullable=True)
    notification_text = db.Column(db.Text, nullable=False)
    source = db.Column(db.String(50), nullable=False)  # e.g., 'show', 'comment', 'system'
    isread = db.Column(db.Boolean, default=False)  # Default to unread
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())