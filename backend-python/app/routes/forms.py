from flask import Blueprint, request, jsonify
from bson import ObjectId
from app.models.form import Form
from app.models.user import User
from app.middleware.auth import protect

forms_bp = Blueprint('forms', __name__)

VALID_CATEGORIES = ['Sales', 'Support', 'Marketing', 'HR', 'Other']
VALID_PRIORITIES = ['Low', 'Medium', 'High']

@forms_bp.route('/', methods=['POST'])
@protect
def create_form():
    try:
        data = request.get_json()
        
        # Validation
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        category = data.get('category', '')
        priority = data.get('priority', 'Medium')
        
        errors = []
        
        if not title:
            errors.append({'field': 'title', 'message': 'Title is required'})
        
        if not description:
            errors.append({'field': 'description', 'message': 'Description is required'})
        
        if category and category not in VALID_CATEGORIES:
            errors.append({'field': 'category', 'message': 'Invalid category'})
        
        if priority not in VALID_PRIORITIES:
            priority = 'Medium'
        
        if errors:
            return jsonify({
                'success': False,
                'errors': errors
            }), 400
        
        # Create form
        form = Form.create(
            request.user_id,
            title,
            description,
            category or 'Other',
            priority
        )
        
        # Populate user info
        form = Form.populate_user_info(form)
        
        return jsonify({
            'success': True,
            'message': 'Form submitted successfully and is pending approval',
            'form': Form.to_dict(form)
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500

@forms_bp.route('/', methods=['GET'])
@protect
def get_forms():
    try:
        status = request.args.get('status')
        
        forms = Form.find_by_user_id(request.user_id, status)
        
        # Populate user info for each form
        forms_with_populated = []
        for form in forms:
            form = Form.populate_user_info(form)
            forms_with_populated.append(Form.to_dict(form))
        
        return jsonify({
            'success': True,
            'count': len(forms_with_populated),
            'forms': forms_with_populated
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500

@forms_bp.route('/<form_id>', methods=['GET'])
@protect
def get_form(form_id):
    try:
        form = Form.find_by_id(form_id)
        
        if not form:
            return jsonify({
                'success': False,
                'message': 'Form not found'
            }), 404
        
        # Check if user is authorized to view this form
        user_id_str = str(form['userId'])
        if user_id_str != request.user_id and request.user.get('role') != 'admin':
            return jsonify({
                'success': False,
                'message': 'Not authorized to access this form'
            }), 403
        
        # Populate user info
        form = Form.populate_user_info(form)
        
        return jsonify({
            'success': True,
            'form': Form.to_dict(form)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500

@forms_bp.route('/<form_id>', methods=['DELETE'])
@protect
def delete_form(form_id):
    try:
        form = Form.find_by_id(form_id)
        
        if not form:
            return jsonify({
                'success': False,
                'message': 'Form not found'
            }), 404
        
        # Check if user owns the form
        user_id_str = str(form['userId'])
        if user_id_str != request.user_id and request.user.get('role') != 'admin':
            return jsonify({
                'success': False,
                'message': 'Not authorized to delete this form'
            }), 403
        
        # Only allow deletion if form is pending
        if form.get('status') != 'pending':
            return jsonify({
                'success': False,
                'message': 'Cannot delete a form that has been reviewed'
            }), 400
        
        Form.delete(form_id)
        
        return jsonify({
            'success': True,
            'message': 'Form deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500

