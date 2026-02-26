/**
 * Camera System
 * Manages viewport for a large scrollable world
 */
export class Camera {
    constructor(mapWidth = 1920, mapHeight = 4320, viewportWidth = 1920, viewportHeight = 1080) {
        // Map dimensions
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        
        // Viewport dimensions (what player sees on screen)
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        
        // Camera position (top-left corner of viewport in world coordinates)
        this.x = 0;
        this.y = 0;
        
        // Smoothing factor for camera movement (0-1, higher = smoother)
        this.smoothing = 0.1;
    }

    /**
     * Update camera to follow the player
     * Centers camera on player with smooth transition
     */
    update(player) {
        // Calculate desired camera position (center on player)
        let targetX = player.x + player.w / 2 - this.viewportWidth / 2;
        let targetY = player.y + player.h / 2 - this.viewportHeight / 2;

        // Smooth camera movement
        this.x += (targetX - this.x) * this.smoothing;
        this.y += (targetY - this.y) * this.smoothing;

        // Clamp camera to map bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.viewportWidth > this.mapWidth) {
            this.x = this.mapWidth - this.viewportWidth;
        }

        if (this.y < 0) this.y = 0;
        if (this.y + this.viewportHeight > this.mapHeight) {
            this.y = this.mapHeight - this.viewportHeight;
        }
    }

    /**
     * Convert world coordinates to screen coordinates
     * @param {number} worldX - X position in world space
     * @param {number} worldY - Y position in world space
     * @returns {{screenX: number, screenY: number}}
     */
    worldToScreen(worldX, worldY) {
        return {
            screenX: worldX - this.x,
            screenY: worldY - this.y
        };
    }

    /**
     * Convert screen coordinates to world coordinates
     * @param {number} screenX - X position in screen space
     * @param {number} screenY - Y position in screen space
     * @returns {{worldX: number, worldY: number}}
     */
    screenToWorld(screenX, screenY) {
        return {
            worldX: screenX + this.x,
            worldY: screenY + this.y
        };
    }

    /**
     * Check if a world rect (like a platform) is visible on screen
     * @param {number} x - World X
     * @param {number} y - World Y
     * @param {number} w - Width
     * @param {number} h - Height
     * @returns {boolean}
     */
    isVisible(x, y, w, h) {
        return !(
            x + w < this.x ||
            x > this.x + this.viewportWidth ||
            y + h < this.y ||
            y > this.y + this.viewportHeight
        );
    }

    /**
     * Get camera bounds for debugging/optimization
     * @returns {{left: number, top: number, right: number, bottom: number}}
     */
    getBounds() {
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.viewportWidth,
            bottom: this.y + this.viewportHeight
        };
    }

    /**
     * Reset camera to a specific position
     */
    reset(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}
