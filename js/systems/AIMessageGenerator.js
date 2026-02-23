/**
 * AIMessageGenerator - Generates AI taunt messages + NPC dialog (intro, stage, ending)
 * Trêu chọc: death/idle/stuck (API hoặc default)
 * Dialog: intro, stage1-4, ending (API hoặc default, output chia thành nhiều dòng)
 */
import {
    DEFAULT_TAUNT_MESSAGES,
    TAUNT_NPC_NAME,
    TAUNT_PROMPT_BASE,
    TAUNT_TRIGGER_DESCRIPTIONS,
    DEFAULT_DIALOGS,
    DIALOG_PROMPTS,
} from '../config/NPCDialogConfig.js';

/** Dialog type keys */
export const DIALOG_TYPES = ['intro', 'stage1', 'stage2', 'stage3', 'stage4', 'ending'];

export class AIMessageGenerator {
    constructor() {
        this.hardcodedMessages = DEFAULT_TAUNT_MESSAGES;
        this.defaultDialogs = DEFAULT_DIALOGS;

        this.currentMessage = null;
        this.apiEndpoint = null;
        this.apiKey = null;
        this.model = 'gpt-3.5-turbo';
        this.callInProgress = false;
        this.dialogCallInProgress = false;
    }
    
    /**
     * Generate AI message based on trigger type and context
     * @param {string} triggerType - 'death', 'idle', or 'stuck'
     * @param {object} context - Event tracker context
     */
    async generateMessage(triggerType, context) {
        try {
            // Try to call AI API first (nếu có API config)
            if (this.apiEndpoint && this.apiKey) {
                const message = await this.callAIAPI(triggerType, context);
                if (message) {
                    this.currentMessage = message;
                    this.dispatchMessage(message);
                    return;
                }
            }
        } catch (error) {
            console.warn('[AIMessageGenerator] AI API call failed, using hardcoded:', error.message);
        }
        
        // Fallback to hardcoded messages nếu không có API hoặc API fail
        const messages = this.hardcodedMessages[triggerType] || this.hardcodedMessages.death;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.currentMessage = randomMessage;
        console.log(`[AIMessageGenerator] 💬 ${triggerType}: "${randomMessage}"`);
        this.dispatchMessage(randomMessage);
    }
    
    /**
     * Call AI API to generate message using AICallLogic
     * @param {string} triggerType 
     * @param {object} context 
     * @returns {Promise<string|null>}
     */
    async callAIAPI(triggerType, context) {
        if (!this.apiEndpoint || !this.apiKey) {
            return null;
        }

        if (this.callInProgress) {
            console.warn('[AIMessageGenerator] AI call already in progress, skipping...');
            return null;
        }

        this.callInProgress = true;

        try {
            const prompt = this.buildPrompt(triggerType, context);
            
            // Tạo timeout controller
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                console.error('[AIMessageGenerator] ⏱️ API Timeout (15s)');
            }, 15000);

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 40,
                    temperature: 0.9
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                // Log error nhưng không throw - fallback về hardcoded
                const errorStatus = response.status;
                let errorMsg = '';
                
                if (errorStatus === 401) {
                    errorMsg = '❌ API Key sai hoặc hết hạn (401)';
                } else if (errorStatus === 403) {
                    errorMsg = '❌ Không có quyền sử dụng API (403)';
                } else if (errorStatus === 429) {
                    errorMsg = '⚠️ Hết quota/rate limit (429) - Thử lại sau';
                } else if (errorStatus >= 500) {
                    errorMsg = `❌ Server error (${errorStatus})`;
                } else {
                    errorMsg = `❌ API error ${errorStatus}`;
                }
                
                console.error(`[AIMessageGenerator] ${errorMsg}`);
                return null;
            }

            const data = await response.json();

            // Parse OpenAI response
            const message = data.choices?.[0]?.message?.content || null;

            if (message && message.split(' ').length <= 20) {
                console.log(`[AIMessageGenerator] 🤖 AI: "${message}"`);
                return message.trim();
            }

            return null;
        } catch (error) {
            // Handle timeout, network errors, etc
            if (error.name === 'AbortError') {
                console.error('[AIMessageGenerator] ⏱️ API Timeout');
            } else if (error instanceof TypeError) {
                console.error('[AIMessageGenerator] ❌ Network/URL error:', error.message);
            } else {
                console.error('[AIMessageGenerator] ❌ Error:', error.message);
            }
            return null;
        } finally {
            this.callInProgress = false;
        }
    }
    
    /**
     * Build prompt for AI based on trigger type (dùng config: TAUNT_PROMPT_BASE + TAUNT_TRIGGER_DESCRIPTIONS)
     */
    buildPrompt(triggerType, context) {
        const deathCountInZone = context.deathZones?.[context.lastDeathZone] || 0;
        const vars = {
            deathCount: context.deathCount,
            idleTime: Math.floor(context.idleTime),
            deathsInZone: deathCountInZone,
            lastDeathZone: context.lastDeathZone || 'bottom',
        };
        let triggerDesc = TAUNT_TRIGGER_DESCRIPTIONS[triggerType] || TAUNT_TRIGGER_DESCRIPTIONS.death;
        for (const [key, value] of Object.entries(vars)) {
            triggerDesc = triggerDesc.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }
        return TAUNT_PROMPT_BASE.replace('{{triggerDesc}}', triggerDesc);
    }
    
    /**
     * Dispatch taunt message → NPC dialog box (event 'npcTaunt' để NPCDialogSystem hiển thị)
     */
    dispatchMessage(message) {
        const event = new CustomEvent('npcTaunt', {
            detail: { message, npcName: TAUNT_NPC_NAME }
        });
        window.dispatchEvent(event);
    }

    /**
     * Lấy nội dung dialog (intro / stage1-4 / ending). Có API thì gọi API và chia dòng, không thì dùng default.
     * @param {string} dialogType - 'intro' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'ending'
     * @returns {Promise<{npcName: string, dialogs: string[]}>}
     */
    async getDialogContent(dialogType) {
        const defaultData = this.defaultDialogs[dialogType];
        if (!defaultData) {
            return { npcName: 'NPC', dialogs: ['...'] };
        }

        if (this.apiEndpoint && this.apiKey && !this.dialogCallInProgress) {
            try {
                const result = await this.callDialogAPI(dialogType);
                if (result && result.dialogs && result.dialogs.length > 0) {
                    return result;
                }
            } catch (e) {
                console.warn('[AIMessageGenerator] Dialog API failed, using default:', e.message);
            }
        }

        return {
            npcName: defaultData.npcName,
            dialogs: [...defaultData.dialogs]
        };
    }

    /**
     * Gọi API lấy dialog theo type, parse response thành nhiều dòng (chia bằng \n hoặc . )
     */
    async callDialogAPI(dialogType) {
        if (!this.apiEndpoint || !this.apiKey) return null;
        if (this.dialogCallInProgress) return null;

        this.dialogCallInProgress = true;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const prompt = this.buildDialogPrompt(dialogType);
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 300,
                    temperature: 0.8
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) return null;
            const data = await response.json();
            const raw = (data.choices?.[0]?.message?.content || '').trim();
            if (!raw) return null;

            // Chia output: ưu tiên xuống dòng, không thì chia theo câu (dấu chấm + space)
            let lines = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
            if (lines.length <= 1) {
                lines = raw.split(/\.\s+/).map(s => (s.trim() + (s.trim().endsWith('.') ? '' : '.')).trim()).filter(Boolean);
            }
            if (lines.length === 0) lines = [raw];

            const defaultData = this.defaultDialogs[dialogType] || { npcName: '👾 NPC' };
            return {
                npcName: defaultData.npcName,
                dialogs: lines
            };
        } catch (err) {
            if (err.name === 'AbortError') console.error('[AIMessageGenerator] Dialog API timeout');
            return null;
        } finally {
            this.dialogCallInProgress = false;
        }
    }

    /**
     * Tạo prompt cho từng loại dialog (intro, stage1-4, ending) từ config DIALOG_PROMPTS
     */
    buildDialogPrompt(dialogType) {
        return DIALOG_PROMPTS[dialogType] || DIALOG_PROMPTS.intro;
    }
    
    /**
     * Configure AI API endpoint
     */
    setAPIEndpoint(endpoint, apiKey = null, model = 'gpt-3.5-turbo') {
        this.apiEndpoint = endpoint;
        this.apiKey = apiKey;
        this.model = model;
    }
}

