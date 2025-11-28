from flask import Blueprint, request, jsonify
from app.models.user import User
from app.middleware.auth import generate_token, protect
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Simple email validation"""
    pattern = r'^\S+@\S+\.\S+$'
    return re.match(pattern, email) is not None

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validation
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        role = data.get('role', 'user')
        
        errors = []
        
        if not name:
            errors.append({'field': 'name', 'message': 'Name is required'})
        
        if not email:
            errors.append({'field': 'email', 'message': 'Email is required'})
        elif not validate_email(email):
            errors.append({'field': 'email', 'message': 'Please provide a valid email'})
        
        if not password:
            errors.append({'field': 'password', 'message': 'Password is required'})
        elif len(password) < 6:
            errors.append({'field': 'password', 'message': 'Password must be at least 6 characters'})
        
        if errors:
            return jsonify({
                'success': False,
                'errors': errors
            }), 400
        
        # Check if user already exists
        existing_user = User.find_by_email(email)
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'User already exists with this email'
            }), 400
        
        # Create user
        user = User.create(name, email, password, role)
        
        # Generate token
        token = generate_token(user['_id'])
        
        return jsonify({
            'success': True,
            'token': token,
            'user': User.to_dict(user)
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validation
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        errors = []
        
        if not email:
            errors.append({'field': 'email', 'message': 'Email is required'})
        elif not validate_email(email):
            errors.append({'field': 'email', 'message': 'Please provide a valid email'})
        
        if not password:
            errors.append({'field': 'password', 'message': 'Password is required'})
        
        if errors:
            return jsonify({
                'success': False,
                'errors': errors
            }), 400
        
        # Check if user exists
        user = User.find_by_email(email)
        if not user:
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 401
        
        # Check password
        hashed_password = user.get('password')
        if not User.compare_password(hashed_password, password):
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 401
        
        # Generate token
        token = generate_token(user['_id'])
        
        return jsonify({
            'success': True,
            'token': token,
            'user': User.to_dict(user)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500

@auth_bp.route('/me', methods=['GET'])
@protect
def get_me():
    try:
        user = User.find_by_id(request.user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'user': User.to_dict(user)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500

