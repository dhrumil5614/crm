from functools import wraps
from flask import request, jsonify
import jwt
from app.config import Config
from app.models.user import User

def generate_token(user_id):
    """Generate JWT token"""
    payload = {'id': str(user_id)}
    token = jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')
    return token

def protect(f):
    """Protect routes - verify JWT token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Check if token exists in headers
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Not authorized to access this route'
            }), 401
        
        try:
            # Verify token
            decoded = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
            user_id = decoded.get('id')
            
            # Get user from token
            user = User.find_by_id(user_id)
            
            if not user:
                return jsonify({
                    'success': False,
                    'message': 'User not found'
                }), 401
            
            # Attach user to request
            request.user = user
            request.user_id = user_id
            
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token has expired'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'message': 'Not authorized to access this route'
            }), 401
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Not authorized to access this route'
            }), 401
    
    return decorated_function

def authorize(*roles):
    """Authorize specific roles"""
    def decorator(f):
        @wraps(f)
        @protect
        def decorated_function(*args, **kwargs):
            user_role = request.user.get('role', 'user')
            
            if user_role not in roles:
                return jsonify({
                    'success': False,
                    'message': f"User role '{user_role}' is not authorized to access this route"
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

