// music.js - Persistent Background Music for U2 Presentation

const AUDIO_PATH = 'Song.mp3';
let audio = null;
let isSeeking = false;

function initAudio() {
    if (audio) return audio;

    audio = new Audio(AUDIO_PATH);
    audio.loop = true;

    // Load saved state
    const savedTime = localStorage.getItem('u2_music_time');
    const isPlaying = localStorage.getItem('u2_music_playing') === 'true';

    // IMPORTANT: Wait for metadata to be ready before setting currentTime
    // Browsers often ignore currentTime if the audio hasn't loaded enough info yet.
    const applySavedTime = () => {
        if (savedTime && !isSeeking) {
            audio.currentTime = parseFloat(savedTime);
            isSeeking = true; // Only seek once on load
        }
    };

    audio.addEventListener('loadedmetadata', applySavedTime);
    audio.addEventListener('canplay', applySavedTime);

    if (isPlaying) {
        audio.play().catch(error => {
            updateToggleUI(false);
        });
    }

    // Save state periodically
    setInterval(() => {
        if (audio && !audio.paused && audio.currentTime > 0) {
            localStorage.setItem('u2_music_time', audio.currentTime);
        }
    }, 500);

    return audio;
}

function toggleMusic() {
    if (!audio) initAudio();

    if (audio.paused) {
        // Double check if we need to resume from a specific spot
        const savedTime = localStorage.getItem('u2_music_time');
        if (audio.currentTime === 0 && savedTime) {
            audio.currentTime = parseFloat(savedTime);
        }

        audio.play().then(() => {
            localStorage.setItem('u2_music_playing', 'true');
            updateToggleUI(true);
        }).catch(err => console.error("Play error:", err));
    } else {
        audio.pause();
        // Save EXACT position immediately on pause to avoid restarts
        localStorage.setItem('u2_music_time', audio.currentTime);
        localStorage.setItem('u2_music_playing', 'false');
        updateToggleUI(false);
    }
}

function resetMusic() {
    if (!audio) initAudio();
    audio.currentTime = 0;
    localStorage.setItem('u2_music_time', '0');
    if (audio.paused) {
        toggleMusic(); // Play if it was paused
    }
}

function updateToggleUI(playing) {
    const btn = document.getElementById('music-toggle');
    if (!btn) return;

    if (playing) {
        btn.classList.add('playing');
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5z"/>
            </svg>
        `;
    } else {
        btn.classList.remove('playing');
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>
        `;
    }
}

// Initialize on load
window.addEventListener('load', () => {
    initAudio();

    const container = document.body;
    if (!document.getElementById('music-controls') && container) {
        const controls = document.createElement('div');
        controls.id = 'music-controls';
        controls.className = 'music-controls';

        // Reset Button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'music-btn reset-btn';
        resetBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
        `;
        resetBtn.title = "Reiniciar canción";
        resetBtn.onclick = resetMusic;

        // Toggle Button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'music-toggle';
        toggleBtn.className = 'music-btn';
        toggleBtn.onclick = toggleMusic;

        controls.appendChild(resetBtn);
        controls.appendChild(toggleBtn);
        container.appendChild(controls);
    }

    const isPlaying = localStorage.getItem('u2_music_playing') === 'true';
    updateToggleUI(isPlaying);
});

// Update state before leaving page
window.addEventListener('beforeunload', () => {
    if (audio && audio.currentTime > 0) {
        localStorage.setItem('u2_music_time', audio.currentTime);
        localStorage.setItem('u2_music_playing', !audio.paused);
    }
});
