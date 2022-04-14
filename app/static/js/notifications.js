import {get_notifications, get_user, del_notification} from './api_methods.js'
import {socket} from './socket_client.js'
import {set_new_dialog, set_active_dialog} from './rendermessages.js'

let notify_snd = new Audio("../static/audio/Notification.wav");

socket.on('send_notification', async function(data) {
    render_socket_notification(data);
});


const play_audio_notify = async () => {
    await new Promise(r => setTimeout(r, 1500));
    notify_snd.play()
}

const remove_notify_element = async (id, name) => {
    let notify = document.getElementById(`user_${id}`)
    if (!notify) {
        return
    }

    let unread_flag = document.getElementById(`unread_${id}`)
    let manager_id = document.getElementById('manager-id').textContent;

    await del_notification(manager_id, id, name)
    notify.remove()
    unread_flag.remove()

    let notifys_dropdown = document.getElementById('dropdown-notify')
    if (!(notifys_dropdown.children.length - 1)) {
        document.getElementById('default-notification').style = 'block';
    }
}


const check_notification = async (notify) => {

    let dialog_div = document.getElementById(`dialog_${notify.id}`).parentNode

    let user = await get_user(notify.id)

    socket.emit('set_id', {socket_id: socket.id,
                           user_id: user.id})
    set_active_dialog(dialog_div)
    set_new_dialog(user)

    remove_notify_element(notify.id, notify.name)
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
            `<a class="dropdown-item text-break" id='user_${notify.id}' value='${notify.id}'>
                Новое сообщение от ${notify.name}
            </a>`
            )

            document.getElementById(`user_${notify.id}`).onclick = () => { 
                check_notification(notify);
            }
        }
    }
}


const render_socket_notification = async (data) => {
    let manager_id = document.getElementById('manager-id').textContent;
    let default_notification = document.getElementById('default-notification');
    let notify_div = document.getElementById('dropdown-notify');
    let same_notify = document.getElementById(`user_${data.id}`)
    let dialog = document.getElementById(`dialog_${data.id}`)
    let unread_flag = document.getElementById(`unread_${data.id}`)

    if (dialog.classList.contains('active-dialog')) {
        await del_notification(manager_id, data.id, data.name)
        return
    }

    play_audio_notify()
    let user = await get_user(data.id)


    if (default_notification) {
        default_notification.style.display = "none";
    };

    if (unread_flag) {
        unread_flag.textContent = parseInt(unread_flag.textContent) + 1
    } else if (user.unread_count > 0) {
        dialog.insertAdjacentHTML(
            'beforeend',
            `
            <div class="unread_msgs rounded-circle">
                <p id="unread_${data.id}" class="text-white bg-info rounded-circle">${user.unread_count}</p>
            </div>
            `
        )
    }



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


export {remove_notify_element}