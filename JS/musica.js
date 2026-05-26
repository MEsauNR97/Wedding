/**
 * ============================================================================
 * MUSIC PLAYER MODULE
 * ============================================================================
 * 
 * Professional audio player with accessibility and error handling
 * Features:
 * - User interaction requirement compliance
 * - Error handling and fallbacks
 * - Accessibility support
 * - State persistence
 * - Volume fade in/out
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        fadeInDuration: 2000,
        fadeOutDuration: 1000,
        defaultVolume: 0.7,
        storageKey: 'wedding-music-state'
    };
    
    // DOM Elements
    const elements = {
        toggleBtn: document.getElementById('music-toggle'),
        audio: document.getElementById('background-music')
    };
    
    // State
    let state = {
        isPlaying: false,
        volume: CONFIG.defaultVolume,
        fadeInterval: null,
        hasInteracted: false,
        isInitialized: false
    };
    
    /**
     * Load saved state from localStorage
     */
    function loadState() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                state.isPlaying = parsed.isPlaying || false;
                state.volume = parsed.volume || CONFIG.defaultVolume;
            }
        } catch (error) {
            console.warn('Could not load music state:', error);
        }
    }
    
    /**
     * Save state to localStorage
     */
    function saveState() {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify({
                isPlaying: state.isPlaying,
                volume: state.volume
            }));
        } catch (error) {
            console.warn('Could not save music state:', error);
        }
    }
    
    /**
     * Fade audio volume
     * @param {number} targetVolume - Target volume (0-1)
     * @param {number} duration - Fade duration in ms
     * @returns {Promise} Resolves when fade is complete
     */
    function fadeVolume(targetVolume, duration) {
        return new Promise((resolve) => {
            if (!elements.audio) {
                resolve();
                return;
            }
            
            const startVolume = elements.audio.volume;
            const volumeDiff = targetVolume - startVolume;
            const steps = 50;
            const stepDuration = duration / steps;
            const volumeStep = volumeDiff / steps;
            let currentStep = 0;
            
            // Clear any existing fade
            if (state.fadeInterval) {
                clearInterval(state.fadeInterval);
            }
            
            state.fadeInterval = setInterval(() => {
                currentStep++;
                const newVolume = startVolume + (volumeStep * currentStep);
                elements.audio.volume = Math.max(0, Math.min(1, newVolume));
                
                if (currentStep >= steps) {
                    clearInterval(state.fadeInterval);
                    state.fadeInterval = null;
                    elements.audio.volume = targetVolume;
                    resolve();
                }
            }, stepDuration);
        });
    }
    
    /**
     * Play audio with fade in
     */
    async function playAudio() {
        if (!elements.audio || state.isPlaying) return;
        
        try {
            // Set initial volume to 0 for fade in
            elements.audio.volume = 0;
            
            // Attempt to play
            const playPromise = elements.audio.play();
            
            if (playPromise !== undefined) {
                await playPromise;
                
                // Fade in
                await fadeVolume(CONFIG.defaultVolume, CONFIG.fadeInDuration);
                
                state.isPlaying = true;
                state.volume = CONFIG.defaultVolume;
                updateUI();
                saveState();
                
                console.log('Audio playing successfully');
            }
            
        } catch (error) {
            console.error('Error playing audio:', error);
            handlePlaybackError(error);
            state.isPlaying = false;
            updateUI();
        }
    }
    
    /**
     * Pause audio with fade out
     */
    async function pauseAudio() {
        if (!elements.audio || !state.isPlaying) return;
        
        try {
            // Fade out
            await fadeVolume(0, CONFIG.fadeOutDuration);
            
            // Pause
            elements.audio.pause();
            
            state.isPlaying = false;
            updateUI();
            saveState();
            
        } catch (error) {
            console.error('Error pausing audio:', error);
        }
    }
    
    /**
     * Toggle audio playback
     */
    async function toggleAudio() {
        state.hasInteracted = true;
        
        if (elements.audio) {
            elements.audio.volume = CONFIG.defaultVolume;
            state.volume = CONFIG.defaultVolume;
        }
        
        if (state.isPlaying) {
            await pauseAudio();
        } else {
            await playAudio();
        }
    }
    
    /**
     * Update UI to reflect current state
     */
    function updateUI() {
        if (!elements.toggleBtn) return;
        
        const isPlaying = state.isPlaying;
        
        // Update button state
        elements.toggleBtn.setAttribute('aria-pressed', isPlaying);
        elements.toggleBtn.setAttribute(
            'aria-label',
            isPlaying ? 'Pausar música de fondo' : 'Reproducir música de fondo'
        );
        
        // Update icon
        const icon = elements.toggleBtn.querySelector('.music-player__icon');
        if (icon) {
            icon.textContent = isPlaying ? '🔊' : '🎵';
        }
    }
    
    /**
     * Handle playback errors
     * @param {Error} error - Error object
     */
    function handlePlaybackError(error) {
        console.error('Playback error:', error);
        
        // Show user-friendly message
        if (error.name === 'NotAllowedError') {
            console.warn('Audio playback requires user interaction');
        } else if (error.name === 'NotSupportedError') {
            console.error('Audio format not supported');
            showAudioError('Formato de audio no soportado');
        } else if (error.name === 'AbortError') {
            console.warn('Audio playback was aborted');
        } else {
            showAudioError('Error al reproducir música');
        }
        
        state.isPlaying = false;
        updateUI();
    }
    
    /**
     * Show audio error message
     * @param {string} message - Error message
     */
    function showAudioError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'audio-error-notification';
        notification.setAttribute('role', 'alert');
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            padding: '12px 20px',
            background: 'rgba(220, 53, 69, 0.9)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: '9999',
            animation: 'fadeIn 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    /**
     * Setup audio event listeners
     */
    function setupAudioListeners() {
        if (!elements.audio) return;
        
        // Handle audio end
        elements.audio.addEventListener('ended', () => {
            state.isPlaying = false;
            updateUI();
        });
        
        // Handle audio errors
        elements.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            handlePlaybackError(new Error('Audio loading failed'));
        });
        
        // Handle audio loading
        elements.audio.addEventListener('loadstart', () => {
            console.log('Audio loading started');
        });
        
        elements.audio.addEventListener('canplay', () => {
            console.log('Audio ready to play');
        });
        
        // Handle volume change
        elements.audio.addEventListener('volumechange', () => {
            if (!state.fadeInterval) {
                state.volume = elements.audio.volume;
                saveState();
            }
        });
    }
    
    /**
     * Setup button event listeners
     */
    function setupButtonListeners() {
        if (!elements.toggleBtn) return;
        
        elements.toggleBtn.addEventListener('click', toggleAudio);
        
        // Keyboard support
        elements.toggleBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleAudio();
            }
        });
    }
    
    /**
     * Handle page visibility change
     */
    function handleVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && state.isPlaying) {
                pauseAudio();
            }
        });
    }
    
    /**
     * Cleanup on page unload
     */
    function cleanup() {
        window.addEventListener('beforeunload', () => {
            if (state.fadeInterval) {
                clearInterval(state.fadeInterval);
            }
            saveState();
        });
    }
    
    /**
     * Initialize music player
     */
    function init() {
        // Validate required elements
        if (!elements.toggleBtn || !elements.audio) {
            console.warn('Music player elements not found');
            return;
        }
        
        try {
            // Set initial volume
            if (elements.audio) {
                elements.audio.volume = CONFIG.defaultVolume;
            }
            
            // Load saved state
            loadState();
            
            // Setup listeners
            setupAudioListeners();
            setupButtonListeners();
            handleVisibilityChange();
            cleanup();
            
            // Initial UI update
            updateUI();
            
            state.isInitialized = true;
            
            console.log('Music player initialized successfully');
            console.log('Click the music button to start playing');
            
        } catch (error) {
            console.error('Error initializing music player:', error);
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

