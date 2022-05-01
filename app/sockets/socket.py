from flask_socketio import SocketIO, emit
from flask import request
from app.models import User

socketio = SocketIO()

dialogs_with_sockets = {

}

sockets_with_dialog = {

}

socket_ids = []

def remove_id(id, absolute=False):
    if id in sockets_with_dialog.keys():
        dialog_id = sockets_with_dialog[id]
        if dialog_id in dialogs_with_sockets.keys():
            dialogs_with_sockets[sockets_with_dialog[id]].remove(id)
        sockets_with_dialog.pop(id, None)
    
    if absolute:
        socket_ids.remove(id)


def set_id(data):

    if data['socket_id'] in sockets_with_dialog.keys():
        if sockets_with_dialog[data['socket_id']] != data['user_id']:
            remove_id(data['socket_id'])

    sockets_with_dialog[data['socket_id']] = data['user_id']

    if data['user_id'] in dialogs_with_sockets.keys():
        if data['socket_id'] not in dialogs_with_sockets[data['user_id']]:
            dialogs_with_sockets[data['user_id']].append(data['socket_id'])
        else:
            pass
    else:
        dialogs_with_sockets[data['user_id']] = [data['socket_id']]


def send_message(message, user, is_call):
    if len(dialogs_with_sockets) > 0 and user.id in dialogs_with_sockets.keys():
        for socket in dialogs_with_sockets[user.id]:
            emit('send_message', {'message': message, 'is_call': is_call},
                                   room=socket, namespace='/')

    for socket in socket_ids:

        emit('send_notification', {'id': user.id, 'name': user.nickname}, 
                                    room=socket, namespace='/')


@socketio.on('message')
def handle_message(data):
    print('received message: ' + data)


@socketio.on('set_id')
def handle_id(data):
    set_id(data)
    print('received message: ' + str(data))


@socketio.on('json')
def handle_json(json):
    print('received json: ' + str(json))


@socketio.on('connect')
def test_connect(auth):
    socket_ids.append(request.sid)
    emit('my response', {'data': 'Connected'})


@socketio.on('disconnect')
def test_disconnect():
    remove_id(request.sid, absolute=True)
    print('Client disconnected')