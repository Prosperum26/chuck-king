/**
 * AIMessageGenerator - Generates AI taunt messages
 * Sử dụng AICallLogic để gọi API API (nếu có)
 */
import { AICallLogic } from './AICallLogic.js';

export class AIMessageGenerator {
    constructor() {
        // Hardcoded taunt messages
        this.hardcodedMessages = {
            death: [
                "Lại chết rồi à?",
                "Giỏi quá nhỉ!",
                "Lần thứ mấy rồi?",
                "Cố gắng lên nào!",
                "Dễ vậy mà không làm được?",
                "Thật là tệ...",
                "Lại rơi xuống à?",
                "Chán quá đi!",
            ],
            idle: [
                "Đang làm gì đấy?",
                "Ngủ rồi à?",
                "Chơi hay không chơi?",
                "Bỏ cuộc rồi à?",
                "Còn sống không?",
                "Động đậy đi chứ!",
            ],
            stuck: [
                "Kẹt ở đây rồi à?",
                "Lại chết ở chỗ này nữa?",
                "Học hỏi đi chứ!",
                "Làm sao mà chết hoài vậy?",
                "Thử cách khác đi!",
                "Ngu quá!",
            ]
        };
        
        this.currentMessage = null;
        this.apiEndpoint = null;
        this.apiKey = null;
        this.model = 'gpt-3.5-turbo';
        this.callInProgress = false;
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
     * Build prompt for AI based on trigger type
     */
    buildPrompt(triggerType, context) {
        const deathCountInZone = context.deathZones[context.lastDeathZone] || 0;
        
        const triggerDesc = {
            death: `Người chơi vừa chết lần thứ ${context.deathCount}.`,
            idle: `Người chơi đã không làm gì trong ${Math.floor(context.idleTime)} giây.`,
            stuck: `Người chơi đã chết ${deathCountInZone} lần ở khu vực "${context.lastDeathZone}" và vẫn không thể vượt qua.`
        };
        
        const basePrompt = `Bạn là một NPC mỉa mai vô cùng cay đắng và tệ bạo trong game platformer. ${triggerDesc[triggerType]} Hãy nói một câu ngắn (tối đa 15-20 từ) để trêu chọc và châm biếm người chơi một cách cơ cấu, đanh thép và vô duyên. Không giải thích, chỉ trả về câu nói ngắn gọn.`;
        
        return basePrompt;
    }
    
    /**
     * Dispatch message event to UI
     */
    dispatchMessage(message) {
        const event = new CustomEvent('aiMessage', {
            detail: { message }
        });
        window.dispatchEvent(event);
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

