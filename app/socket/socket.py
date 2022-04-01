from os import remove
from socket import socket
from flask_socketio import SocketIO, send, emit
from flask import request, session
from app.models import User

socketio = SocketIO()

dialogs = {

}

sockets = {

}

def remove_id(id):
    if id in sockets.keys():
        dialogs[sockets[id]].remove(id)
        sockets.pop(id, None)

def set_id(data):

    if data['socket_id'] in sockets.keys():
        if sockets[data['socket_id']] != data['user_id']:
            remove_id(data['socket_id'])

    sockets[data['socket_id']] = data['user_id']

    if data['user_id'] in dialogs.keys():
        if data['socket_id'] not in dialogs[data['user_id']]:
            dialogs[data['user_id']].append(data['socket_id'])
        else:
            pass
    else:
        dialogs[data['user_id']] = [data['socket_id']]
    
    print(dialogs)


def send_message(message, telegram_id):
    id = User.query.filter_by(telegram_id=telegram_id).first().id
    for socket in dialogs[id]:
        emit('send_message', {'message': message}, room=socket, namespace='/')
    print(dialogs)

@socketio.on('message')
def handle_message(data):
    print('received message: ' + data)


@socketio.on('set_id')
def handle_id(data):
    print('SET ID')
    print(data)
    set_id(data)
    print('received message: ' + str(data))


@socketio.on('json')
def handle_json(json):
    print('received json: ' + str(json))


@socketio.on('connect')
def test_connect(auth):
    emit('my response', {'data': 'Connected'})

@socketio.on('disconnect')
def test_disconnect():
    print(dialogs.items())
    print(request.sid)
    print(request.namespace)
    remove_id(request.sid)
    print(dialogs)

    print('Client disconnected')