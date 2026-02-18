import { Camera } from '../systems/Camera.js';

export class GameEngine {
    constructor(canvas, ctx, player, platforms, eventTracker, aiRuleEngine, uiManager) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.player = player;
        this.platforms = platforms;
        this.eventTracker = eventTracker;
        this.aiRuleEngine = aiRuleEngine;
        this.uiManager = uiManager;
        this.fixedDeltaTime = 1000 / 60; // Luôn tính vật lý ở 60 FPS
        this.accumulator = 0;
        this.lastTime = performance.now();
        
        // Map dimensions
        this.mapWidth = 1920;
        this.mapHeight = 4320;
        this.viewportWidth = 1920;
        this.viewportHeight = 1080;
        
        // Camera system
        this.camera = new Camera(this.mapWidth, this.mapHeight, this.viewportWidth, this.viewportHeight);
        
        // Quản lý Input
        this.input = {
            keys: {}
        };

        this.setupInput();
    }

    setupInput() {
        window.addEventListener("keydown", e => {
            this.input.keys[e.code] = true;
            if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
            this.eventTracker.onPlayerInput();
        });

        window.addEventListener("keyup", e => {
            this.input.keys[e.code] = false;
            this.eventTracker.onPlayerInput();
            if (e.code === "Space") {
                this.player.jump();
            }
        });
    }

    start() {
        this.then = performance.now();
        this.loop();
    }

    loop() {
        const now = performance.now();
        let frameTime = now - this.lastTime;
        this.lastTime = now;

        if (frameTime > 250) frameTime = 250;

        this.accumulator += frameTime;

        while (this.accumulator >= this.fixedDeltaTime) {
            this.update();
            this.accumulator -= this.fixedDeltaTime;
        }

        // AI & UI: once per frame with real time (eventTracker idle, aiRuleEngine cooldown, stats)
        const dtSec = frameTime / 1000;
        this.eventTracker.update(dtSec, this.player);
        this.aiRuleEngine.update(dtSec);
        this.aiRuleEngine.checkTriggers();
        this.uiManager.update(dtSec);
        this.uiManager.updateStats(this.eventTracker.getDeathCount(), this.eventTracker.getIdleTime());

        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    update() {
        // Update các sàn di chuyển
        this.platforms.forEach(platform => platform.update(this.player));

        // Update người chơi
        this.player.update(this.input, this.platforms, this.mapWidth, this.mapHeight);

        // Update camera to follow player
        this.camera.update(this.player);

        // Update AI (để hiển thị thông báo nếu có)
        this.aiRuleEngine.update(); 
    }

    draw() {
        // Xóa màn hình
        this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

        // Vẽ nền (tùy chọn)
        // this.ctx.fillStyle = "#222";
        // this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

        // Vẽ sàn (chỉ những sàn hiện ra trên màn hình)
        this.platforms.forEach(platform => {
            if (this.camera.isVisible(platform.x, platform.y, platform.w, platform.h)) {
                platform.draw(this.ctx, this.camera);
            }
        });

        // Vẽ người chơi
        this.player.draw(this.ctx, this.camera);
    }
}