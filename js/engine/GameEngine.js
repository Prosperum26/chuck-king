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
        });

        window.addEventListener("keyup", e => {
            this.input.keys[e.code] = false;
            // Xử lý nhảy khi thả phím Space (logic game mới)
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

        // Tránh hiện tượng "Spiral of Death" khi tab bị lag
        if (frameTime > 250) frameTime = 250; 

        this.accumulator += frameTime;

        // Cập nhật vật lý: Chạy đủ số lần cần thiết để đuổi kịp thời gian thực
        while (this.accumulator >= this.fixedDeltaTime) {
            this.update(); // Logic vật lý (60fps cố định)
            this.accumulator -= this.fixedDeltaTime;
        }

        // Vẽ: Chạy nhanh nhất có thể (165fps, 240fps...)
        this.draw(); 

        requestAnimationFrame(() => this.loop());
    }

    update() {
        // Update các sàn di chuyển
        this.platforms.forEach(platform => platform.update(this.player));

        // Update người chơi
        this.player.update(this.input, this.platforms, 1920, 1080);

        // Update AI (để hiển thị thông báo nếu có)
        this.aiRuleEngine.update(); 
    }

    draw() {
        // Xóa màn hình
        this.ctx.clearRect(0, 0, 1920, 1080);

        // Vẽ nền (tùy chọn)
        // this.ctx.fillStyle = "#222";
        // this.ctx.fillRect(0, 0, 1920, 1080);

        // Vẽ sàn
        this.platforms.forEach(platform => platform.draw(this.ctx));

        // Vẽ người chơi
        this.player.draw(this.ctx);
    }
}