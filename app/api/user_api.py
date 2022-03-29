from datetime import datetime
import json

from flask import Blueprint, jsonify, request
from app.models import User, Message


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


@user_api.route('/api/message', methods=['POST'])
def send_message():
    data = json.loads(request.get_data().decode('utf-8'))
    data['sent_datetime'] = datetime.now()
    message = Message(**data)
    message.add_message()
    return jsonify(message)


@user_api.route('/api/message', methods=['GET'])
def get_messages():
    data = json.loads(request.get_data().decode('utf-8'))
    count = data['count']
    id = data['id']
    print(data)
