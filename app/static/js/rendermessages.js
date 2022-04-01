import {get_messages, get_user, send_message} from './api_methods.js'
import {socket} from './socket_client.js'

let last_msg_id = 0;

socket.on('send_message', function(Message) {
  render_new_message(Message.message, 'user')
});

const set_active_dialog = (target) => {
  let active = document.getElementsByClassName('active-dialog');
  if (active.length !== 0) {
    active[0].classList.remove('active-dialog')
  };
  target.classList.add('active-dialog')
}


const find_dialog_parent = (target) => {
  if (target.parentNode.classList.contains('about')) {
    let parent = target.parentNode.parentNode
    return parent.id == 'dialog' ? parent : false
  }
  let parent = target.parentNode
  return parent.id == 'dialog' ? parent : false
};


const set_msg_onclick = async (user) => {
  document.getElementById('send-msg').onclick = async () => {
    let input = document.getElementById('chat-input');
    if (input.value) {
      let sent = await send_message(user.telegram_id, input.value, user.nickname)
      // todo: check is status ok and show alert if its not
      render_new_message(input.value, 'manager')
    }
  }
}


const render_new_message = (text, role) => {
  let chat = document.getElementById('chat-history')

  chat.insertAdjacentHTML(
    'beforeend',
    `    <li class="clearfix">
    <div class="message-data ${(role == 'manager') ? 'text-right text-right d-flex flex-row-reverse' : ''}">
      <span class="message-data-time">${new Date().toLocaleString().replace(",","").replace(/:.. /," ")}</span>
    </div>
      <div class="message ${(role == 'user') ? 'my-message' : 'other-message float-right'}">${text}</div>
    </li>`
  )
}

const render_user_messages = async (user) => {
  let messages = await get_messages(user.id, last_msg_id);
  
  if (messages) {
    last_msg_id = messages[messages.length - 1].id;
  };

  let chat_history = document.getElementById('chat-history')
  
  for (const message of messages) {
    chat_history.insertAdjacentHTML(
      'afterbegin',
      `
    <li class="clearfix">
    <div class="message-data ${(message.role == 'manager') ? 'text-right text-right d-flex flex-row-reverse' : ''}">
      <span class="message-data-time">${message.sent_datetime}</span>
    </div>
      <div class="message ${(message.role == 'user') ? 'my-message' : 'other-message float-right'}">${message.message_text}</div>
    </li>
      `
    )

  }
}


const clear_dialog = () => {
  let header = document.getElementById('chat-header');
  let chat_history = document.getElementById('chat-history');
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
             <img src="https://bootdey.com/img/Content/avatar/avatar2.png" alt="avatar">
         </a>
         <div class="chat-about">
             <h6 class="m-b-0">${user.nickname}</h6>
         </div>
     </div>
 </div>
</div>
<div class="chat-history">
<ul class="m-b-0" id="chat-history">
</ul>
</div>
<div class="chat-message clearfix" id="chat-input-div">
<div class="input-group mb-0">
    <div class="input-group-prepend">
        <button class="btn btn-outline-secondary" type="button" id="send-msg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
          <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
          </svg></button>
    </div>
    <input type="text" id="chat-input" class="form-control" placeholder="Enter text here...">                                    
</div>
</div>
`)
  set_msg_onclick(user);
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
