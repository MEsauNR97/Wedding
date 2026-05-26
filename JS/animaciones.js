/**
 * ============================================================================
 * ANIMATIONS MODULE
 * ============================================================================
 * 
 * Professional animations with performance optimization
 * Features:
 * - Intersection Observer for scroll animations
 * - Debounced scroll handling
 * - Smooth parallax effects
 * - Progress bar
 * - Optimized particle system
 * - Respects prefers-reduced-motion
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        observerThreshold: 0.15,
        observerRootMargin: '0px 0px -80px 0px',
        parallaxSpeed: 0.5,
        fadeSpeed: 0.002,
        particleInterval: 2500,
        particleColors: [
            'rgba(212, 175, 122, 0.4)',
            'rgba(198, 90, 46, 0.3)',
            'rgba(232, 217, 197, 0.5)'
        ]
    };
    
    // State
    let state = {
        ticking: false,
        prefersReducedMotion: false,
        particleTimer: null
    };
    
    // DOM Elements
    const elements = {
        loadingScreen: document.getElementById('loading-screen'),
        scrollTopBtn: document.getElementById('scroll-top'),
        progressBar: document.querySelector('.progress-bar'),
        hero: document.querySelector('.hero'),
        heroContent: document.querySelector('.hero__content'),
        scrollIndicator: document.querySelector('.scroll-indicator'),
        sections: document.querySelectorAll('.section')
    };
    
    /**
     * Check for reduced motion preference
     */
    function checkReducedMotion() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        state.prefersReducedMotion = mediaQuery.matches;
        
        // Listen for changes
        mediaQuery.addEventListener('change', (e) => {
            state.prefersReducedMotion = e.matches;
            if (e.matches) {
                stopParticles();
            } else {
                startParticles();
            }
        });
    }
    
    /**
     * Debounce function
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
     * Handle loading screen
     */
    function handleLoadingScreen() {
        if (!elements.loadingScreen) return;
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                elements.loadingScreen.style.opacity = '0';
                elements.loadingScreen.style.transform = 'scale(1.1)';
                
                setTimeout(() => {
                    elements.loadingScreen.classList.add('hidden');
                    elements.loadingScreen.setAttribute('aria-hidden', 'true');
                }, 600);
            }, 1200);
        });
    }
    
    /**
     * Setup scroll to top button
     */
    function setupScrollTopButton() {
        if (!elements.scrollTopBtn) return;
        
        const handleScroll = debounce(() => {
            const shouldShow = window.pageYOffset > 300;
            elements.scrollTopBtn.classList.toggle('visible', shouldShow);
            elements.scrollTopBtn.setAttribute('aria-hidden', !shouldShow);
        }, 100);
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        elements.scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    /**
     * Setup progress bar
     */
    function setupProgressBar() {
        if (!elements.progressBar) return;
        
        const updateProgress = () => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            elements.progressBar.style.width = `${Math.min(scrolled, 100)}%`;
            elements.progressBar.setAttribute('aria-valuenow', Math.min(Math.round(scrolled), 100));
        };
        
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress(); // Initial call
    }
    
    /**
     * Setup Intersection Observer for sections with hide on scroll up
     */
    function setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for browsers without IntersectionObserver
            elements.sections.forEach(section => {
                section.classList.add('animate-in');
            });
            return;
        }
        
        const options = {
            threshold: CONFIG.observerThreshold,
            rootMargin: CONFIG.observerRootMargin
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Show section when scrolling into view
                    entry.target.classList.add('animate-in');
                    
                    // Animate child elements with stagger
                    const children = entry.target.querySelectorAll('.animate-child');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('animate-in');
                        }, index * 100);
                    });
                } else {
                    // Hide section when scrolling out of view
                    entry.target.classList.remove('animate-in');
                    
                    // Hide child elements
                    const children = entry.target.querySelectorAll('.animate-child');
                    children.forEach(child => {
                        child.classList.remove('animate-in');
                    });
                }
            });
        }, options);
        
        // Observe all sections
        elements.sections.forEach(section => {
            observer.observe(section);
        });
    }
    
    /**
     * Setup parallax effect on hero
     */
    function setupParallax() {
        if (!elements.hero || state.prefersReducedMotion) return;
        
        const handleScroll = () => {
            if (!state.ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    
                    if (scrolled < elements.hero.offsetHeight) {
                        // Parallax effect
                        elements.hero.style.transform = `translateY(${scrolled * CONFIG.parallaxSpeed}px)`;
                        
                        // Fade out effect
                        if (elements.heroContent) {
                            const opacity = Math.max(0, 1 - (scrolled * CONFIG.fadeSpeed));
                            const scale = 1 - (scrolled * 0.0003);
                            elements.heroContent.style.opacity = opacity;
                            elements.heroContent.style.transform = `translateY(${scrolled * 0.3}px) scale(${Math.max(scale, 0.9)})`;
                        }
                    }
                    
                    state.ticking = false;
                });
                
                state.ticking = true;
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    /**
     * Setup scroll indicator
     */
    function setupScrollIndicator() {
        if (!elements.scrollIndicator) return;
        
        elements.scrollIndicator.addEventListener('click', () => {
            const firstSection = document.querySelector('.section');
            if (firstSection) {
                firstSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    /**
     * Setup smooth scroll for anchor links
     */
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update focus for accessibility
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    target.removeAttribute('tabindex');
                }
            });
        });
    }
    
    /**
     * Create decorative particle
     */
    function createParticle() {
        if (state.prefersReducedMotion) return;
        
        const particle = document.createElement('div');
        const size = Math.random() * 8 + 4;
        const color = CONFIG.particleColors[Math.floor(Math.random() * CONFIG.particleColors.length)];
        
        // Style particle
        Object.assign(particle.style, {
            position: 'fixed',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: color,
            pointerEvents: 'none',
            zIndex: '1',
            left: `${Math.random() * window.innerWidth}px`,
            top: '-20px',
            boxShadow: '0 0 10px rgba(212, 175, 122, 0.3)',
            willChange: 'transform, opacity'
        });
        
        document.body.appendChild(particle);
        
        // Animate particle
        const duration = Math.random() * 3000 + 4000;
        const drift = (Math.random() - 0.5) * 100;
        
        const animation = particle.animate([
            {
                transform: 'translateY(0) translateX(0) scale(1)',
                opacity: 0.8
            },
            {
                transform: `translateY(${window.innerHeight + 50}px) translateX(${drift}px) scale(0.5)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        // Remove particle after animation
        animation.onfinish = () => particle.remove();
    }
    
    /**
     * Start particle system
     */
    function startParticles() {
        if (state.prefersReducedMotion || state.particleTimer) return;
        
        state.particleTimer = setInterval(createParticle, CONFIG.particleInterval);
    }
    
    /**
     * Stop particle system
     */
    function stopParticles() {
        if (state.particleTimer) {
            clearInterval(state.particleTimer);
            state.particleTimer = null;
        }
    }
    
    /**
     * Setup ripple effect on buttons
     */
    function setupRippleEffect() {
        const buttons = document.querySelectorAll('button, .event-venue__link');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                if (state.prefersReducedMotion) return;
                
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                Object.assign(ripple.style, {
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${x}px`,
                    top: `${y}px`
                });
                
                ripple.classList.add('ripple');
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }
    
    /**
     * Setup hover effects on cards
     */
    function setupCardEffects() {
        if (state.prefersReducedMotion) return;
        
        const cards = document.querySelectorAll('.event-venue, .gift-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            });
        });
    }
    
    /**
     * Handle visibility change
     */
    function handleVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopParticles();
            } else if (!state.prefersReducedMotion) {
                startParticles();
            }
        });
    }
    
    /**
     * Cleanup on page unload
     */
    function cleanup() {
        window.addEventListener('beforeunload', () => {
            stopParticles();
        });
    }
    
    /**
     * Setup advanced hover effects
     */
    function setupAdvancedHoverEffects() {
        // Magnetic effect on buttons
        const magneticElements = document.querySelectorAll('.carousel__btn, .gift-card__link, .event-venue__link');
        
        magneticElements.forEach(element => {
            element.addEventListener('mousemove', function(e) {
                if (state.prefersReducedMotion) return;
                
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const moveX = x * 0.15;
                const moveY = y * 0.15;
                
                this.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.transform = 'translate(0, 0)';
            });
        });
    }
    
    /**
     * Setup tilt effect on cards
     */
    function setupTiltEffect() {
        if (state.prefersReducedMotion) return;
        
        const tiltCards = document.querySelectorAll('.gift-card, .event-venue');
        
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }
    
    /**
     * Setup text reveal animation
     */
    function setupTextReveal() {
        const textElements = document.querySelectorAll('.section__text');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const text = entry.target;
                    text.style.opacity = '0';
                    
                    setTimeout(() => {
                        text.style.transition = 'opacity 1.5s ease, transform 1.5s ease';
                        text.style.opacity = '1';
                        text.style.transform = 'translateY(0)';
                    }, 200);
                }
            });
        }, {
            threshold: 0.2
        });
        
        textElements.forEach(el => {
            el.style.transform = 'translateY(20px)';
            observer.observe(el);
        });
    }
    
    /**
     * Setup staggered animation for list items
     */
    function setupStaggeredAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = entry.target.querySelectorAll('.carousel__indicator, .countdown__item');
                    
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, index * 100);
                    });
                }
            });
        }, {
            threshold: 0.3
        });
        
        const containers = document.querySelectorAll('.carousel__indicators, .countdown__grid');
        containers.forEach(container => {
            const items = container.querySelectorAll('.carousel__indicator, .countdown__item');
            items.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                item.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            });
            observer.observe(container);
        });
    }
    
    /**
     * Setup floating animation for decorative icons
     */
    function setupFloatingIcons() {
        if (state.prefersReducedMotion) return;
        
        const icons = document.querySelectorAll('.decorative-icon');
        
        icons.forEach((icon, index) => {
            const duration = 8 + (index * 2);
            const delay = index * 0.5;
            
            icon.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        });
    }
    
    /**
     * Initialize all animations
     */
    function init() {
        try {
            // Check user preferences
            checkReducedMotion();
            
            // Initialize components
            handleLoadingScreen();
            setupScrollTopButton();
            setupProgressBar();
            setupIntersectionObserver();
            setupParallax();
            setupScrollIndicator();
            setupSmoothScroll();
            setupRippleEffect();
            setupCardEffects();
            setupAdvancedHoverEffects();
            setupTiltEffect();
            setupTextReveal();
            setupStaggeredAnimations();
            setupFloatingIcons();
            handleVisibilityChange();
            cleanup();
            
            // Start particle system if motion is allowed
            if (!state.prefersReducedMotion) {
                startParticles();
            }
            
            // Console welcome message
            console.log(
                '%c✨ ¡Bienvenido a la boda de Esau & Gala! 💍',
                'font-size: 24px; color: #c65a2e; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);'
            );
            console.log(
                '%c📅 20 de Marzo de 2027',
                'font-size: 16px; color: #d4af7a; font-weight: 600;'
            );
            console.log(
                '%c💝 Diseñado con estándares profesionales',
                'font-size: 12px; color: #5a3825; font-style: italic;'
            );
            
        } catch (error) {
            console.error('Error initializing animations:', error);
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
