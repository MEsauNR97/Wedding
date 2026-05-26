/**
 * ============================================================================
 * CAROUSEL MODULE
 * ============================================================================
 * 
 * Professional carousel with accessibility and performance optimization
 * Features:
 * - Touch/swipe support
 * - Keyboard navigation
 * - ARIA attributes
 * - Auto-play with pause on interaction
 * - Debounced resize handling
 * - Intersection Observer for performance
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        autoPlayInterval: 5000,
        transitionDuration: 500,
        swipeThreshold: 50,
        enableAutoPlay: true,
        enableLoop: true,
        seamlessLoop: true
    };
    
    // DOM Elements
    const elements = {
        carousel: document.querySelector('.carousel'),
        track: document.querySelector('.carousel__track'),
        slides: document.querySelectorAll('.carousel__slide'),
        prevBtn: document.querySelector('.carousel__btn--prev'),
        nextBtn: document.querySelector('.carousel__btn--next'),
        indicators: document.querySelectorAll('.carousel__indicator')
    };
    
    // State
    let state = {
        currentIndex: 0,
        isTransitioning: false,
        autoPlayTimer: null,
        touchStartX: 0,
        touchEndX: 0,
        isVisible: false
    };
    
    /**
     * Debounce function for performance
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Update carousel position
     * @param {number} index - Target slide index
     * @param {boolean} animate - Whether to animate transition
     */
    function updateCarousel(index, animate = true) {
        if (!elements.track || state.isTransitioning) return;
        
        const totalSlides = elements.slides.length;
        if (index < 0 || index >= totalSlides) return;
        
        state.isTransitioning = animate;
        state.currentIndex = index;
        
        const offset = -index * 100;
        elements.track.style.transition = animate ? `transform ${CONFIG.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none';
        elements.track.style.transform = `translateX(${offset}%)`;
        
        updateIndicators(index);
        updateAriaAttributes(index);
        
        if (!animate) {
            state.isTransitioning = false;
            return;
        }
        
        setTimeout(() => {
            state.isTransitioning = false;
        }, CONFIG.transitionDuration);
    }
    
    /**
     * Update indicator states
     * @param {number} activeIndex - Active slide index
     */
    function updateIndicators(activeIndex) {
        elements.indicators.forEach((indicator, index) => {
            const isActive = index === activeIndex;
            indicator.classList.toggle('carousel__indicator--active', isActive);
            indicator.setAttribute('aria-selected', isActive);
        });
    }
    
    /**
     * Update ARIA attributes for accessibility
     * @param {number} activeIndex - Active slide index
     */
    function updateAriaAttributes(activeIndex) {
        elements.slides.forEach((slide, index) => {
            const isActive = index === activeIndex;
            slide.setAttribute('aria-hidden', !isActive);
            
            // Update images lazy loading
            if (isActive) {
                const img = slide.querySelector('img[loading="lazy"]');
                if (img && !img.complete) {
                    img.loading = 'eager';
                }
            }
        });
    }
    
    /**
     * Navigate to next slide
     */
    function nextSlide() {
        const isLastSlide = state.currentIndex === elements.slides.length - 1;
        
        if (CONFIG.seamlessLoop && isLastSlide) {
            updateCarousel(0);
            resetAutoPlay();
            return;
        }
        
        const nextIndex = (state.currentIndex + 1) % elements.slides.length;
        updateCarousel(nextIndex);
        resetAutoPlay();
    }
    
    /**
     * Navigate to previous slide
     */
    function prevSlide() {
        const isFirstSlide = state.currentIndex === 0;
        
        if (CONFIG.seamlessLoop && isFirstSlide) {
            updateCarousel(elements.slides.length - 1);
            resetAutoPlay();
            return;
        }
        
        const prevIndex = (state.currentIndex - 1 + elements.slides.length) % elements.slides.length;
        updateCarousel(prevIndex);
        resetAutoPlay();
    }
    
    /**
     * Navigate to specific slide
     * @param {number} index - Target slide index
     */
    function goToSlide(index) {
        updateCarousel(index);
        resetAutoPlay();
    }
    
    /**
     * Start auto-play
     */
    function startAutoPlay() {
        if (!CONFIG.enableAutoPlay || !state.isVisible) return;
        
        stopAutoPlay();
        state.autoPlayTimer = setInterval(nextSlide, CONFIG.autoPlayInterval);
    }
    
    /**
     * Stop auto-play
     */
    function stopAutoPlay() {
        if (state.autoPlayTimer) {
            clearInterval(state.autoPlayTimer);
            state.autoPlayTimer = null;
        }
    }
    
    /**
     * Reset auto-play timer
     */
    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }
    
    /**
     * Handle touch start
     * @param {TouchEvent} e - Touch event
     */
    function handleTouchStart(e) {
        state.touchStartX = e.touches[0].clientX;
        stopAutoPlay();
    }
    
    /**
     * Handle touch move
     * @param {TouchEvent} e - Touch event
     */
    function handleTouchMove(e) {
        state.touchEndX = e.touches[0].clientX;
    }
    
    /**
     * Handle touch end
     */
    function handleTouchEnd() {
        const diff = state.touchStartX - state.touchEndX;
        
        if (Math.abs(diff) > CONFIG.swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        } else {
            startAutoPlay();
        }
        
        state.touchStartX = 0;
        state.touchEndX = 0;
    }
    
    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleKeyboard(e) {
        if (!elements.carousel.contains(document.activeElement)) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(elements.slides.length - 1);
                break;
        }
    }
    
    /**
     * Setup Intersection Observer for performance
     */
    function setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                state.isVisible = entry.isIntersecting;
                
                if (entry.isIntersecting) {
                    startAutoPlay();
                } else {
                    stopAutoPlay();
                }
            });
        }, options);
        
        if (elements.carousel) {
            observer.observe(elements.carousel);
        }
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Button navigation
        if (elements.prevBtn) {
            elements.prevBtn.addEventListener('click', prevSlide);
        }
        
        if (elements.nextBtn) {
            elements.nextBtn.addEventListener('click', nextSlide);
        }
        
        // Indicator navigation
        elements.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => goToSlide(index));
        });
        
        // Touch events
        if (elements.track) {
            elements.track.addEventListener('touchstart', handleTouchStart, { passive: true });
            elements.track.addEventListener('touchmove', handleTouchMove, { passive: true });
            elements.track.addEventListener('touchend', handleTouchEnd);
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboard);
        
        // Pause on hover
        if (elements.carousel) {
            elements.carousel.addEventListener('mouseenter', stopAutoPlay);
            elements.carousel.addEventListener('mouseleave', startAutoPlay);
        }
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoPlay();
            } else if (state.isVisible) {
                startAutoPlay();
            }
        });
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', stopAutoPlay);
    }
    
    /**
     * Initialize carousel
     */
    function init() {
        // Validate required elements
        if (!elements.carousel || !elements.track || elements.slides.length === 0) {
            console.warn('Carousel elements not found or no slides available');
            return;
        }
        
        try {
            // Initial setup
            updateCarousel(0, false);
            
            // Setup observers and listeners
            setupIntersectionObserver();
            setupEventListeners();
            
            console.log('Carousel initialized successfully');
        } catch (error) {
            console.error('Error initializing carousel:', error);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

// Made with Bob
