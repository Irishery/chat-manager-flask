const is_open = (id) => {
    let element = document.getElementById(id);
    return (element.style.display == 'block') | element.style.display == 'flex';
}

document.getElementById('navbarDropdownMenuLink').onclick = function openMenu() {
    let menu = document.getElementById('dropdown-profile');
    menu.style.display = is_open('dropdown-profile') ? 'none' : 'block';
}
