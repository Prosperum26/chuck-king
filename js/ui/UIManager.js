/**
 * UIManager - Manages UI overlay (AI dialog, stats)
 */
export class UIManager {
  constructor() {
    this.aiDialog = document.getElementById("ai-dialog");
    this.aiMessage = document.getElementById("ai-message");
    this.deathCountDisplay = document.getElementById("death-count");
    this.idleTimeDisplay = document.getElementById("idle-time");
    this.fallCountDisplay = document.getElementById("fall-count");

    this.messageDisplayTime = 0;
    this.messageDuration = 3; // Show message for 3 seconds

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for AI messages
    window.addEventListener("aiMessage", (e) => {
      this.showAIMessage(e.detail.message);
    });
  }

  showAIMessage(message) {
    this.aiMessage.textContent = message;
    this.aiDialog.classList.remove("hidden");
    this.messageDisplayTime = this.messageDuration;
  }

  hideAIMessage() {
    this.aiDialog.classList.add("hidden");
  }

  update(dt) {
    // Update message display timer
    if (this.messageDisplayTime > 0) {
      this.messageDisplayTime -= dt;
      if (this.messageDisplayTime <= 0) {
        this.hideAIMessage();
      }
    }
  }

  updateStats(deathCount, idleTime, fallCount = 0) {
    this.deathCountDisplay.textContent = deathCount;
    this.idleTimeDisplay.textContent = idleTime.toFixed(1) + "s";
    if (this.fallCountDisplay) {
      this.fallCountDisplay.textContent = fallCount;
    }
  }
}
