// ===================================
// Minesweeper Classic Bomb Plus
// Interactive Features & Animations
// ===================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // === Navigation Scroll Effect ===
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        // Add scrolled class when scrolling down
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // === Mobile Menu Toggle ===
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');

            // Animate hamburger icon
            if (navLinks.classList.contains('active')) {
                mobileMenuToggle.textContent = '✕';
            } else {
                mobileMenuToggle.textContent = '☰';
            }
        });

        // Close mobile menu when clicking on a link
        const menuLinks = navLinks.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function () {
                navLinks.classList.remove('active');
                mobileMenuToggle.textContent = '☰';
            });
        });
    }

    // === Smooth Scrolling for Navigation Links ===
    const scrollLinks = document.querySelectorAll('a[href^="#"]');

    scrollLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // === Intersection Observer for Fade-in Animations ===
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optionally unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // === Gallery Item Click Handler ===
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function () {
            const img = this.querySelector('img');
            const imgSrc = img.getAttribute('src');

            // Create lightbox overlay
            createLightbox(imgSrc, index);
        });
    });

    // === Lightbox Function ===
    function createLightbox(imageSrc, currentIndex) {
        // Check if lightbox already exists
        let existingLightbox = document.getElementById('lightbox');
        if (existingLightbox) {
            existingLightbox.remove();
        }

        // Create lightbox elements
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
            animation: fadeIn 0.3s ease;
        `;

        const img = document.createElement('img');
        img.src = imageSrc;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 16px;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
            animation: scaleIn 0.3s ease;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border: none;
            color: white;
            font-size: 2rem;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        closeBtn.addEventListener('mouseenter', function () {
            this.style.background = 'rgba(255, 255, 255, 0.3)';
            this.style.transform = 'rotate(90deg)';
        });

        closeBtn.addEventListener('mouseleave', function () {
            this.style.background = 'rgba(255, 255, 255, 0.2)';
            this.style.transform = 'rotate(0deg)';
        });

        // Navigation arrows
        const prevBtn = createNavButton('‹', 'left');
        const nextBtn = createNavButton('›', 'right');

        let currentImageIndex = currentIndex;

        prevBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex - 1 + 6) % 6;
            updateLightboxImage(img, currentImageIndex);
        });

        nextBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex + 1) % 6;
            updateLightboxImage(img, currentImageIndex);
        });

        // Close lightbox on click
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        closeBtn.addEventListener('click', closeLightbox);

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });

        // Append elements
        lightbox.appendChild(img);
        lightbox.appendChild(closeBtn);
        lightbox.appendChild(prevBtn);
        lightbox.appendChild(nextBtn);
        document.body.appendChild(lightbox);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    function createNavButton(text, position) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = `
            position: absolute;
            ${position}: 20px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border: none;
            color: white;
            font-size: 3rem;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 10001;
        `;

        btn.addEventListener('mouseenter', function () {
            this.style.background = 'rgba(255, 255, 255, 0.3)';
            this.style.transform = 'translateY(-50%) scale(1.1)';
        });

        btn.addEventListener('mouseleave', function () {
            this.style.background = 'rgba(255, 255, 255, 0.2)';
            this.style.transform = 'translateY(-50%) scale(1)';
        });

        return btn;
    }

    function updateLightboxImage(imgElement, index) {
        imgElement.style.animation = 'none';
        setTimeout(() => {
            imgElement.src = `./resources/images/screenshot${index + 1}.jpg`;
            imgElement.style.animation = 'scaleIn 0.3s ease';
        }, 10);
    }

    function closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                lightbox.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }

    // === Contact Form Submission ===
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                message: document.getElementById('message').value.trim(),
                website: 'Minesweeper Classic Bomb Plus',
                url: window.location.href
            };

            // Validation
            if (!formData.name || !formData.email || !formData.message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }

            if (!isValidEmail(formData.email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }

            // Text length validation and truncation
            const MAX_NAME_LENGTH = 50;
            const MAX_EMAIL_LENGTH = 100;
            const MAX_PHONE_LENGTH = 20;
            const MAX_MESSAGE_LENGTH = 1500;

            formData.name = formData.name.length > MAX_NAME_LENGTH ? formData.name.substring(0, MAX_NAME_LENGTH) + '...' : formData.name;
            formData.email = formData.email.length > MAX_EMAIL_LENGTH ? formData.email.substring(0, MAX_EMAIL_LENGTH) + '...' : formData.email;
            formData.phone = formData.phone && formData.phone.length > MAX_PHONE_LENGTH ? formData.phone.substring(0, MAX_PHONE_LENGTH) + '...' : formData.phone;
            formData.message = formData.message.length > MAX_MESSAGE_LENGTH ? formData.message.substring(0, MAX_MESSAGE_LENGTH) + '...' : formData.message;

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Send email
            fetch('https://websites_server.by4bit.workers.dev/api/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': 'K9mX!7pQ@2nL#5'
                },
                body: JSON.stringify(formData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showNotification('Your message has been sent successfully!', 'success');
                        contactForm.reset();
                    } else {
                        showNotification(data.message || 'Failed to send message.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('An error occurred while sending your message. Please try again later.', 'error');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1rem;
            font-weight: 500;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;

        const icon = document.createElement('div');
        icon.textContent = type === 'success' ? '✓' : '✕';
        icon.style.cssText = `
            width: 24px;
            height: 24px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
        `;

        const text = document.createElement('span');
        text.textContent = message;

        notification.appendChild(icon);
        notification.appendChild(text);
        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // Add CSS animations for notifications
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
    `;
    document.head.appendChild(notificationStyle);

    // === Add CSS Animations ===
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes scaleIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);

    // === Parallax Effect (Subtle) ===
    window.addEventListener('scroll', function () {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');

        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });

    // === Console Easter Egg ===
    console.log('%c💣 Minesweeper Classic Bomb Plus 💣', 'color: #dc2f2c; font-size: 20px; font-weight: bold;');
    console.log('%cReady to sweep some mines? 🎮', 'color: #743d29; font-size: 14px;');

});
