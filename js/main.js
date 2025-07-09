 document.querySelector('.menu-btn').addEventListener('click', function () {
  var menuIcon = this.querySelector('i');
  var mainMenu = document.querySelector('.main-menu');

  mainMenu.classList.toggle('show');

  // Toggle between menu and close icons
  if (mainMenu.classList.contains('show')) {
    menuIcon.classList.replace('fa-bars', 'fa-times');
  } else {
    menuIcon.classList.replace('fa-times', 'fa-bars');
  }
});
