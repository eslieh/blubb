from flask import redirect, jsonify, url_for, request
from flask_restful import Resource
from flask_dance.contrib.google import google
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from models import db, User
from flask_bcrypt import Bcrypt
import phonenumbers
from urllib.parse import urlencode

bcrypt = Bcrypt()
class GoogleAuth(Resource):
    def get(self):
        if not google.authorized:
            return redirect(url_for("google.login"))

        resp = google.get("/oauth2/v2/userinfo")
        if not resp.ok:
            return {"error": "Failed to fetch user info from Google"}, 400

        user_info = resp.json()
        email = user_info["email"]
        name = user_info.get("name", "")
        profile = user_info.get("picture", "")

        # Check if user exists, else create
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(email=email, name=name, profile=profile)
            db.session.add(user)
            db.session.commit()

        # Create JWT token
        access_token = create_access_token(identity=str(user.id))
        # redirect_url = f"https://heartframed.vercel.app/auth?{urlencode({'token': access_token, 'email': user.email, 'id': user.id, 'name': user.name, 'profile': user.profile})}"
        # return redirect(redirect_url)
        return {"access_token": access_token, "user": {"id": user.id, "email": user.email, "profile":user.profile, "name": user.name}}, 200

class Login(Resource):
    
    def post(self):
        # This route is for handling login via username/password
        # Implementation would go here, similar to the GoogleAuth route
        args = request.get_json()
        email = args.get('email')
        password = args.get('password')
        
        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(identity=str(user.id))
            return {"access_token": access_token, "user": {"id": user.id, "email": user.email, 'name': user.name, 'profile': user.profile}}, 200
        else:
            return {"error": "Invalid credentials"}, 401
        
class Register(Resource):
    def post(self):
        # This route is for handling user registration
        args = request.get_json()
        email = args.get('email')
        password = args.get('password')
        name = args.get('name', '')
        
        if User.query.filter_by(email=email).first():
            return {"error": "User already exists"}, 400
        
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(email=email, password=hashed_password, name=name)
        
        db.session.add(new_user)
        db.session.commit()
        
        return {"message": "User registered successfully, you can now loggin"}, 201
    

class PhoneNumberResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return {"error": "User not found"}, 404

        args = request.get_json() or {}
        phone_number = args.get('phone_number')

        if not phone_number:
            return {"error": "Phone number is required"}, 400

        # --- Validate phone number format ---
        try:
            parsed_number = phonenumbers.parse(phone_number, None)  # None means expect full international format
            if not phonenumbers.is_valid_number(parsed_number):
                return {"error": "Invalid phone number format"}, 400

            # Normalize to E.164 format (e.g., +254712345678)
            normalized_number = phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.E164)
        except phonenumbers.NumberParseException:
            return {"error": "Invalid phone number"}, 400

        # --- Check uniqueness ---
        existing_user = User.query.filter(User.phone == normalized_number, User.id != user_id).first()
        if existing_user:
            return {"error": "Phone number already registered to another account"}, 409

        # --- Save number ---
        user.phone = normalized_number
        db.session.commit()

        return {
            "message": "Phone number updated successfully",
            "phone_number": normalized_number
        }, 200