import {get_dialogs} from './api_methods.js'


let last_dialogs = [];
let last_unread = 0;

let chat = document.getElementById('plist-group')

chat.onscroll = function() {
    if (chat.scrollTop + chat.offsetHeight == chat.scrollHeight) {
        render_dialogs()
    }
}


const render_dialogs = async () => {
    let dialogs = await get_dialogs(last_dialogs, last_unread);

    let dialog_list = document.getElementById('user-list')  
    
    for (const dialog of dialogs) {
      last_dialogs.push(dialog.id)
      if (dialog.unread_count) {
        last_unread = dialog.unread_count;
      }
      dialog_list.insertAdjacentHTML(
        'beforeend',
        `
        <li class="d-flex justify-content-between" id="dialog_${dialog.id}" value="${dialog.id}">
          <div class="avatar_and_nickname">
            <img src="../${dialog.avatar_path}" alt="avatar">
            <div class="about">
                <div class="name">${dialog.nickname}</div>
            </div>
          </div>
          ${dialog.unread_count
             ? `<div class="unread_msgs rounded-circle">
              <p  id="unread_${dialog.id}" class="text-white bg-info rounded-circle">${dialog.unread_count}</p>
            </div>` : ``
          }
        </li>
        `
      )
    }
      
}

export {render_dialogs};
