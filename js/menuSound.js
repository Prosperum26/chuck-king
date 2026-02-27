/**
 * Menu theme for index.html
 */
const menuThemeAudio = new Audio();
menuThemeAudio.src = 'assets/sound/background/menuTheme.mp3';
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
