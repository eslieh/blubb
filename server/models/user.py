from models import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=True)
    profile = db.Column(db.Text)
    name = db.Column(db.String(100))
    role = db.Column(db.String(50), default='user')  # e.g., 'admin', 'user', 'guest'

    notifications = db.relationship('Notification', backref='user', lazy=True)
