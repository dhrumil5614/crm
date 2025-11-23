from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.config.db import init_db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize CORS
    CORS(app)
    
    # Initialize database
    init_db()
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.forms import forms_bp
    from app.routes.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(forms_bp, url_prefix='/api/forms')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Health check route
    @app.route('/api/health')
    def health_check():
        from datetime import datetime
        return {
            'success': True,
            'message': 'CRM API is running',
            'timestamp': datetime.utcnow().isoformat()
        }
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {
            'success': False,
            'message': 'Route not found'
        }, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        import os
        return {
            'success': False,
            'message': 'Something went wrong!',
            'error': str(error) if os.getenv('FLASK_ENV') == 'development' else None
        }, 500
    
    return app

