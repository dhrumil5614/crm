from pymongo import MongoClient
from app.config import Config
import os

client = None
db = None

def init_db():
    global client, db
    try:
        client = MongoClient(Config.MONGODB_URI)
        db = client.get_database()
        # Test connection
        client.admin.command('ping')
        print('MongoDB Connected Successfully')
    except Exception as error:
        print(f'MongoDB Connection Error: {error}')
        raise

def get_db():
    global db
    if db is None:
        init_db()
    return db

