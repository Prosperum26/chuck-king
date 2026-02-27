export class GameEngine {
  constructor(
    canvas,
    ctx,
    player,
    platforms,
    eventTracker,
    aiRuleEngine,
    uiManager,
  ) {
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
      keys: {},
    };

    this.setupInput();
  }

  setupInput() {
    window.addEventListener("keydown", (e) => {
      this.input.keys[e.code] = true;
      if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
      this.eventTracker.onPlayerInput();
    });

    window.addEventListener("keyup", (e) => {
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
    this.uiManager.updateStats(
      this.eventTracker.getDeathCount(),
      this.eventTracker.getIdleTime(),
      this.eventTracker.getFallCount(),
    );

    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    // Update các sàn di chuyển
    this.platforms.forEach((platform) => platform.update(this.fixedDeltaTime, this.player));
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
    this.platforms.forEach((platform) => platform.draw(this.ctx));

    // Vẽ người chơi
    this.player.draw(this.ctx);
  }
}
