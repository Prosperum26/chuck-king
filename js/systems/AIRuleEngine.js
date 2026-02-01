/**
 * AIRuleEngine - Rule-based system to decide when AI should react
 */
export class AIRuleEngine {
    constructor(aiMessageGenerator, eventTracker) {
        this.aiMessageGenerator = aiMessageGenerator;
        this.eventTracker = eventTracker;
        this.cooldown = 0;
        this.cooldownDuration = 6; // 5-8 seconds
        this.muted = false;
    }
    
    update(dt) {
        if (this.cooldown > 0) {
            this.cooldown -= dt;
        }
    }
    
    checkTriggers() {
        if (this.muted) {
            return;
        }
        
        if (this.cooldown > 0) {
            return;
        }
        
        const context = this.eventTracker.getContext();
        let triggerType = null;
        
        // Priority order: stuck > death > idle
        // Trigger 3: Multiple deaths in same zone (highest priority)
        if (context.lastDeathZone) {
            const deathsInZone = this.eventTracker.getDeathCountInZone(context.lastDeathZone);
            if (deathsInZone >= 3) {
                triggerType = 'stuck';
            }
        }
        
        // Trigger 1: Death event (medium priority)
        if (!triggerType && context.deathCount > 0) {
            triggerType = 'death';
        }
        
        // Trigger 2: Idle > 10-15 seconds (lowest priority)
        if (!triggerType && context.idleTime > 12) {
            triggerType = 'idle';
        }
        
        if (triggerType) {
            this.triggerAI(triggerType, context);
        }
    }
    
    triggerAI(triggerType, context) {
        this.cooldown = this.cooldownDuration;
        this.aiMessageGenerator.generateMessage(triggerType, context);
    }
    
    toggleMute() {
        this.muted = !this.muted;
    }
    
    isMuted() {
        return this.muted;
    }
}

