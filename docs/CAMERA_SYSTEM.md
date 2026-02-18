# Camera System Implementation

## Overview
A camera system has been implemented to support an expanded map of **1920 x 4320** pixels while maintaining a **1920 x 1080** viewport (what the player sees on screen).

## Architecture

### 1. **Camera.js** (`js/systems/Camera.js`)
The core camera system that manages the viewport and world-to-screen coordinate conversion.

#### Key Features:
- **World Dimensions**: 1920 x 4320
- **Viewport Dimensions**: 1920 x 1080
- **Smooth Following**: Camera follows the player with smooth interpolation (factor: 0.1)
- **Boundary Clamping**: Prevents camera from going outside map boundaries
- **Visibility Culling**: Can check if objects are visible before rendering

#### Main Methods:
```javascript
camera.update(player)                    // Updates camera to follow player
camera.worldToScreen(x, y)              // Converts world coords to screen coords
camera.screenToWorld(x, y)              // Converts screen coords to world coords
camera.isVisible(x, y, w, h)            // Check if object is visible on screen
camera.getBounds()                       // Get current camera bounds
```

### 2. **GameEngine.js** Updates
Modified to integrate the camera system:
- Initializes camera with map/viewport dimensions
- Updates camera every frame
- Clears viewport based on viewport size (1920 x 1080)
- Culls platforms (only draws visible ones for performance)

### 3. **Player.js** Updates
- `draw()` method now accepts a `camera` parameter
- Uses `camera.worldToScreen()` to convert player position before drawing
- All visual elements (body, eyes, jump charge) use camera-adjusted coordinates

### 4. **Platform.js** Updates
- `draw()` method now accepts a `camera` parameter
- Uses `camera.worldToScreen()` to convert platform position before drawing
- Maintains all platform visuals with camera offset

### 5. **Player Physics Updates**
- Map boundaries updated to 1920 x 4320:
  - Horizontal: 0 to 1920
  - Vertical: 0 to 4320
  - Death when falling below 4320

## How It Works

### Game Loop Flow:
```
1. Input → Player State → Physics Update
2. Player updated with new map dimensions (1920 x 4320)
3. Camera.update() - follows player, clamps to map bounds
4. Render Phase:
   - Clear viewport (1920 x 1080)
   - For each platform:
     - Check if visible using camera.isVisible()
     - If visible: convert to screen space and draw
   - Convert player position and draw
```

### Coordinate Systems:
- **World Space**: Full map (1920 x 4320)
- **Screen Space**: Viewport (1920 x 1080)
- **Conversion**: `screenPos = worldPos - cameraPos`

## Configuration

Map and viewport dimensions can be adjusted in `GameEngine.js`:
```javascript
this.mapWidth = 1920;      // Map width
this.mapHeight = 4320;     // Map height
this.viewportWidth = 1920; // Screen width
this.viewportHeight = 1080; // Screen height

this.camera = new Camera(this.mapWidth, this.mapHeight, 
                        this.viewportWidth, this.viewportHeight);
```

Camera smoothing can be adjusted:
```javascript
this.camera.smoothing = 0.1; // 0-1, higher = smoother but slower response
```

## Performance Optimizations

1. **Visibility Culling**: Only visible platforms are drawn
2. **Camera Bounds Checking**: `camera.isVisible()` prevents drawing off-screen objects
3. **Smooth Interpolation**: Avoids jittery camera movements

## Testing the Camera System

1. The camera will follow the player smoothly
2. Try jumping to platforms at different vertical positions
3. Verify the viewport stays within map bounds
4. Test falling below the map to trigger respawn

## Integration Notes

- No changes needed to HTML or external imports in `main.js`
- All physics calculations remain in world space
- Only drawing is converted to screen space
- The camera can be reset via `camera.reset(x, y)` if needed

## Future Enhancements

Possible improvements:
- Camera zoom levels
- Screen shake on events
- Parallax scrolling background
- Camera focus points (not just player center)
- Configurable camera lead distance
