from flask import Blueprint, jsonify, request
from src.models.user import User, db

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        
        if not username:
            return jsonify({'error': 'Username is required'}), 400
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if len(username) < 3 or len(username) > 80:
            return jsonify({'error': 'Username must be between 3 and 80 characters'}), 400
        
        if '@' not in email or len(email) > 120:
            return jsonify({'error': 'Invalid email format or too long'}), 400
            
        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            return jsonify({'error': 'Username or email already exists'}), 409
        
        user = User(username=username, email=email)
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create user'}), 500

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username', '').strip() if data.get('username') else user.username
        email = data.get('email', '').strip() if data.get('email') else user.email
        
        if username != user.username:
            if len(username) < 3 or len(username) > 80:
                return jsonify({'error': 'Username must be between 3 and 80 characters'}), 400
                
            existing_user = User.query.filter(User.username == username, User.id != user_id).first()
            if existing_user:
                return jsonify({'error': 'Username already exists'}), 409
        
        if email != user.email:
            if '@' not in email or len(email) > 120:
                return jsonify({'error': 'Invalid email format or too long'}), 400
                
            existing_user = User.query.filter(User.email == email, User.id != user_id).first()
            if existing_user:
                return jsonify({'error': 'Email already exists'}), 409
        
        user.username = username
        user.email = email
        db.session.commit()
        return jsonify(user.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update user'}), 500

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete user'}), 500
