/**
 * UIManager - Stats HUD (NPC dialog do NPCDialogSystem quản lý)
 */
export class UIManager {
  constructor() {
    this.idleTimeDisplay = document.getElementById("idle-time");
    this.fallCountDisplay = document.getElementById("fall-count");
  }

  update(dt) {
    // reserved for future UI effects
  }

  updateStats(idleTime, fallCount = 0) {
    this.idleTimeDisplay.textContent = idleTime.toFixed(1) + "s";
    if (this.fallCountDisplay) {
      this.fallCountDisplay.textContent = fallCount;
    }
  }
}
