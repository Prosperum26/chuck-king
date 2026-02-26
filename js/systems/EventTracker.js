/**
 * EventTracker - Tracks player behavior events
 * Triggers:
 * - DEATH: Người chơi chết (rơi xuống đáy)
 * - IDLE: Không nhấn phím > 12 giây
 * - STUCK: Chết ≥ 3 lần ở cùng một khu vực
 */
export class EventTracker {
    constructor() {
        this.deathCount = 0;
        this.lastTrackedDeathCount = 0; // Để detect "vừa chết"
        this.idleTime = 0;
        this.lastDeathPosition = null;
        this.lastDeathZone = null;
        this.deathZones = {}; // Track deaths per zone
        this.lastInputTime = Date.now();
        this.lastIdleTriggerTime = 0; // Prevent idle trigger spam
        this.idleTriggerCooldown = 8000; // 8 giây giữa idle triggers
    }
    
    update(dt, player) {
        // Update idle time
        const currentTime = Date.now();
        const timeSinceInput = (currentTime - this.lastInputTime) / 1000;
        this.idleTime = timeSinceInput;
    }
    
    onPlayerInput() {
        this.lastInputTime = Date.now();
        this.idleTime = 0;
    }

    /**
     * Generic track for Dev_Game Player: 'death' -> onDeath(zone), 'jump' -> onPlayerInput()
     */
    track(eventType, data) {
        if (eventType === 'death') {
            this.onDeath(data?.zone ?? 'bottom');
        }
        if (eventType === 'jump' || eventType === 'bounce') {
            this.onPlayerInput();
        }
    }
    
    onDeath(zoneId) {
        this.deathCount++;
        this.lastDeathZone = zoneId;
        
        // Track deaths per zone
        if (!this.deathZones[zoneId]) {
            this.deathZones[zoneId] = 0;
        }
        this.deathZones[zoneId]++;
    }
    
    /**
     * Kiểm tra xem vừa chết (chưa trigger AI chưa)
     */
    hasJustDied() {
        return this.deathCount > this.lastTrackedDeathCount;
    }
    
    /**
     * Mark death as triggered (cử chỉ đã trigger AI)
     */
    markDeathAsTriggered() {
        this.lastTrackedDeathCount = this.deathCount;
    }
    
    /**
     * Kiểm tra xem đã quá idle (> 12 giây)
     */
    isIdle() {
        return this.idleTime > 12;
    }
    
    /**
     * Kiểm tra xem có thể trigger idle message không (có cooldown)
     */
    canTriggerIdle() {
        const now = Date.now();
        if (now - this.lastIdleTriggerTime >= this.idleTriggerCooldown) {
            this.lastIdleTriggerTime = now;
            return true;
        }
        return false;
    }
    
    getDeathCountInZone(zoneId) {
        return this.deathZones[zoneId] || 0;
    }
    
    getIdleTime() {
        return this.idleTime;
    }
    
    getDeathCount() {
        return this.deathCount;
    }
    
    getLastDeathZone() {
        return this.lastDeathZone;
    }
    
    getContext() {
        return {
            deathCount: this.deathCount,
            idleTime: this.idleTime,
            lastDeathZone: this.lastDeathZone,
            deathZones: { ...this.deathZones }
        };
    }
}