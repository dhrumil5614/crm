from datetime import datetime
from bson import ObjectId
from app.config.db import get_db

class Form:
    @staticmethod
    def create(user_id, title, description, category, priority='Medium'):
        db = get_db()
        forms = db.forms
        
        form_data = {
            'userId': ObjectId(user_id),
            'title': title.strip(),
            'description': description.strip(),
            'category': category,
            'priority': priority,
            'status': 'pending',
            'reviewedBy': None,
            'reviewedAt': None,
            'reviewComment': '',
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        result = forms.insert_one(form_data)
        form_data['_id'] = result.inserted_id
        return form_data
    
    @staticmethod
    def find_by_id(form_id):
        db = get_db()
        try:
            return db.forms.find_one({'_id': ObjectId(form_id)})
        except:
            return None
    
    @staticmethod
    def find_by_user_id(user_id, status=None):
        db = get_db()
        query = {'userId': ObjectId(user_id)}
        if status:
            query['status'] = status
        
        return list(db.forms.find(query).sort('createdAt', -1))
    
    @staticmethod
    def find_all(status=None):
        db = get_db()
        query = {}
        if status:
            query['status'] = status
        
        return list(db.forms.find(query).sort('createdAt', -1))
    
    @staticmethod
    def find_pending():
        db = get_db()
        return list(db.forms.find({'status': 'pending'}).sort('createdAt', -1))
    
    @staticmethod
    def update_status(form_id, status, reviewed_by, review_comment):
        db = get_db()
        update_data = {
            'status': status,
            'reviewedBy': ObjectId(reviewed_by),
            'reviewedAt': datetime.utcnow(),
            'reviewComment': review_comment,
            'updatedAt': datetime.utcnow()
        }
        
        db.forms.update_one(
            {'_id': ObjectId(form_id)},
            {'$set': update_data}
        )
        
        return Form.find_by_id(form_id)
    
    @staticmethod
    def delete(form_id):
        db = get_db()
        result = db.forms.delete_one({'_id': ObjectId(form_id)})
        return result.deleted_count > 0
    
    @staticmethod
    def count_all():
        db = get_db()
        return db.forms.count_documents({})
    
    @staticmethod
    def count_by_status(status):
        db = get_db()
        return db.forms.count_documents({'status': status})
    
    @staticmethod
    def populate_user_info(form):
        """Populate userId field with user info"""
        from app.models.user import User
        
        if form and form.get('userId'):
            user = User.find_by_id(form['userId'])
            if user:
                form['userId'] = {
                    '_id': user['_id'],
                    'name': user.get('name'),
                    'email': user.get('email')
                }
        
        if form and form.get('reviewedBy'):
            reviewer = User.find_by_id(form['reviewedBy'])
            if reviewer:
                form['reviewedBy'] = {
                    '_id': reviewer['_id'],
                    'name': reviewer.get('name'),
                    'email': reviewer.get('email')
                }
            else:
                form['reviewedBy'] = None
        
        return form
    
    @staticmethod
    def to_dict(form):
        if not form:
            return None
        
        form_dict = {
            'id': str(form['_id']),
            'userId': str(form['userId']) if isinstance(form['userId'], ObjectId) else form['userId'],
            'title': form.get('title'),
            'description': form.get('description'),
            'category': form.get('category'),
            'priority': form.get('priority'),
            'status': form.get('status'),
            'reviewedBy': str(form['reviewedBy']) if isinstance(form.get('reviewedBy'), ObjectId) else form.get('reviewedBy'),
            'reviewedAt': form.get('reviewedAt').isoformat() if form.get('reviewedAt') else None,
            'reviewComment': form.get('reviewComment', ''),
            'createdAt': form.get('createdAt').isoformat() if form.get('createdAt') else None,
            'updatedAt': form.get('updatedAt').isoformat() if form.get('updatedAt') else None
        }
        
        return form_dict

