document.addEventListener('DOMContentLoaded', function() {
    // Cookie banner script
    var acceptBtn = document.getElementById("acceptCookies");
    var cookieBanner = document.getElementById("cookieBanner");

    if (!localStorage.getItem("cookiesAccepted")) {
        cookieBanner.style.display = "block";
    }

    acceptBtn.onclick = function() {
        localStorage.setItem("cookiesAccepted", "true");
        cookieBanner.style.display = "none";
    };

    // Scroll and header adjustment
    const mainHeader = document.getElementById('banner');
    const logo = document.getElementById('logo');

    function handleScroll() {
        if (window.scrollY > 50) {
            mainHeader.classList.add('small-header');
            logo.classList.add('shrink');
        } else {
            mainHeader.classList.remove('small-header');
            logo.classList.remove('shrink');
        }
    }

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('touchstart', handleScroll);
    document.addEventListener('touchend', handleScroll);

    // Enlarge images on click
    const images = document.querySelectorAll('.image-container img');

    images.forEach(image => {
        const originalParent = image.parentElement;

        image.parentElement.onclick = function(event) {
            event.preventDefault(); // Prevent the default action of opening the image in a new tab

            if (image.classList.contains('enlarged-fullscreen')) {
                image.classList.remove('enlarged-fullscreen');
                const container = document.querySelector('.enlarged-fullscreen-container');
                if (container) {
                    originalParent.appendChild(image); // Return image to its original parent
                    container.remove();
                }
                document.body.style.overflow = ''; // Restore scrolling
            } else {
                const container = document.createElement('div');
                container.classList.add('enlarged-fullscreen-container');
                container.appendChild(image);
                container.onclick = function() {
                    image.classList.remove('enlarged-fullscreen');
                    originalParent.appendChild(image); // Return image to its original parent
                    container.remove();
                    document.body.style.overflow = ''; // Restore scrolling
                };
                document.body.appendChild(container);
                image.classList.add('enlarged-fullscreen');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            }
        }
    });

    // Add scroll effect for slight enlargement
    window.addEventListener('scroll', function() {
        images.forEach(image => {
            if (!image.classList.contains('enlarged-fullscreen')) {
                const rect = image.getBoundingClientRect();
                if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                    image.classList.add('enlarged');
                } else {
                    image.classList.remove('enlarged');
                }
            }
        });
    });

    // Discover button functionality
    const sections = document.querySelectorAll('.section');
    const introText = document.querySelector('.intro-text');
    const discoverBtn = document.getElementById('discoverBtn');
    const hiddenSections = document.getElementById('hiddenSections');

    discoverBtn.addEventListener('click', function() {
        introText.classList.add('hidden');
        hiddenSections.classList.remove('hidden');

        // Observe sections for visibility changes after revealing hiddenSections
        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    });

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Initially hide sections except the introduction
    sections.forEach(section => {
        if (!section.classList.contains('visible')) {
            section.classList.remove('visible');
        }
    });
});
