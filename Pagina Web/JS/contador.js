/**
 * ============================================================================
 * COUNTDOWN TIMER MODULE
 * ============================================================================
 * 
 * Professional countdown timer with performance optimization
 * Features:
 * - Efficient RAF-based updates
 * - Automatic cleanup
 * - Error handling
 * - Accessibility support
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        targetDate: new Date('2027-03-20T18:00:00-06:00'),
        updateInterval: 1000,
        element: document.getElementById('countdown')
    };
    
    // State
    let animationFrameId = null;
    let lastUpdate = 0;
    
    /**
     * Calculate time remaining until target date
     * @returns {Object} Time components
     */
    function calculateTimeRemaining() {
        const now = new Date().getTime();
        const distance = CONFIG.targetDate.getTime() - now;
        
        if (distance < 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                expired: true
            };
        }
        
        return {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
            expired: false
        };
    }
    
    /**
     * Format number with leading zero
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    function padNumber(num) {
        return String(num).padStart(2, '0');
    }
    
    /**
     * Create initial countdown HTML structure
     * @returns {string} HTML string
     */
    function createCountdownHTML() {
        return `
            <div class="countdown__grid" role="timer" aria-live="polite">
                <div class="countdown__item">
                    <span class="countdown__number" data-unit="days" aria-label="días">00</span>
                    <span class="countdown__label">Días</span>
                </div>
                <div class="countdown__separator" aria-hidden="true">:</div>
                <div class="countdown__item">
                    <span class="countdown__number" data-unit="hours" aria-label="horas">00</span>
                    <span class="countdown__label">Horas</span>
                </div>
                <div class="countdown__separator" aria-hidden="true">:</div>
                <div class="countdown__item">
                    <span class="countdown__number" data-unit="minutes" aria-label="minutos">00</span>
                    <span class="countdown__label">Minutos</span>
                </div>
                <div class="countdown__separator" aria-hidden="true">:</div>
                <div class="countdown__item">
                    <span class="countdown__number" data-unit="seconds" aria-label="segundos">00</span>
                    <span class="countdown__label">Segundos</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Update countdown numbers without recreating HTML
     * @param {Object} time - Time components
     */
    function updateCountdownNumbers(time) {
        if (!CONFIG.element) return;
        
        if (time.expired) {
            CONFIG.element.innerHTML = `
                <div class="countdown__message" role="status">
                    <p>¡El gran día ha llegado!</p>
                </div>
            `;
            return;
        }
        
        // Update only the numbers, not the entire HTML
        const daysEl = CONFIG.element.querySelector('[data-unit="days"]');
        const hoursEl = CONFIG.element.querySelector('[data-unit="hours"]');
        const minutesEl = CONFIG.element.querySelector('[data-unit="minutes"]');
        const secondsEl = CONFIG.element.querySelector('[data-unit="seconds"]');
        
        if (daysEl) {
            daysEl.textContent = padNumber(time.days);
            daysEl.setAttribute('aria-label', `${time.days} días`);
        }
        if (hoursEl) {
            hoursEl.textContent = padNumber(time.hours);
            hoursEl.setAttribute('aria-label', `${time.hours} horas`);
        }
        if (minutesEl) {
            minutesEl.textContent = padNumber(time.minutes);
            minutesEl.setAttribute('aria-label', `${time.minutes} minutos`);
        }
        if (secondsEl) {
            secondsEl.textContent = padNumber(time.seconds);
            secondsEl.setAttribute('aria-label', `${time.seconds} segundos`);
        }
    }
    
    /**
     * Update countdown display
     * @param {number} timestamp - Current timestamp
     */
    function updateCountdown(timestamp) {
        // Throttle updates to once per second
        if (timestamp - lastUpdate < CONFIG.updateInterval) {
            animationFrameId = requestAnimationFrame(updateCountdown);
            return;
        }
        
        lastUpdate = timestamp;
        
        try {
            const time = calculateTimeRemaining();
            updateCountdownNumbers(time);
            
            // Continue animation loop if not expired
            if (!time.expired) {
                animationFrameId = requestAnimationFrame(updateCountdown);
            }
        } catch (error) {
            console.error('Error updating countdown:', error);
            // Fallback display
            if (CONFIG.element) {
                CONFIG.element.innerHTML = '<p>Cargando contador...</p>';
            }
        }
    }
    
    /**
     * Initialize countdown
     */
    function init() {
        if (!CONFIG.element) {
            console.warn('Countdown element not found');
            return;
        }
        
        // Create initial HTML structure
        CONFIG.element.innerHTML = createCountdownHTML();
        
        // Start updating
        updateCountdown(0);
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

// Made with Bob
