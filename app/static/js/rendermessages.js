import {get_messages, get_user, send_message} from './api_methods.js'
import {socket} from './socket_client.js'

let last_msg_id = 0;
let typing = false

socket.on('send_message', function(Message) {
  render_new_message(Message.message, 'user')
});

const set_active_dialog = (target) => {
  let active = document.getElementsByClassName('active-dialog');
  if (active.length !== 0) {
    active[0].classList.remove('active-dialog');
  };
  target.classList.add('active-dialog');
}


const find_dialog_parent = (target) => {
  if (target.parentNode.classList.contains('about')) {
    let parent = target.parentNode.parentNode
    return parent.id == 'dialog' ? parent : false
  }
  let parent = target.parentNode
  return parent.id == 'dialog' ? parent : false
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


const set_msg_onclick = async (user) => {
  block_send_on_typing(document.getElementById('chat-input'))
  
  document.getElementById('send-msg').onclick = async () => {
    let input = document.getElementById('chat-input');
    let text = input.value
    if (input.value && !typing) {
      input.value = ''
      let sent = await send_message(user.telegram_id, text, user.nickname);
      // todo: check is status ok and show alert if its not
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
}


const set_msg_loader = async (user) => {
  let chat = document.getElementById('chat-history-div')
  chat.onscroll = function() {
    if (chat.scrollTop == 0) {
      render_user_messages(user);
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
 <div class="row">
     <div class="col-lg-6">
         <a href="javascript:void(0);" data-toggle="modal" data-target="#view_info">
             <img src="../${user.avatar_path}" alt="avatar">
         </a>
         <div class="chat-about">
             <h6 class="m-b-0">${user.nickname}</h6>
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
    <input type="text" id="chat-input" class="form-control" placeholder="Enter text here...">                                    
    <div class="input-group-prepend">
      <button class="btn btn-outline-secondary" type="button" id="send-msg">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
        </svg></button>
    </div>
    </div>
</div>
`)
  set_msg_onclick(user);
  set_msg_loader(user);
  render_user_messages(user);
}


document.addEventListener('click', async (event) => {
    let target = event.target
  
    if (target.id !== 'dialog') {
      let clst = target.classList
      if (clst.contains('name') || clst.contains('about') || target.alt == 'avatar') {
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


export {set_active_dialog, set_new_dialog};
