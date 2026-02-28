/**
 * UIManager - Stats và overlay (NPC dialog do NPCDialogSystem quản lý)
 */
export class UIManager {
    constructor() {
        this.deathCountDisplay = document.getElementById('death-count');
        this.idleTimeDisplay = document.getElementById('idle-time');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Không còn aiMessage; trêu chọc hiển thị qua NPCDialogSystem (npcTaunt)
    }
    
    update(dt) {
        // Reserved for future UI timers
    }
    
    updateStats(deathCount, idleTime) {
        if (this.deathCountDisplay) this.deathCountDisplay.textContent = deathCount;
        if (this.idleTimeDisplay) this.idleTimeDisplay.textContent = idleTime.toFixed(1) + 's';
    }
}

