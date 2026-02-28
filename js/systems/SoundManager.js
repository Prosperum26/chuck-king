/**
 * SoundManager - Quản lý âm thanh cho game
 * Bao gồm: Menu theme, background music, sound effects
 */
export class SoundManager {
    constructor() {
        // Paths to sound files
        this.soundPaths = {
            // Menu theme
            menuTheme: 'assets/sound/background/menuTheme.mp3',
            
            // Background music
            backgroundScene1: 'assets/sound/background/background_scene1.ogg',
            backgroundScene2: 'assets/sound/background/background_scene2.mp3',
            
            // Sound effects - Player actions
            jump: 'assets/sound/SFX/jump.mp3',
            fall: 'assets/sound/SFX/DEEP_fall.mp3',
            conversation: 'assets/sound/SFX/sfx_conversation.mp3',
            
            // Walking sounds
            walkScene1Left: 'assets/sound/SFX/sfx_walk_scene1_left.flac',
            walkScene1Right: 'assets/sound/SFX/sfx_walk_scene1_right.flac',
            walkScene2Left: 'assets/sound/SFX/sfx_walk_scene2_left.flac',
            walkScene2Right: 'assets/sound/SFX/sfx_walk_scene2_right.flac',
        };
        
        // Audio elements for background music
        this.menuThemeAudio = new Audio();
        this.backgroundMusicAudio = new Audio();
        
        // Settings
        this.masterVolume = 1.0;
        this.bgmVolume = 0.5;      // Background music volume
        this.sfxVolume = 0.7;      // Sound effects volume
        this.isMuted = false;
        
        // Track current state
        this.currentBGM = null;
        this.activeSFX = new Map(); // Store playing SFX to prevent overlap
        this.lastWalkSound = null;  // Track last walk sound to avoid replay
        
        this.init();
    }
    
    init() {
        // Setup background music audio
        this.backgroundMusicAudio.loop = true;
        this.menuThemeAudio.loop = true;
        
        // Apply volume settings
        this.updateVolume();
    }
    
    /**
     * Play menu theme
     */
    playMenuTheme() {
        if (this.currentBGM === 'menu') return; // Already playing
        
        this.stopAllBGM();
        this.menuThemeAudio.src = this.soundPaths.menuTheme;
        this.menuThemeAudio.volume = this.isMuted ? 0 : this.masterVolume * this.bgmVolume;
        this.menuThemeAudio.play().catch(e => console.log('Menu theme play error:', e));
        this.currentBGM = 'menu';
    }
    
    /**
     * Play background music for specific scene
     * @param {number} sceneNumber - Scene 1 or 2
     */
    playBackgroundMusic(sceneNumber) {
        const sceneKey = `backgroundScene${sceneNumber}`;
        if (this.currentBGM === sceneKey) return; // Already playing
        
        this.stopAllBGM();
        const soundPath = this.soundPaths[sceneKey];
        if (!soundPath) {
            console.warn(`Scene ${sceneNumber} background music not found`);
            return;
        }
        
        this.backgroundMusicAudio.src = soundPath;
        this.backgroundMusicAudio.volume = this.isMuted ? 0 : this.masterVolume * this.bgmVolume;
        this.backgroundMusicAudio.play().catch(e => console.log('Background music play error:', e));
        this.currentBGM = sceneKey;
    }
    
    /**
     * Play sound effect
     * @param {string} effectName - Name of the sound effect
     * @param {boolean} canOverlap - Allow multiple instances of same SFX (default: true)
     */
    playSFX(effectName, canOverlap = true) {
        const soundPath = this.soundPaths[effectName];
        if (!soundPath) {
            console.warn(`Sound effect '${effectName}' not found`);
            return;
        }
        
        // Prevent overlapping same SFX if specified
        if (!canOverlap && this.activeSFX.has(effectName)) {
            return; // Already playing, don't play again
        }
        
        const sfxAudio = new Audio();
        sfxAudio.src = soundPath;
        sfxAudio.volume = this.isMuted ? 0 : this.masterVolume * this.sfxVolume;
        
        // Remove from active SFX when finished
        sfxAudio.addEventListener('ended', () => {
            this.activeSFX.delete(effectName);
            // Clear last walk sound so it can be played again
            if (effectName.includes('walk')) {
                this.lastWalkSound = null;
            }
        });
        
        sfxAudio.play().catch(e => console.log(`SFX '${effectName}' play error:`, e));
        
        if (!canOverlap) {
            this.activeSFX.set(effectName, sfxAudio);
        }
    }
    
    /**
     * Play walking sound for specific scene and direction
     * @param {number} sceneNumber - Current scene (1 or 2)
     * @param {string} direction - 'left' or 'right'
     */
    playWalkSound(sceneNumber, direction) {
        const walkKey = `walkScene${sceneNumber}${direction.charAt(0).toUpperCase() + direction.slice(1)}`;
        
        // Only play if it's a different walk sound than before (prevent spam of same sound)
        if (this.lastWalkSound !== walkKey) {
            this.playSFX(walkKey, false);  // Don't overlap - allow alternating L/R but not rapid same direction
            this.lastWalkSound = walkKey;
        }
    }
    
    /**
     * Play jump sound
     */
    playJump() {
        this.playSFX('jump', true);
    }
    
    /**
     * Play falling sound
     */
    playFall() {
        this.playSFX('fall', false); // Only one fall sound at a time
    }
    
    /**
     * Play conversation sound (NPC dialogue)
     */
    playConversation() {
        this.playSFX('conversation', false);
    }
    
    /**
     * Stop all background music
     */
    stopAllBGM() {
        this.menuThemeAudio.pause();
        this.backgroundMusicAudio.pause();
        this.currentBGM = null;
    }
    
    /**
     * Stop all sounds (BGM + SFX)
     */
    stopAll() {
        this.stopAllBGM();
        this.activeSFX.forEach(audio => audio.pause());
        this.activeSFX.clear();
        this.lastWalkSound = null;
    }
    
    /**
     * Set master volume (0.0 to 1.0)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolume();
    }
    
    /**
     * Set background music volume (0.0 to 1.0)
     */
    setBGMVolume(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        this.updateVolume();
    }
    
    /**
     * Set sound effects volume (0.0 to 1.0)
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolume();
    }
    
    /**
     * Toggle mute/unmute
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateVolume();
        return this.isMuted;
    }
    
    /**
     * Internal: Update all audio volumes
     */
    updateVolume() {
        const bgmVol = this.isMuted ? 0 : this.masterVolume * this.bgmVolume;
        const sfxVol = this.isMuted ? 0 : this.masterVolume * this.sfxVolume;
        
        this.menuThemeAudio.volume = bgmVol;
        this.backgroundMusicAudio.volume = bgmVol;
        
        this.activeSFX.forEach(audio => {
            audio.volume = sfxVol;
        });
    }
    
    /**
     * Get current volume settings (for UI display)
     */
    getVolumeSettings() {
        return {
            master: this.masterVolume,
            bgm: this.bgmVolume,
            sfx: this.sfxVolume,
            isMuted: this.isMuted
        };
    }
}
