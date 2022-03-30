import {get_messages, get_user} from './api_methods.js'

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

const clear_dialog = () => {
  let header = document.getElementById('chat-header');
  header.remove();
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
</div>`
)}


document.addEventListener('click', async (event) => {
    let target = event.target
  
    if (target.id !== 'dialog') {
      let clst = target.classList
      if (clst.contains('name') || clst.contains('about') || target.alt == 'avatar') {
        target = find_dialog_parent(event.target)
        if (!target) { return }
      } else { return }
    }

    let messages = await get_messages(target.value, 0)
    let user = await get_user(target.value)
    console.log(messages)
    console.log(user)
    set_active_dialog(target)
    set_new_dialog(user)
});