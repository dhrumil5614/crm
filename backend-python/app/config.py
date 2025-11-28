import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('JWT_SECRET', 'your-secret-key-change-this')
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/crm_db')
    JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-this')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    PORT = int(os.getenv('PORT', 5001))

