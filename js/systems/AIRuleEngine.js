/**
 * AIRuleEngine - Rule-based system để decide khi nào AI nên react
 * 
 * Triggers (Priority order):
 * 1. STUCK (Cao nhất): Người chơi rơi ≥ 3 lần ở cùng một khu vực
 * 2. FALL (Trung): Người chơi vừa rơi khỏi map
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
        
        // Priority 1: STUCK - Rơi ≥ 3 lần ở cùng một khu vực (Cao nhất)
        if (context.lastFallZone) {
            const fallsInZone = this.eventTracker.getFallCountInZone(context.lastFallZone);
            if (fallsInZone >= 3 && this.lastStuckZone !== context.lastFallZone) {
                triggerType = 'stuck';
                this.lastStuckZone = context.lastFallZone;
                console.log(`🎯 STUCK trigger: Rơi ${fallsInZone} lần ở zone ${context.lastFallZone}`);
            }
        }
        
        // Priority 2: FALL - Người chơi vừa rơi (Trung)
        if (!triggerType && this.eventTracker.hasJustFallen()) {
            triggerType = 'fall';
            this.eventTracker.markFallAsTriggered();
            console.log(`🕳️ FALL trigger: Lần rơi thứ ${context.fallCount}`);
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

