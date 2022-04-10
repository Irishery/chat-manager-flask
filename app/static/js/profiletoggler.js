const menu_open = () => {
    let menu = document.getElementById('dropdown-profile');
    return menu.style.display == 'block';
}

document.getElementById('navbarDropdownMenuLink').onclick = function openMenu() {
    let menu = document.getElementById('dropdown-profile');
    menu.style.display = menu_open() ? 'none' : 'block';
}
