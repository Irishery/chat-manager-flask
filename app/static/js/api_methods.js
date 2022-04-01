const base_request = (path, method, data) => {
    const request = new Request(`http://127.0.0.1:5000/api/${path}/?` + new URLSearchParams(data),
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

const send_message = (id, text, nickname) => {
    return base_request('message/manager', 'POST', {telegram_id: id,
                                                    message_text: text,
                                                    nickname: nickname})
}

const get_user = (id) => {
    return base_request('user', 'GET', {id: id, type: 'id'})
};

export {get_messages, get_user, send_message};
