import httpx
import base64

from PIL import Image
from io import BytesIO

from datetime import datetime
from sqlalchemy import desc, text, update

from flask import Blueprint, jsonify, request
from app.models import User, Message, Manager, db
from app.sockets.socket import send_message


user_api = Blueprint('user_api', __name__)

client = httpx.Client(timeout=None)

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


@user_api.route('/api/user/pic/', methods=['POST'])
def add_user_avatar():
    data = request.get_data()
    params = request.args.to_dict()
    telegram_id = params['telegram_id']
    avatar_path = f'static/images/avatar_{telegram_id}.jpg'
    
    user = User.query.filter_by(telegram_id=telegram_id).first()
    user.avatar_path = avatar_path
    db.session.commit()
    
    im = Image.open(BytesIO(base64.b64decode(data)))
    im.save('app/' + avatar_path, 'jpeg')
    
    return {'ok': 'ok'}


@user_api.route('/api/manager/notifications/', methods=['GET'])
def get_notifications():
    data = request.args.to_dict()
    manager_id = data['id']
    notifications = Manager.query.filter_by(id=manager_id).first().unread_msgs
    resp = {
        'notifications': []
    }

    for notify in set(notifications):
        id, name = notify.split('_')
        validated_notify = {'id': id, 'name': name}
        resp['notifications'].append(validated_notify)

    return resp


@user_api.route('/api/manager/notifications/', methods=["DELETE"])
def delete_notifications():
    data = request.args.to_dict()
    manager_id = data['manager_id']
    user_id = data['user_id']
    nickname = data['nickname']

    db.session.execute(update(Manager).filter_by(id=manager_id)\
    .values(unread_msgs=text(f'array_remove({Manager.unread_msgs.name}, :tag)')),
    {'tag': str(user_id) + f'_{nickname}'})

    db.session.commit()

    return {'response': f'notifications from the user-{user_id} \
                            have been successfully deleted'}


@user_api.route('/api/message/user/', methods=['POST'])
def send_message_to_manager():
    data = request.args.to_dict()
    data['sent_datetime'] = datetime.now()
    data['role'] = 'user'
    message = Message(**data)
    message.add_message()

    user = User.query.filter_by(telegram_id=data['telegram_id']).first()

    db.session.execute(update(
        Manager
    ).values(unread_msgs=text(f'array_append({Manager.unread_msgs.name}, :tag)')),
    {'tag': str(user.id) + f'_{user.nickname}'})

    db.session.commit()

    send_message(data['message_text'], user)
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
