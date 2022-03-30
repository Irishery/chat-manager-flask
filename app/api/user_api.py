from datetime import datetime
from sqlalchemy import desc, text
import json

from flask import Blueprint, jsonify, request
from app.models import User, Message


user_api = Blueprint('user_api', __name__)

@user_api.route('/api/user/', methods=["GET"])
def get_user():
    data = request.args.to_dict()
    id = data['id']
    type = data['type']
    if type == 'telegram':    
            return jsonify(User.query.filter_by(telegram_id=id).first())
    return jsonify(User.query.filter_by(id=id).first())


@user_api.route('/api/users/', methods=["GET"])
def get_users():
    return jsonify(User.query.all())


@user_api.route('/api/user/', methods=["POST"])
def add_user():
    data = request.args.to_dict()
    user = User(**data)
    user.add_user()
    return jsonify(user)


@user_api.route('/api/message/', methods=['POST'])
def send_message():
    data = request.args.to_dict()
    data['sent_datetime'] = datetime.now()
    message = Message(**data)
    message.add_message()
    return jsonify(message)


@user_api.route('/api/message/', methods=['GET'])
def get_messages():
    data = request.args.to_dict()
    msg_id = data['msg_id']
    id = data['id']
    tel_id = User.query.filter_by(id=id).first().telegram_id

    if msg_id == '0':
        return jsonify(Message.query.filter(Message.telegram_id==tel_id).
        order_by(desc(text('id'))).limit(20).all())

    return jsonify(Message.query.filter(
        Message.id < msg_id, Message.telegram_id==tel_id).
        order_by(desc(text('id'))).limit(20).all())
