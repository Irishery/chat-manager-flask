import httpx

from datetime import datetime
from sqlalchemy import desc, text

from flask import Blueprint, jsonify, request
from app.models import User, Message
from app.socket.socket import send_message


user_api = Blueprint('user_api', __name__)

client = httpx.Client()

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


@user_api.route('/api/message/user/', methods=['POST'])
def send_message_to_manager():
    data = request.args.to_dict()
    data['sent_datetime'] = datetime.now()
    data['role'] = 'user'
    message = Message(**data)
    message.add_message()
    send_message(data['message_text'], data['telegram_id'])
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


@user_api.route('/api/message/manager/', methods=['POST'])
def send_message_to_user():
    data = request.args.to_dict()
    data['sent_datetime'] = datetime.now()
    data['role'] = 'manager'
    message = Message(**data)
    message.add_message()

    r = client.request(
                "post", "http://127.0.0.1:8181/send_message/",
                params=data,
                headers={'content-type': 'application/json'}
    )

    if r.json()['status'] == 'ok':
        return {'status': 'ok'}
    else:
        return {'status': 'error'}
