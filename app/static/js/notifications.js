import {get_notifications, get_user, del_notification} from './api_methods.js'
import {socket} from './socket_client.js'
import {set_new_dialog, set_active_dialog} from './rendermessages.js'

let notify_snd = new Audio("../static/audio/Notification.wav");

socket.on('send_notification', function(data) {
    render_socket_notification(data);
    play_audio_notify();
});


const play_audio_notify = () => {
    console.log('AA')
    notify_snd.play()
}

const remove_notify_element = (id) => {
    let notify = document.getElementById(`user_${id}`)
    
    notify.remove()

    let notifys_dropdown = document.getElementById('dropdown-notify')

    if (!(notifys_dropdown.children.length - 1)) {
        document.getElementById('default-notification').style = 'block';
    }
}


const check_notification = async (notify) => {
    let manager_id = document.getElementById('manager-id').textContent;
    let dialog_div = document.getElementById(`dialog_${notify.id}`).parentNode

    let user = await get_user(notify.id)

    socket.emit('set_id', {socket_id: socket.id,
                           user_id: user.id})
    set_active_dialog(dialog_div)
    set_new_dialog(user)

    await del_notification(manager_id, notify.id, notify.name)

    remove_notify_element(notify.id)
}

const render_server_notifications = async () => {
    let manager_id = document.getElementById('manager-id').textContent;
    let notifications = await get_notifications(manager_id);
    let default_notification = document.getElementById('default-notification');
    let notify_div = document.getElementById('dropdown-notify');

    if (notifications.notifications.length) {
        default_notification.style.display = 'none';
    } 


    for (const notify of notifications.notifications) {
        let same_notify = document.getElementById(`user_${notify.id}`)
        if (!same_notify) {
            notify_div.insertAdjacentHTML(
            "afterbegin",
            `<a class="dropdown-item text-break" id='user_${notify.id}' value='${notify.id}'}>
                Новое сообщение от ${notify.name}
            </a>`
            )

            document.getElementById(`user_${notify.id}`).onclick = () => { 
                check_notification(notify);
            }
        }
    }
}


const render_socket_notification = (data) => {
    console.log(data);
    let default_notification = document.getElementById('default-notification');
    let notify_div = document.getElementById('dropdown-notify');
    let same_notify = document.getElementById(`user_${data.id}`)

    if (default_notification) {
        default_notification.style.display = "none";
    };

    if (!same_notify) {
        notify_div.insertAdjacentHTML(
        "afterbegin",
        `<a class="dropdown-item text-break" id='user_${data.id}' value='${data.id}'}>Новое сообщение от ${data.name}</a>`
        )
        document.getElementById(`user_${data.id}`).onclick = () => {
            check_notification(data);
        }
    }

}


const notifications_open = () => {
    let notifications = document.getElementById('dropdown-notify');
    return notifications.style.display == 'block';
}


document.getElementById('notification-btn').onclick = () => {
    let notifications = document.getElementById('dropdown-notify');

    if (notifications_open()) {
        notifications.style.display = 'none';
    } else {
        notifications.style.display = 'block';
        render_server_notifications();
    }
}


document.onclick = function(element) {
    let menu = document.getElementById('dropdown-profile');
    let notifications = document.getElementById('dropdown-notify');

    if (is_open('dropdown-profile') && !(element.target.id == 'navbarDropdownMenuLink' | element.target.id == 'navbarDropdownMenuImg')) {
        menu.style.display = 'none'
    }
    if (notifications_open() && !(element.target.id == 'notification-btn' | element.target.id == 'bell-icon')) {
        notifications.style.display = 'none'
    }
}
