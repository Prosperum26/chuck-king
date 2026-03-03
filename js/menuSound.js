const menuThemeAudio = new Audio();
menuThemeAudio.src = './assets/sound/background/menuTheme.mp3';
menuThemeAudio.loop = true;
menuThemeAudio.volume = 0.5;

const playAudio = () => {
    menuThemeAudio.play().catch(e => console.log('Audio play error:', e));
    document.removeEventListener('click', playAudio);
    document.removeEventListener('keydown', playAudio);
};

document.addEventListener('click', playAudio);
document.addEventListener('keydown', playAudio);

window.addEventListener('beforeunload', () => {
    menuThemeAudio.pause();
});

// Click sound for menu buttons
const clickSfx = new Audio();
clickSfx.src = '../Assets/sound/SFX/minecraft_click.mp3';
clickSfx.volume = 0.7;

const bindButtonClickSound = () => {
    const buttons = document.querySelectorAll('.pixel-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            clickSfx.currentTime = 0;
            clickSfx.play().catch(e => console.log('Click SFX error:', e));
        });
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindButtonClickSound);
} else {
    bindButtonClickSound();
}
