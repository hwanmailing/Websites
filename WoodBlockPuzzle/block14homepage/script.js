$(document).ready(function() {
    // Image Slider functionality
    let currentSlide = 0;
    const sliderContainer = $('#sliderContainer');
    const dots = $('.dot');
    
    // 동적으로 슬라이드 개수 감지
    const totalSlides = sliderContainer.find('.min-w-full').length;
    
    // Initialize slider
    function initSlider() {
        // 모든 인디케이터에서 active 클래스 제거
        dots.removeClass('active');
        // 첫 번째 인디케이터에 active 클래스 추가
        dots.eq(0).addClass('active');
        
        updateSlider();
        startAutoSlide();
    }
    
    // Update slider position
    function updateSlider() {
        const translateX = -currentSlide * 100;
        
        // 부드러운 애니메이션을 위해 transition 클래스 추가
        sliderContainer.addClass('transitioning');
        
        // 슬라이드 위치 업데이트
        sliderContainer.css('transform', `translateX(${translateX}%)`);
        
        // Update dots
        dots.removeClass('active');
        dots.eq(currentSlide).addClass('active');
        
        // 애니메이션 완료 후 transitioning 클래스 제거
        setTimeout(() => {
            sliderContainer.removeClass('transitioning');
        }, 500); // CSS transition duration과 동일하게 설정
    }
    
    // Next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
    }
    
    // Previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlider();
    }
    
    // Auto slide
    let autoSlideInterval;
    let userInteractionTimeout;
    
    function startAutoSlide() {
        stopAutoSlide(); // 기존 타이머 정리
        autoSlideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }
    
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }
    
    // 사용자 상호작용 후 자동 슬라이드 재시작 (3초 후)
    function restartAutoSlideAfterDelay() {
        if (userInteractionTimeout) {
            clearTimeout(userInteractionTimeout);
        }
        userInteractionTimeout = setTimeout(startAutoSlide, 3000);
    }
    
    // Event listeners for navigation buttons
    $('#nextBtn').click(function() {
        stopAutoSlide();
        nextSlide();
        restartAutoSlideAfterDelay();
    });
    
    $('#prevBtn').click(function() {
        stopAutoSlide();
        prevSlide();
        restartAutoSlideAfterDelay();
    });
    
    // Dot navigation
    dots.click(function() {
        const index = $(this).data('index');
        if (index !== currentSlide) {
            stopAutoSlide();
            currentSlide = index;
            updateSlider();
            restartAutoSlideAfterDelay();
        }
    });
    
    // Pause auto-slide on hover
    $('#imageSlider').hover(
        function() { stopAutoSlide(); },
        function() { restartAutoSlideAfterDelay(); }
    );
    
    // Smooth scrolling for navigation links
    $('a[href^="#"]').click(function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80 // Account for fixed navbar
            }, 800, 'easeInOutQuart');
        }
    });
    
    // Add easeInOutQuart easing function
    $.easing.easeInOutQuart = function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 * ((t-=2)*t*t*t - 2) + b;
    };
    
    // Form submission handling
    $('#contactForm').submit(function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: $('#name').val().trim(),
            email: $('#email').val().trim(),
            phone: $('#phone').val().trim(),
            message: $('#message').val().trim()
        };
        
            // Validation
    if (!formData.name || !formData.email || !formData.message) {
        showNotification('필수 항목을 모두 입력해주세요.', 'error');
        return;
    }
    
    if (!isValidEmail(formData.email)) {
        showNotification('유효한 이메일 주소를 입력해주세요.', 'error');
        return;
    }
    
    // Text length validation and truncation
    const MAX_NAME_LENGTH = 50;
    const MAX_EMAIL_LENGTH = 100;
    const MAX_PHONE_LENGTH = 20;
    const MAX_MESSAGE_LENGTH = 1500;
    
    // Truncate fields if they exceed limits
    formData.name = formData.name.length > MAX_NAME_LENGTH ? formData.name.substring(0, MAX_NAME_LENGTH) + '...' : formData.name;
    formData.email = formData.email.length > MAX_EMAIL_LENGTH ? formData.email.substring(0, MAX_EMAIL_LENGTH) + '...' : formData.email;
    formData.phone = formData.phone && formData.phone.length > MAX_PHONE_LENGTH ? formData.phone.substring(0, MAX_PHONE_LENGTH) + '...' : formData.phone;
    formData.message = formData.message.length > MAX_MESSAGE_LENGTH ? formData.message.substring(0, MAX_MESSAGE_LENGTH) + '...' : formData.message;
        
        // Show loading state
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.text();
        submitBtn.text('전송 중...').prop('disabled', true);
        
        // Send email
        fetch('/api/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('문의가 성공적으로 전송되었습니다!', 'success');
                this.reset();
            } else {
                showNotification(data.message || '문의 전송에 실패했습니다.', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('문의 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
        })
        .finally(() => {
            submitBtn.text(originalText).prop('disabled', false);
        });
    });
    
    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        const notification = $(`
            <div class="fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full">
                <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center">
                        ${type === 'success' ? 
                            '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>' :
                            '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
                        }
                    </div>
                    <span class="text-white font-medium">${message}</span>
                </div>
            </div>
        `);
        
        // Set background color based on type
        if (type === 'success') {
            notification.find('.w-6').addClass('bg-green-500');
            notification.addClass('bg-green-600');
        } else {
            notification.find('.w-6').addClass('bg-red-500');
            notification.addClass('bg-red-600');
        }
        
        // Add to page
        $('body').append(notification);
        
        // Animate in
        setTimeout(() => {
            notification.removeClass('translate-x-full');
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.addClass('translate-x-full');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    // Navbar scroll effect
    $(window).scroll(function() {
        const scrollTop = $(this).scrollTop();
        const navbar = $('nav');
        
        if (scrollTop > 100) {
            navbar.addClass('bg-gray-900/95');
        } else {
            navbar.removeClass('bg-gray-900/95');
        }
    });
    
    // Add loading animation to images
    $('img').each(function() {
        const img = $(this);
        img.addClass('image-loading');
        
        img.on('load', function() {
            img.removeClass('image-loading');
        });
        
        img.on('error', function() {
            img.removeClass('image-loading');
            img.attr('src', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZpbG1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOWNBQTNBIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2Ugbm90IGZvdW5kPC90ZXh0Pgo8L3N2Zz4K');
        });
    });
    
    // Add hover effects to cards
    $('.hover-card').addClass('hover-card');
    
    // Initialize everything
    initSlider();
    
    // Add gradient text animation to main title
    $('h1').addClass('gradient-text');
    
    // Add button hover effects
    $('button, a[href="#"]').addClass('btn-hover-effect');
    
    // Mobile menu toggle (if needed in the future)
    $('.mobile-menu-toggle').click(function() {
        $('.navbar-nav').toggleClass('hidden');
    });
    

    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    $('section').each(function() {
        const section = $(this);
        section.css({
            'opacity': '0',
            'transform': 'translateY(30px)',
            'transition': 'opacity 0.3s ease, transform 0.3s ease'
        });
        observer.observe(section[0]);
    });
    
    // Video player enhancements
    const video = $('#heroVideo')[0];
    if (video) {
        // Add loading class initially
        $(video).addClass('video-loading');
        
        // Video event listeners
        video.addEventListener('loadstart', function() {
            $(this).addClass('video-loading');
        });
        
        video.addEventListener('loadedmetadata', function() {
            $(this).removeClass('video-loading');
            $('.video-container').removeClass('video-loading');
            // Hide loading placeholder
            $('#videoPlaceholder').fadeOut(300);
            // Ensure poster is visible
            if (this.poster) {
                this.style.backgroundImage = `url(${this.poster})`;
                this.style.backgroundSize = 'cover';
                this.style.backgroundPosition = 'center';
            }
        });
        
        video.addEventListener('canplay', function() {
            $(this).removeClass('video-loading');
            $('.video-container').removeClass('video-loading');
        });
        
        video.addEventListener('play', function() {
            $(this).addClass('playing');
            $(this).removeClass('video-loading');
        });
        
        video.addEventListener('pause', function() {
            $(this).removeClass('playing');
        });
        
        video.addEventListener('error', function() {
            $(this).removeClass('video-loading');
            $('.video-container').removeClass('video-loading');
            console.error('Video loading error:', this.error);
        });
        
        // Preload video metadata
        video.load();
    }
});
