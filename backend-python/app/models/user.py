from datetime import datetime
from bson import ObjectId
from app.config.db import get_db
import bcrypt

class User:
    @staticmethod
    def create(name, email, password, role='user'):
        db = get_db()
        users = db.users
        
        # Hash password
        salt = bcrypt.gensalt(rounds=10)
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        user_data = {
            'name': name.strip(),
            'email': email.lower().strip(),
            'password': hashed_password.decode('utf-8'),
            'role': role if role == 'admin' else 'user',
            'createdAt': datetime.utcnow()
        }
        
        result = users.insert_one(user_data)
        user_data['_id'] = result.inserted_id
        user_data.pop('password', None)  # Remove password from return
        return user_data
    
    @staticmethod
    def find_by_email(email):
        db = get_db()
        return db.users.find_one({'email': email.lower().strip()})
    
    @staticmethod
    def find_by_id(user_id):
        db = get_db()
        try:
            return db.users.find_one({'_id': ObjectId(user_id)})
        except:
            return None
    
    @staticmethod
    def compare_password(hashed_password, candidate_password):
        return bcrypt.checkpw(
            candidate_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    
    @staticmethod
    def to_dict(user, include_password=False):
        if not user:
            return None
        
        user_dict = {
            'id': str(user['_id']),
            'name': user.get('name'),
            'email': user.get('email'),
            'role': user.get('role', 'user'),
            'createdAt': user.get('createdAt').isoformat() if user.get('createdAt') else None
        }
        
        if include_password:
            user_dict['password'] = user.get('password')
        
        return user_dict

