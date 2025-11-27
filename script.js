// -------------------
// ELEMENTS
// -------------------
const pages = {
    sound: document.getElementById('page-sound'),
    home: document.getElementById('page-home'),
    rules: document.getElementById('page-rules'),
    menu: document.getElementById('page-menu'),
    game: document.getElementById('page-game')
};

const btnActivateSound = document.getElementById('btn-activate-sound');
const btnPlay = document.getElementById('btn-play');
const btnRules = document.getElementById('btn-rules');
const diffs = document.querySelectorAll('.diff');
const btnEndGame = document.getElementById('btn-end-game');
const btnBacks = document.querySelectorAll('.btn-back');
const btnToggleSound = document.getElementById('btn-toggle-sound');
const soundBar = document.getElementById('sound-bar');
const chronoEl = document.getElementById('chrono');
let chronoGif = document.querySelector('#page-game .gif10');

const bgMusic = document.getElementById('bg-music');
const ding = document.getElementById('ding');

let timerInterval = null;
let timeLeft = 0;
let musicOn = true;
let musicPaused = true;

// -------------------
// FONCTIONS
// -------------------
function showPage(page){
    Object.values(pages).forEach(p => p.classList.remove('active'));
    page.classList.add('active');

    // Couper musique uniquement sur la page du chrono
    if(page === pages.game){
        if(!bgMusic.paused){
            bgMusic.pause();
            musicPaused = true;
        }

        // Reset GIF sans flash
        const newGif = chronoGif.cloneNode(true);
        chronoGif.parentNode.replaceChild(newGif, chronoGif);
        chronoGif = newGif;
    }
}

// Timer
function startTimer(duration){
    clearInterval(timerInterval);
    timeLeft = duration;
    updateChrono();
    btnEndGame.style.display = 'none';

    timerInterval = setInterval(()=>{
        timeLeft--;
        updateChrono();
        if(timeLeft <= 0){
            clearInterval(timerInterval);
            chronoEl.textContent = '00:00';
            btnEndGame.style.display = 'block';

            // Clochette finale
            ding.currentTime = 0;
            ding.play().catch(e=>console.log("Erreur ding", e));
        }
    },1000);
}

function updateChrono(){
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    chronoEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// -------------------
// EVENEMENTS
// -------------------

// Débloquer audio au premier clic
btnActivateSound.addEventListener('click', ()=>{
    if(musicOn){
        bgMusic.volume = 1;
        bgMusic.play().catch(e=>console.log("Erreur musique:", e));
        musicPaused = false;
    }

    // Clochette très courte pour débloquer le son sur mobile
    ding.currentTime = 0;
    ding.play().then(()=>{setTimeout(()=>ding.pause(),50)}).catch(e=>console.log("Erreur ding unlock", e));

    showPage(pages.home);
});

// Jouer -> menu difficulté
btnPlay.addEventListener('click', ()=>{
    showPage(pages.menu);
    if(musicOn && musicPaused){
        bgMusic.play().catch(e=>console.log("Erreur musique menu", e));
        musicPaused = false;
    }
});

// Bouton Règles -> page règles
btnRules.addEventListener('click', ()=>{
    showPage(pages.rules);
});

// Choix difficulté -> chrono
diffs.forEach(d=>{
    d.addEventListener('click', ()=>{
        const sec = parseInt(d.dataset.sec);
        startTimer(sec);
        showPage(pages.game);
    });
});

// Fin du chrono -> retour menu
btnEndGame.addEventListener('click', ()=>{
    showPage(pages.menu);
    btnEndGame.style.display = 'none';
    if(musicOn && musicPaused){
        bgMusic.play().catch(e=>console.log("Erreur musique menu retour", e));
        musicPaused = false;
    }
});

// Retour -> accueil
btnBacks.forEach(b=>{
    b.addEventListener('click', ()=>{
        clearInterval(timerInterval);
        btnEndGame.style.display = 'none';
        showPage(pages.home);
        if(musicOn){
            bgMusic.volume = 1;
            bgMusic.play().catch(e=>console.log("Erreur play retour accueil", e));
            musicPaused = false;
        }
    });
});

// Toggle son avec barre rouge
btnToggleSound.addEventListener('click', ()=>{
    musicOn = !musicOn;
    if(musicOn){
        soundBar.style.display = 'none';
        if(pages.home.classList.contains('active') || pages.menu.classList.contains('active')){
            if(musicPaused){
                bgMusic.play().catch(e=>console.log("Erreur play toggle", e));
                musicPaused = false;
            }
        }
    } else {
        bgMusic.pause();
        musicPaused = true;
        soundBar.style.display = 'block';
    }
});

// Couper la musique si l'utilisateur quitte la page ou ferme l'onglet
window.addEventListener('visibilitychange', ()=>{
    if(document.hidden && !bgMusic.paused){
        bgMusic.pause();
        musicPaused = true;
    } else if(!document.hidden && musicOn && !pages.game.classList.contains('active')){
        bgMusic.play().catch(e=>console.log("Erreur reprise musique", e));
        musicPaused = false;
    }
});
