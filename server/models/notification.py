from models import db

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=True)
    notification_text = db.Column(db.Text, nullable=False)
    source = db.Column(db.String(50), nullable=False)  # e.g., 'show', 'comment', 'system'
    isread = db.Column(db.Boolean, default=False)  # Default to unread
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())