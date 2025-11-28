from flask import Blueprint, request, jsonify
from app.models.form import Form
from app.middleware.auth import protect, authorize

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/forms', methods=['GET'])
@protect
@authorize('admin')
def get_all_forms():
    try:
        status = request.args.get('status')
        
        forms = Form.find_all(status)
        
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

@admin_bp.route('/forms/pending', methods=['GET'])
@protect
@authorize('admin')
def get_pending_forms():
    try:
        forms = Form.find_pending()
        
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

@admin_bp.route('/forms/<form_id>/approve', methods=['PUT'])
@protect
@authorize('admin')
def approve_form(form_id):
    try:
        data = request.get_json() or {}
        review_comment = data.get('reviewComment', 'Approved').strip()
        
        form = Form.find_by_id(form_id)
        
        if not form:
            return jsonify({
                'success': False,
                'message': 'Form not found'
            }), 404
        
        if form.get('status') != 'pending':
            return jsonify({
                'success': False,
                'message': 'Form has already been reviewed'
            }), 400
        
        # Update form status
        updated_form = Form.update_status(
            form_id,
            'approved',
            request.user_id,
            review_comment or 'Approved'
        )
        
        # Populate user info
        updated_form = Form.populate_user_info(updated_form)
        
        return jsonify({
            'success': True,
            'message': 'Form approved successfully',
            'form': Form.to_dict(updated_form)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500

@admin_bp.route('/forms/<form_id>/reject', methods=['PUT'])
@protect
@authorize('admin')
def reject_form(form_id):
    try:
        data = request.get_json() or {}
        review_comment = data.get('reviewComment', '').strip()
        
        if not review_comment:
            return jsonify({
                'success': False,
                'errors': [{'field': 'reviewComment', 'message': 'Review comment is required for rejection'}]
            }), 400
        
        form = Form.find_by_id(form_id)
        
        if not form:
            return jsonify({
                'success': False,
                'message': 'Form not found'
            }), 404
        
        if form.get('status') != 'pending':
            return jsonify({
                'success': False,
                'message': 'Form has already been reviewed'
            }), 400
        
        # Update form status
        updated_form = Form.update_status(
            form_id,
            'rejected',
            request.user_id,
            review_comment
        )
        
        # Populate user info
        updated_form = Form.populate_user_info(updated_form)
        
        return jsonify({
            'success': True,
            'message': 'Form rejected successfully',
            'form': Form.to_dict(updated_form)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500

@admin_bp.route('/stats', methods=['GET'])
@protect
@authorize('admin')
def get_stats():
    try:
        total_forms = Form.count_all()
        pending_forms = Form.count_by_status('pending')
        approved_forms = Form.count_by_status('approved')
        rejected_forms = Form.count_by_status('rejected')
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total_forms,
                'pending': pending_forms,
                'approved': approved_forms,
                'rejected': rejected_forms
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500

