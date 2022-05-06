const base_request = (path, method, data) => {
    const request = new Request(`http://178.62.217.248:80/api/${path}/?` + new URLSearchParams(data),
    {method: method});

    return fetch(request)
    .then(response => {
        if (response.status === 200) {
        return response.json();
        } else {
        throw new Error('Something went wrong on api server!');
        }
    })
    .then(response => {
        return response
    }).catch(error => {
        console.error(error);
    });
};

const get_messages = (id, last_msg_id) => {
    return base_request('message', 'GET', {msg_id: last_msg_id, id: id})
};

const get_dialogs = (last_dialog_id, last_unread_count) => {
    return base_request('dialog', 'GET', {id: last_dialog_id,
                                          unread: last_unread_count})
}

const send_message = (id, text, nickname) => {
    return base_request('message/manager', 'POST', {telegram_id: id,
                                                    message_text: text,
                                                    nickname: nickname})
};

const get_notifications = (id) => {
    return base_request('manager/notifications', 'GET', {id: id})
};

const del_notification = (manager_id, user_id, nickname) => {
    return base_request('manager/notifications', 'DELETE', 
                        {manager_id: manager_id, user_id: user_id,
                        nickname: nickname})
};

const ban_user = (user_id) => {
    return base_request('user', 'UPDATE', {user_id: user_id})
};

const get_user = (id) => {
    return base_request('user', 'GET', {id: id, type: 'id'})
};

export {get_messages, get_user, send_message, get_notifications, 
        del_notification, ban_user, get_dialogs};
