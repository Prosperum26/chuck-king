/**
 * GameEngine - Main game loop and rendering
 */
export class GameEngine {
    constructor(canvas, ctx, player, platforms, eventTracker, aiRuleEngine, uiManager) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.player = player;
        this.platforms = platforms;
        this.eventTracker = eventTracker;
        this.aiRuleEngine = aiRuleEngine;
        this.uiManager = uiManager;
        
        this.running = false;
        this.lastTime = 0;
        this.cameraY = 0;
        
        // Input handling
        this.keys = {};
        this.setupInput();
    }
    
    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.eventTracker.onPlayerInput(); // Reset idle time
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.eventTracker.onPlayerInput(); // Reset idle time
        });
    }
    
    start() {
        this.running = true;
        this.gameLoop(0);
    }
    
    stop() {
        this.running = false;
    }
    
    gameLoop(currentTime) {
        if (!this.running) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Cap deltaTime to prevent large jumps
        const dt = Math.min(deltaTime / 1000, 0.1);
        
        this.update(dt);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(dt) {
        // Update event tracker first (to track idle time)
        this.eventTracker.update(dt, this.player);
        
        // Update player
        const jumpKey = this.keys[' '] || this.keys['arrowup'];
        const leftKey = this.keys['a'] || this.keys['arrowleft'];
        const rightKey = this.keys['d'] || this.keys['arrowright'];
        this.player.update(dt, jumpKey, leftKey, rightKey, this.platforms);
        
        // Check death condition (fall below bottom)
        if (this.player.y > this.canvas.height + 100) {
            this.handlePlayerDeath();
        }
        
        // Update AI rule engine (check triggers periodically)
        this.aiRuleEngine.update(dt);
        // Check triggers every frame (but cooldown prevents spam)
        this.aiRuleEngine.checkTriggers();
        
        // Update UI
        this.uiManager.update(dt);
        this.uiManager.updateStats(
            this.eventTracker.getDeathCount(),
            this.eventTracker.getIdleTime()
        );
    }
    
    handlePlayerDeath() {
        // Track death event
        const deathZone = this.getZoneId(this.player.x, this.player.y);
        this.eventTracker.onDeath(deathZone);
        
        // Respawn player
        this.player.respawn(200, 300);
        
        // Check AI triggers
        this.aiRuleEngine.checkTriggers();
    }
    
    getZoneId(x, y) {
        // Simple zone detection based on Y position
        if (y < 250) return 'top';
        if (y < 400) return 'mid';
        return 'bottom';
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#98D8E8');
        gradient.addColorStop(1, '#B0E0E6');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw platforms
        this.platforms.forEach(platform => platform.render(this.ctx));
        
        // Draw player
        this.player.render(this.ctx);
        
        // Draw charge indicator
        if (this.player.isCharging) {
            const chargePercent = this.player.chargePower / this.player.maxCharge;
            const barWidth = 100;
            const barHeight = 10;
            const barX = this.player.x - barWidth / 2;
            const barY = this.player.y - 30;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            this.ctx.fillStyle = chargePercent > 0.8 ? '#ff0000' : '#00ff00';
            this.ctx.fillRect(barX, barY, barWidth * chargePercent, barHeight);
        }
    }
}

