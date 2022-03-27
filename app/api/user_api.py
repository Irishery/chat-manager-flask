import json

from flask import Blueprint, jsonify, request
from app.models import User


user_api = Blueprint('user_api', __name__)

@user_api.route('/api/user/', methods=["GET"])
async def get_user():
    id = request.args.get('id')
    return jsonify(User.query.filter_by(id=id).first())


@user_api.route('/api/users', methods=["GET"])
def get_users():
    return jsonify(User.query.first())


@user_api.route('/api/user', methods=["POST"])
def add_user():
    data = json.loads(request.get_data().decode('utf-8'))
    user = User(**data)
    user.add_user()
    return jsonify(user)
