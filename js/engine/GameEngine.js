import { Camera } from "../systems/Camera.js";

export class GameEngine {
  constructor(
    canvas,
    ctx,
    player,
    platforms,
    eventTracker,
    aiRuleEngine,
    uiManager,
    npcDialogSystem = null,
    enemies = [],
    npcs = []
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.player = player;
    this.enemies = enemies;
    this.platforms = platforms;
    this.eventTracker = eventTracker;
    this.aiRuleEngine = aiRuleEngine;
    this.uiManager = uiManager;
    this.npcDialogSystem = npcDialogSystem;
    this.npcs = npcs;

    // World / viewport
    this.mapWidth = 1920;
    this.mapHeight = 4320;
    this.viewportWidth = 1920;
    this.viewportHeight = 1080;

    this.camera = new Camera(this.mapWidth, this.mapHeight, this.viewportWidth, this.viewportHeight);

    // Background element for parallax scrolling (will be lazy-loaded on first draw)
    this.backgroundElement = null;

    // Fixed timestep physics (60fps)
    this.fixedDeltaTime = 1000 / 60;
    this.accumulator = 0;
    this.lastTime = performance.now();
    this.running = false;

    // Input
    this.input = { keys: {} };
    this.setupInput();
  }

  setupInput() {
    window.addEventListener("keydown", (e) => {
      this.input.keys[e.code] = true;
      if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
      this.eventTracker?.onPlayerInput?.();
    });

    window.addEventListener("keyup", (e) => {
      this.input.keys[e.code] = false;
      this.eventTracker?.onPlayerInput?.();
      if (e.code === "Space") {
        this.player?.jump?.();
      }
    });
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  stop() {
    this.running = false;
  }

  loop(now) {
    if (!this.running) return;

    let frameTime = now - this.lastTime;
    this.lastTime = now;

    // Prevent huge jumps (tab switching)
    if (frameTime > 250) frameTime = 250;

    this.accumulator += frameTime;
    while (this.accumulator >= this.fixedDeltaTime) {
      this.updateFixed(this.fixedDeltaTime);
      this.accumulator -= this.fixedDeltaTime;
    }

    // AI & UI: once per frame (real dt)
    const dtSec = frameTime / 1000;
    if (this.eventTracker && typeof this.eventTracker.update === "function") {
      this.eventTracker.update(dtSec, this.player);
    }
    if (this.aiRuleEngine) {
      if (typeof this.aiRuleEngine.update === "function") {
        this.aiRuleEngine.update(dtSec);
      }
      if (typeof this.aiRuleEngine.checkTriggers === "function") {
        this.aiRuleEngine.checkTriggers();
      }
    }
    if (this.uiManager) {
      if (typeof this.uiManager.update === "function") {
        this.uiManager.update(dtSec);
      }
      if (
        typeof this.uiManager.updateStats === "function" &&
        this.eventTracker &&
        typeof this.eventTracker.getIdleTime === "function" &&
        typeof this.eventTracker.getFallCount === "function"
      ) {
        this.uiManager.updateStats(
          this.eventTracker.getIdleTime(),
          this.eventTracker.getFallCount(),
        );
      }
    }

    if (
      this.npcDialogSystem &&
      typeof this.npcDialogSystem.update === "function" &&
      this.eventTracker &&
      typeof this.eventTracker.getIdleTime === "function" &&
      typeof this.eventTracker.getFallCount === "function"
    ) {
      this.npcDialogSystem.update(dtSec, {
        idleTime: this.eventTracker.getIdleTime(),
        fallCount: this.eventTracker.getFallCount(),
        score: 0,
      });
    }

    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }

  updateFixed(dtMs) {
    // Platforms & player simulation in world coords
    this.platforms.forEach((platform) => platform.update(dtMs, this.player));
    this.player.update(this.input, this.platforms, this.mapWidth, this.mapHeight, dtMs);
    // 2. CẬP NHẬT GÀ CON VÀ XỬ LÝ VA CHẠM ĐẨY NGƯỜI CHƠI
    this.enemies.forEach((enemy) => {
      enemy.update(dtMs); // Chạy animation và di chuyển tuần tra

      // Kiểm tra va chạm giữa Player và Gà con
      if (this.player.checkCollision(enemy)) {
        // A. Nhảy lên đầu gà: Nảy lên (Boing!)
        if (this.player.vy > 0 && (this.player.y + this.player.h) < (enemy.y + enemy.h / 2 + 10)) {
          this.player.vy = -18; 
          this.player.y = enemy.y - this.player.h; // Tránh dính vào nhau
        } 
        // B. Va chạm ngang: Gà tông người hoặc người đâm gà -> Đẩy văng (Knockback)
        else {
          const pushDir = (this.player.x + this.player.w / 2 > enemy.x + enemy.w / 2) ? 1 : -1;
          this.player.vx = pushDir * 15; // Lực đẩy ngang cực mạnh
          this.player.vy = -8;           // Nảy nhẹ lên trời cho mất kiểm soát
          
          // Ghi lại sự kiện bị gà tông để AI có cớ "chửi"
          this.eventTracker?.track?.('enemy_hit'); 
        }
      }
    });
    // Camera follows player
    this.camera.update(this.player);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

    // Lazy-load background element on first draw
    if (!this.backgroundElement) {
      this.backgroundElement = document.getElementById("game-background");
      // Background is kept fixed; no parallax transform here
      if (this.backgroundElement) {
        this.backgroundElement.style.transform = "translateY(0px)";
      }
    }

    // Platforms (only visible)
    this.platforms.forEach((platform) => {
      if (this.camera.isVisible(platform.x, platform.y, platform.w, platform.h)) {
        platform.draw(this.ctx, this.camera);
      }
    });

    // VẼ GÀ CON (Chỉ vẽ nếu nằm trong Camera)
    this.enemies.forEach((enemy) => {
      if (this.camera.isVisible(enemy.x, enemy.y, enemy.w, enemy.h)) {
        enemy.draw(this.ctx, this.camera);
      }
    });

    // Player
    this.player.draw(this.ctx, this.camera);
  }
}
