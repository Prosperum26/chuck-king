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
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.player = player;
    this.platforms = platforms;
    this.eventTracker = eventTracker;
    this.aiRuleEngine = aiRuleEngine;
    this.uiManager = uiManager;
    this.npcDialogSystem = npcDialogSystem;

    // World / viewport
    this.mapWidth = 1920;
    this.mapHeight = 4320;
    this.viewportWidth = 1920;
    this.viewportHeight = 1080;

    this.camera = new Camera(this.mapWidth, this.mapHeight, this.viewportWidth, this.viewportHeight);

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

    // Camera follows player
    this.camera.update(this.player);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

    // Platforms (only visible)
    this.platforms.forEach((platform) => {
      if (this.camera.isVisible(platform.x, platform.y, platform.w, platform.h)) {
        platform.draw(this.ctx, this.camera);
      }
    });

    // Player
    this.player.draw(this.ctx, this.camera);
  }
}
