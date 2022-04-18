import {ban_user, get_messages, get_user, send_message} from './api_methods.js'
import {socket} from './socket_client.js'
import {remove_notify_element} from './notifications.js'

let last_msg_id = 0;
let typing = false

socket.on('send_message', function(Message) {
  render_new_message(Message.message, 'user')
});

// return a promise
function copyToClipboard(textToCopy) {
  // navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
      // navigator clipboard api method'
      return navigator.clipboard.writeText(textToCopy);
  } else {
      // text area method
      let textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      // make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise((res, rej) => {
          // here the magic happens
          document.execCommand('copy') ? res() : rej();
          textArea.remove();
      });
  }
}

const set_active_dialog = (target) => {
  let active = document.getElementsByClassName('active-dialog');
  if (active.length !== 0) {
    active[0].classList.remove('active-dialog');
  };
  target.classList.add('active-dialog');
}


const find_dialog_parent = (target) => {
  if (target.parentNode.classList.contains('avatar_and_nickname')) {
    let parent = target.parentNode.parentNode
    return parent.id.slice(0, 6) == 'dialog' ? parent : false
  }
  if (target.parentNode.classList.contains('about')) {
    let parent = target.parentNode.parentNode
    return parent.classList.contains('avatar_and_nickname') ? parent.parentNode : false
  }
  let parent = target.parentNode.parentNode
  return parent.id.slice(0, 6) == 'dialog' ? parent : false
};


const block_send_on_typing = (input) => {
  let typingTimer;
  let doneTypingInterval = 2000;
  let send_button = document.getElementById('send-msg')

  //on keyup, start the countdown
  input.addEventListener('keyup', () => {
    typing = true
    send_button.disabled = true
    clearTimeout(typingTimer);
    if (input.value) {
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }
  });

  //user is "finished typing," do something
  function doneTyping () {
    send_button.disabled = false
    typing = false
  }
}


const set_chat_onclicks = async (user) => {
  block_send_on_typing(document.getElementById('chat-input'))
  
  document.getElementById('send-msg').onclick = async () => {
    let input = document.getElementById('chat-input');
    let text = input.value
    if (input.value && !typing) {
      input.value = ''
      let sent = await send_message(user.telegram_id, text, user.nickname);
      render_new_message(text, 'manager');
    }
  }

  document.addEventListener('keydown', async (event) => {
    var name = event.key;
    if (name === 'Enter') {
      let input = document.getElementById('chat-input');
      let text = input.value
      if (input.value && !typing) {
        input.value = ''
        let sent = await send_message(user.telegram_id, text, user.nickname);
        // todo: check is status ok and show alert if its not
        render_new_message(text, 'manager');
      }
    }
  }, false);

  let extra_rows = document.getElementsByClassName("extra-t");
  for (const row of extra_rows) {
    row.onclick = () => {
      copyToClipboard(row.textContent)
        .then(() => console.log('text copied !'))
        .catch(() => console.log('error'));
      
      let alert = document.getElementById("CopyAlert");
      alert.style.display = 'block'
      // $("#CopyAlert").alert()
      $("#CopyAlert").fadeTo(1000, 500).slideUp(500, function(){
        alert.style.display = 'none'
    });
    }
  }

  document.getElementById('ban_user').onclick = async () => {
    await ban_user(user.id)
    location.reload();
  }
}


const set_msg_loader = async (user) => {
  let chat = document.getElementById('chat-history-div')
  chat.onscroll = function() {
    if (chat.scrollTop == 0) {
      render_user_messages(user);
    }
    if (chat.scrollTop + chat.offsetHeight > chat.scrollHeight) {
      remove_notify_element(user.id, user.nickname)
    }
  }
}


const render_new_message = (text, role) => {
  let chat = document.getElementById('chat-history');

  chat.insertAdjacentHTML(
    'beforeend',
    `  
    <li class="clearfix">
    <div class="message-data ${(role == 'manager') ? 'text-right text-right d-flex flex-row-reverse' : ''}">
      <span class="message-data-time">${new Date().toLocaleString().replace(",","").replace(/:.. /," ")}</span>
    </div>
      <div class="message ${(role == 'user') ? 'my-message' : 'other-message float-right'}">${text}</div>
    </li>`
  );
}

const render_user_messages = async (user) => {
  let messages = await get_messages(user.id, last_msg_id);
  let chat_history = document.getElementById('chat-history')  

  if (messages.length == 0) {
    let dialog_begin = document.getElementById('dialog-begin-flag');
    if (dialog_begin) {
      return
    }
    chat_history.insertAdjacentHTML(
      'afterbegin',
      `
      <p class="text-center" id="dialog-begin-flag">Начало дилога</p>
      `
    )
    return
  }
  if (messages) {
    last_msg_id = messages[messages.length - 1].id;
  };

  
  for (const message of messages) {
    let date = new Date(message.sent_datetime)
    chat_history.insertAdjacentHTML(
      'afterbegin',
      `
    <li class="clearfix">
    <div class="message-data ${(message.role == 'manager') ? 'text-right text-right d-flex flex-row-reverse' : ''}">
      <span class="message-data-time">${date.toLocaleString().replace(",","").replace(/:.. /," ")}</span>
    </div>
      <div class="message ${(message.role == 'user') ? 'my-message' : 'other-message float-right'}">${message.message_text}</div>
    </li>
      `
    )

  }
}


const clear_dialog = () => {
  let header = document.getElementById('chat-header');
  let chat_history = document.getElementById('chat-history-div');
  let chat_input = document.getElementById('chat-input-div');
  last_msg_id = 0;  
  header.remove();
  chat_history.remove();
  chat_input.remove();

}

const set_new_dialog = (user) => {
  let chat = document.getElementById('chat-win')
  if (chat.children.length > 0) { 
    clear_dialog();
  }
  
  chat.insertAdjacentHTML(
  "afterbegin",
`<div class="chat-header clearfix" id="chat-header">
 <div class="row header-div">
     <div class="col-lg-6" id="header-avatar">
         <a href="javascript:void(0);" data-toggle="modal" data-target="#view_info">
             <img src="../${user.avatar_path}" alt="avatar">
         </a>
         <div class="chat-about">
          <p class="text-start">${user.nickname}</p>
         </div>
         <div class="extra-info-t">
          <p class="text-start text-secondary extra-t">@${user.username}</p>
          <div id="CopyAlert" class="alert alert-success" role="alert">
          Copied!
        </div>
        </div>
     </div>
     <div class="header-ban-extra">
     <div>
      <button type="button" data-bs-toggle="modal" data-bs-target="#myModal" value="${user.id}" class="btn btn-danger">Забанить</button>
     </div>
     <div class="modal" tabindex="-1" id="myModal">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Вы уверены, что хотите забанить пользователя?</h5>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-success" data-bs-dismiss="modal">Нет</button>
        <button type="button" class="btn btn-danger" data-bs-dismiss="modal"  id="ban_user">Да</button>
      </div>
    </div>
  </div>
</div>

    </div>

      </div>
     </div>
 </div>
</div>
<div class="chat-history d-flex flex-column" id="chat-history-div">
<ul class="m-b-0" id="chat-history">
</ul>
</div>
<div class="chat-message clearfix" id="chat-input-div">
<div class="input-group mb-0">
    <textarea type="text" id="chat-input" class="form-control" placeholder="Enter text here..."></textarea>                                
    <div class="input-group-prepend">
      <button class="btn btn-outline-secondary" type="button" id="send-msg">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
        </svg></button>
    </div>
    </div>
</div>
`)
  set_chat_onclicks(user);
  set_msg_loader(user);
  render_user_messages(user);
}


document.addEventListener('click', async (event) => {
    let target = event.target
  
    if (target.id.slice(0, 6) !== 'dialog') {
      let clst = target.classList
      if (clst.contains('name') || clst.contains('about') || target.alt == 'avatar' || target.id.slice(0, 6) == 'unread') {
        target = find_dialog_parent(event.target)
        if (!target) { return }
      } else { return }
    }

    let user = await get_user(target.value)
    socket.emit('set_id', {socket_id: socket.id,
                           user_id: user.id})
    set_active_dialog(target)
    set_new_dialog(user)
});


document.onreadystatechange = async () => {
  if (document.readyState == "complete") {
      let user_to_preload = document.getElementById('user_to_preload');
      if (user_to_preload) {
        let user = await get_user(user_to_preload.textContent);
        let dialog_div = document.getElementById(`dialog_${user_to_preload.textContent}`);

        set_active_dialog(dialog_div);
        set_new_dialog(user)
      }
  }
}

export {set_active_dialog, set_new_dialog};
