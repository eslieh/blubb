from models import db

class Room(db.Model):
    __tablename__ = 'rooms'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationships
    participants = db.relationship('RoomParticipant', backref='room', lazy=True)
    notifications = db.relationship('Notification', backref='room', lazy=True)

class RoomParticipant(db.Model):
    __tablename__ = 'room_participants'
    
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    is_muted = db.Column(db.Boolean, default=False)

    user = db.relationship('User', backref=db.backref('room_participations', lazy=True))
