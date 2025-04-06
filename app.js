document.addEventListener('DOMContentLoaded', function() {
    const getButton = document.querySelector('.get');
    const registerButton = document.querySelector('.register-btn'); // Changed from #register to .register
    const blurContainer = document.querySelector('.blur');
    const blurContainer2 = document.querySelector('.blur2');
    const closeButton = document.querySelector('.close');
    const closeButton2 = document.querySelector('#close');
    const loginA = document.querySelector('#login');

    // Show blur container when Get Messages button is clicked
    getButton.addEventListener('click', function() {
        blurContainer.style.display = 'block'; 
    });

    loginA.addEventListener('click', function() {
        blurContainer2.style.display = 'block'; 
    });

    // Show blur container when Register button is clicked
    registerButton.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default link behavior
        blurContainer.style.display = 'block'; // Show the blur container
    });

    // Hide blur container when close button is clicked
    closeButton.addEventListener('click', function() {
        blurContainer.style.display = 'none';
        
    });

    closeButton2.addEventListener('click', function() {
        blurContainer2.style.display = 'none';
        
    });

    const toRegisterLink = document.querySelector('.to-register');
  toRegisterLink.addEventListener('click', function(e) {
    e.preventDefault();
    // hide login popup
    blurContainer2.style.display = 'none';
    // show registration popup
    blurContainer.style.display = 'block';
  });

  document.querySelector('.menu').addEventListener('click', function() {
    const navs = document.querySelector('.navs');
    navs.classList.toggle('active');
    const icon = this.querySelector('i');
    icon.classList.toggle('bx-menu');
    icon.classList.toggle('bx-x');
});

// Close menu when clicking any nav link
document.querySelectorAll('.navs a').forEach(link => {
    link.addEventListener('click', () => {
        const navs = document.querySelector('.navs');
        const menuIcon = document.querySelector('.menu i');
        
        // Close menu
        navs.classList.remove('active');
        
        // Reset menu icon
        menuIcon.classList.add('bx-menu');
        menuIcon.classList.remove('bx-x');
    });
});
});


