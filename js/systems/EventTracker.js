export class EventTracker {
  constructor() {
    this.idleTime = 0;
    this.lastInputTime = Date.now();
    this.lastIdleTriggerTime = 0;
    this.idleTriggerCooldown = 8000;
    this.fallCount = 0;
    this.lastTrackedFallCount = 0;
    this.lastFallZone = null;
    this.fallZones = {};
    
    // Event listener system for sound and other handlers
    this.listeners = {};
  }

  /**
   * Register event listener
   * @param {string} eventType - Type of event to listen for
   * @param {Function} callback - Callback function (receives event data)
   */
  on(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  /**
   * Unregister event listener
   */
  off(eventType, callback) {
    if (!this.listeners[eventType]) return;
    this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
  }

  /**
   * Emit event to all listeners
   */
  emit(eventType, data) {
    if (!this.listeners[eventType]) return;
    this.listeners[eventType].forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        console.error(`Error in event listener for '${eventType}':`, e);
      }
    });
  }

  update(dt, player) {
    const currentTime = Date.now();
    this.idleTime = (currentTime - this.lastInputTime) / 1000;
  }

  onPlayerInput() {
    this.lastInputTime = Date.now();
    this.idleTime = 0;
  }

  track(eventType, data) {
    if (eventType === "fall") {
      this.onFall(data?.zone ?? "bottom");
    }
    if (eventType === "jump" || eventType === "bounce") {
      this.onPlayerInput();
    }
    
    // Emit event to all listeners
    this.emit(eventType, data);
  }

  onFall(zoneId) {
    this.fallCount++;
    this.lastFallZone = zoneId;
    if (!this.fallZones[zoneId]) {
      this.fallZones[zoneId] = 0;
    }
    this.fallZones[zoneId]++;
  }

  getFallCount() {
    return this.fallCount;
  }

  hasJustFallen() {
    return this.fallCount > this.lastTrackedFallCount;
  }

  markFallAsTriggered() {
    this.lastTrackedFallCount = this.fallCount;
  }

  isIdle() {
    return this.idleTime > 12;
  }

  canTriggerIdle() {
    const now = Date.now();
    if (now - this.lastIdleTriggerTime >= this.idleTriggerCooldown) {
      this.lastIdleTriggerTime = now;
      return true;
    }
    return false;
  }

  getIdleTime() {
    return this.idleTime;
  }

  getFallCountInZone(zoneId) {
    return this.fallZones[zoneId] || 0;
  }

  getLastFallZone() {
    return this.lastFallZone;
  }

  getContext() {
    return {
      idleTime: this.idleTime,
      fallCount: this.fallCount,
      lastFallZone: this.lastFallZone,
      fallZones: { ...this.fallZones },
    };
  }
}