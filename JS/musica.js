/**
 * Simple Music Player for Wedding Website
 * Compatible with all devices including mobile
 */

document.addEventListener('DOMContentLoaded', function() {
    const musicToggle = document.getElementById('music-toggle');
    const audio = document.getElementById('background-music');
    
    if (!musicToggle || !audio) {
        console.error('Music elements not found');
        return;
    }
    
    let isPlaying = false;
    
    // Set initial volume
    audio.volume = 0.5;
    
    // Update button UI
    function updateButton() {
        const icon = musicToggle.querySelector('.music-player__icon');
        if (icon) {
            icon.textContent = isPlaying ? '🔊' : '🎵';
        }
        musicToggle.setAttribute('aria-pressed', isPlaying);
        musicToggle.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
    }
    
    // Toggle music
    musicToggle.addEventListener('click', function() {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
        } else {
            audio.play().then(function() {
                isPlaying = true;
                updateButton();
            }).catch(function(error) {
                console.error('Error playing audio:', error);
                alert('No se pudo reproducir la música. Por favor, intenta de nuevo.');
            });
        }
        updateButton();
    });
    
    // Handle audio end
    audio.addEventListener('ended', function() {
        isPlaying = false;
        updateButton();
    });
    
    // Handle audio errors
    audio.addEventListener('error', function(e) {
        console.error('Audio error:', e);
        isPlaying = false;
        updateButton();
    });
    
    console.log('Music player initialized');
});

// Made with Bob
