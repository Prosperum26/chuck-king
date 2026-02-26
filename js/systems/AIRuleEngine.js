/**
 * AIRuleEngine - Rule-based system để decide khi nào AI nên react
 * 
 * Triggers (Priority order):
 * 1. STUCK (Cao nhất): Người chơi chết ≥ 3 lần ở cùng một khu vực
 * 2. DEATH (Trung): Người chơi vừa chết
 * 3. IDLE (Thấp nhất): Không nhấn phím > 12 giây
 */
export class AIRuleEngine {
    constructor(aiMessageGenerator, eventTracker) {
        this.aiMessageGenerator = aiMessageGenerator;
        this.eventTracker = eventTracker;
        this.cooldown = 0;
        this.cooldownDuration = 5; // 5 giây giữa các triggers
        this.muted = false;
        this.lastStuckZone = null; // Để avoid spam stuck trigger ở cùng zone
    }
    
    update(dt) {
        if (this.cooldown > 0) {
            this.cooldown -= dt;
        }
    }
    
    /**
     * Check triggers và trigger AI nếu cần
     * Gọi mỗi frame từ GameEngine.update()
     */
    checkTriggers() {
        if (this.muted) {
            return;
        }
        
        if (this.cooldown > 0) {
            return;
        }
        
        const context = this.eventTracker.getContext();
        let triggerType = null;
        
        // Priority 1: STUCK - Chết ≥ 3 lần ở cùng một khu vực (Cao nhất)
        if (context.lastDeathZone) {
            const deathsInZone = this.eventTracker.getDeathCountInZone(context.lastDeathZone);
            if (deathsInZone >= 3 && this.lastStuckZone !== context.lastDeathZone) {
                triggerType = 'stuck';
                this.lastStuckZone = context.lastDeathZone;
                console.log(`🎯 STUCK trigger: Chết ${deathsInZone} lần ở zone ${context.lastDeathZone}`);
            }
        }
        
        // Priority 2: DEATH - Người chơi vừa chết (Trung)
        if (!triggerType && this.eventTracker.hasJustDied()) {
            triggerType = 'death';
            this.eventTracker.markDeathAsTriggered();
            console.log(`💀 DEATH trigger: Lần chết thứ ${context.deathCount}`);
        }
        
        // Priority 3: IDLE - Không nhấn phím > 12 giây (Thấp)
        if (!triggerType && this.eventTracker.isIdle() && this.eventTracker.canTriggerIdle()) {
            triggerType = 'idle';
            console.log(`😴 IDLE trigger: Chưa input ${Math.floor(context.idleTime)} giây`);
        }
        
        if (triggerType) {
            this.triggerAI(triggerType, context);
        }
    }
    
    /**
     * Trigger AI message generation
     */
    triggerAI(triggerType, context) {
        this.cooldown = this.cooldownDuration;
        console.log(`[AIRuleEngine] Triggering ${triggerType} message...`);
        this.aiMessageGenerator.generateMessage(triggerType, context);
    }
    
    toggleMute() {
        this.muted = !this.muted;
    }
    
    isMuted() {
        return this.muted;
    }
}

