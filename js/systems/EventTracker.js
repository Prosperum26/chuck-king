export class EventTracker {
  constructor() {
    this.deathCount = 0;
    this.lastTrackedDeathCount = 0;
    this.idleTime = 0;
    this.lastDeathPosition = null;
    this.lastDeathZone = null;
    this.deathZones = {};
    this.lastInputTime = Date.now();
    this.lastIdleTriggerTime = 0;
    this.idleTriggerCooldown = 8000;
    this.fallCount = 0;
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
    if (eventType === "death") {
      this.onDeath(data?.zone ?? "bottom");
    }
    if (eventType === "fall") {
      this.onFall();
    }
    if (eventType === "jump" || eventType === "bounce") {
      this.onPlayerInput();
    }
  }

  onDeath(zoneId) {
    this.deathCount++;
    this.lastDeathZone = zoneId;

    if (!this.deathZones[zoneId]) {
      this.deathZones[zoneId] = 0;
    }
    this.deathZones[zoneId]++;
  }

  onFall() {
    this.fallCount++;
  }

  getFallCount() {
    return this.fallCount;
  }

  hasJustDied() {
    return this.deathCount > this.lastTrackedDeathCount;
  }

  markDeathAsTriggered() {
    this.lastTrackedDeathCount = this.deathCount;
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
      deathZones: { ...this.deathZones },
      fallCount: this.fallCount,
    };
  }
}