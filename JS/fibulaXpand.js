// Burger Menu Toggle
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
    burger.classList.toggle('toggle');
});

// Close menu when clicking on a link (for mobile devices)
const navItems = document.querySelectorAll('.nav-links a');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (navLinks.classList.contains('nav-active')) {
            navLinks.classList.remove('nav-active');
            burger.classList.remove('toggle');
        }
    });
});

// Cookie Banner
document.addEventListener('DOMContentLoaded', function() {
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookies = document.getElementById('acceptCookies');

    // Show cookie banner every time the page loads
    cookieBanner.style.display = 'block';

    acceptCookies.addEventListener('click', () => {
        cookieBanner.style.display = 'none';
    });
});

// Smooth Scroll
const links = document.querySelectorAll('a[href^="#"]');

for (const link of links) {
    link.addEventListener('click', smoothScroll);
}

function smoothScroll(e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    document.querySelector(href).scrollIntoView({
        behavior: 'smooth'
    });
}

// Image Gallery Modal
const galleryImages = document.querySelectorAll('.image-gallery img');

galleryImages.forEach(image => {
    image.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <span class="close">&times;</span>
            <img src="${image.src}" alt="${image.alt}">
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const closeModal = modal.querySelector('.close');
        closeModal.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.body.style.overflow = 'auto';
            }
        });
    });
});

// Logo Resize on Scroll for Main Logo Image
window.addEventListener('scroll', function() {
    const mainLogo = document.querySelector('.main-logo');
    if (window.scrollY > 50) {
        mainLogo.classList.add('scrolled');
    } else {
        mainLogo.classList.remove('scrolled');
    }
});
