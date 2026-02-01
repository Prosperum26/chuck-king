/**
 * EventTracker - Tracks player behavior events
 */
export class EventTracker {
    constructor() {
        this.deathCount = 0;
        this.idleTime = 0;
        this.lastDeathPosition = null;
        this.lastDeathZone = null;
        this.deathZones = {}; // Track deaths per zone
        this.lastInputTime = Date.now();
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
    
    onDeath(zoneId) {
        this.deathCount++;
        this.lastDeathZone = zoneId;
        
        // Track deaths per zone
        if (!this.deathZones[zoneId]) {
            this.deathZones[zoneId] = 0;
        }
        this.deathZones[zoneId]++;
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

