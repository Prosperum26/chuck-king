# 🎵 Sound System Documentation

## Overview
The game now has a complete sound management system with background music, sound effects, and volume control.

## File Structure
```
assets/
└── sound/
    ├── background/
    │   ├── menuTheme.mp3        # Main menu background theme
    │   ├── background_scene1.ogg # Gameplay Scene 1 background
    │   └── background_scene2.mp3 # Gameplay Scene 2 background
    └── SFX/
        ├── jump.mp3                # Player jump sound
        ├── DEEP_fall.mp3          # Player falling/landing sound
        ├── sfx_conversation.mp3   # NPC conversation sound
        ├── sfx_walk_scene1_left.flac  # Walking left in Scene 1
        ├── sfx_walk_scene1_right.flac # Walking right in Scene 1
        ├── sfx_walk_scene2_left.flac  # Walking left in Scene 2
        └── sfx_walk_scene2_right.flac # Walking right in Scene 2
```

## Sound Events & When They Play

| Sound | Event | When |
|-------|-------|------|
| **Menu Theme** | Page loads | On HTML page load before game starts |
| **Background Music** | Game starts | When player clicks "GET READY!" button |
| **Scene 1 Background** | Gameplay | Playing in Scene 1 |
| **Scene 2 Background** | Gameplay | Playing in Scene 2 |
| **Jump** | Player jumps | When Space key pressed and player is grounded |
| **Walk Left** | Move left | When ← or A key pressed while playing |
| **Walk Right** | Move right | When → or D key pressed while playing |
| **Fall** | Hard landing | When player falls more than 50% of screen height |
| **Bounce** | Bouncy platform | When landing on a bouncy platform |
| **Conversation** | NPC dialogue | When conversation triggers (future feature) |

## SoundManager API

### Basic Methods
```javascript
// Play sounds
soundManager.playMenuTheme();
soundManager.playBackgroundMusic(sceneNumber);  // 1 or 2
soundManager.playJump();
soundManager.playFall();
soundManager.playWalkSound(sceneNumber, direction);  // direction: 'left' or 'right'
soundManager.playConversation();

// Stop sounds
soundManager.stopAllBGM();
soundManager.stopAll();  // Stop everything
```

### Volume Control
```javascript
// Set volumes (0.0 to 1.0)
soundManager.setMasterVolume(0.8);   // Overall volume
soundManager.setBGMVolume(0.5);      // Background music
soundManager.setSFXVolume(0.7);      // Sound effects

// Mute toggle
soundManager.toggleMute();  // Returns muted state (true/false)

// Get current settings
soundManager.getVolumeSettings();  // Returns { master, bgm, sfx, isMuted }
```

## Event System

The game uses an event listener system. Events are tracked through `EventTracker`:

```javascript
// Listen to events
eventTracker.on('jump', (data) => { /* handle jump */ });
eventTracker.on('walk', (data) => { /* handle walk, data.direction */ });
eventTracker.on('land', (data) => { /* handle landing */ });
eventTracker.on('death', (data) => { /* handle death */ });

// Stop listening
eventTracker.off('jump', callbackFunction);
```

## Scene Switching

To switch scenes during gameplay:
```javascript
window.switchScene(2);  // Switch to Scene 2 music
window.switchScene(1);  // Switch back to Scene 1 music
```

## Audio Format Support
- **MP3**: Wide browser support, use for dialogue and effects
- **OGG**: Good compression, use for long background music
- **FLAC**: High quality, use for detailed sound effects (newer browsers)

## Browser Compatibility
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Android Chrome)
- ⚠️ Some older browsers may need MP3/OGG formats

## For Developers

### Adding New Sounds

1. **Add file path** to SoundManager:
```javascript
this.soundPaths = {
    // ... existing sounds
    newSound: 'assets/sound/category/sound_file.mp3',
};
```

2. **Create playback method** (optional):
```javascript
playNewSound() {
    this.playSFX('newSound', true);  // true = allow overlapping
}
```

3. **Trigger from EventTracker** or directly:
```javascript
eventTracker.on('some_event', () => {
    soundManager.playNewSound();
});
```

### Sound Effect Parameters

When calling `playSFX(effectName, canOverlap)`:
- `effectName`: Key in soundPaths object
- `canOverlap`: 
  - `true` = Multiple instances can play at once (walking, ambient)
  - `false` = Only one instance plays at a time (fall, dialogue)

## Performance Notes
- Background music loops infinitely
- Sound effects create new Audio objects on demand
- Overlapping sounds are prevented for important effects
- Mute state affects all audio instantly

## Troubleshooting

**Sounds not playing?**
1. Check browser console for errors
2. Verify file paths in SoundManager
3. Check browser audio settings (not muted)
4. Ensure audio files exist in correct directories

**Audio lag/stuttering?**
1. Consider converting FLAC to MP3/OGG
2. Reduce number of simultaneous sounds
3. Check browser CPU usage

**Volume too loud/quiet?**
- Adjust in-game volume controls
- Or modify default volumes in SoundManager constructor:
```javascript
this.bgmVolume = 0.5;  // Background music (0.0-1.0)
this.sfxVolume = 0.7;  // Sound effects (0.0-1.0)
```

## Future Enhancements
- [ ] Add Settings UI for volume control
- [ ] Add sound preference saving to localStorage
- [ ] Add more NPC dialogue sounds
- [ ] Add environmental ambient sounds
- [ ] Add UI button feedback sounds
- [ ] Add combo/score sounds
