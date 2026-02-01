/**
 * AIMessageGenerator - Generates AI taunt messages (hardcoded + API stub)
 */
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
        this.apiEndpoint = null; // Set this to your AI API endpoint
        this.apiKey = null; // Set this if needed
        this.model = 'gpt-3.5-turbo'; // Default model
    }
    
    /**
     * Generate AI message based on trigger type and context
     * @param {string} triggerType - 'death', 'idle', or 'stuck'
     * @param {object} context - Event tracker context
     */
    async generateMessage(triggerType, context) {
        try {
            // Try to call AI API first
            if (this.apiEndpoint) {
                const message = await this.callAIAPI(triggerType, context);
                if (message) {
                    this.currentMessage = message;
                    this.dispatchMessage(message);
                    return;
                }
            }
        } catch (error) {
            console.warn('AI API call failed, using fallback:', error);
        }
        
        // Fallback to hardcoded messages
        const messages = this.hardcodedMessages[triggerType] || this.hardcodedMessages.death;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.currentMessage = randomMessage;
        this.dispatchMessage(randomMessage);
    }
    
    /**
     * Call AI API to generate message
     * @param {string} triggerType 
     * @param {object} context 
     * @returns {Promise<string|null>}
     */
    async callAIAPI(triggerType, context) {
        if (!this.apiEndpoint) {
            return null;
        }
        
        const prompt = this.buildPrompt(triggerType, context);
        
        try {
            // Check if this is OpenAI API format
            const isOpenAI = this.apiEndpoint.includes('openai.com');
            
            let requestBody;
            if (isOpenAI) {
                // OpenAI format
                requestBody = {
                    model: this.model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 30,
                    temperature: 0.9
                };
            } else {
                // Generic API format
                requestBody = {
                    prompt: prompt,
                    max_tokens: 20,
                    temperature: 0.9
                };
            }
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            
            // Parse response based on API type
            let message = null;
            if (isOpenAI) {
                // OpenAI format: data.choices[0].message.content
                message = data.choices?.[0]?.message?.content || null;
            } else {
                // Generic format: try multiple possible fields
                message = data.message || data.text || data.choices?.[0]?.text || null;
            }
            
            if (message && message.split(' ').length <= 15) {
                return message.trim();
            }
            
            return null;
        } catch (error) {
            console.error('AI API error:', error);
            return null;
        }
    }
    
    /**
     * Build prompt for AI
     */
    buildPrompt(triggerType, context) {
        const triggerDesc = {
            death: `Người chơi vừa chết lần thứ ${context.deathCount}.`,
            idle: `Người chơi đã không làm gì trong ${Math.floor(context.idleTime)} giây.`,
            stuck: `Người chơi đã chết ${context.deathZones[context.lastDeathZone]} lần ở khu vực ${context.lastDeathZone}.`
        };
        
        return `Bạn là một NPC mỉa mai và cay đắng trong game platformer. ${triggerDesc[triggerType]} Hãy nói một câu ngắn (tối đa 15 từ) để trêu chọc người chơi. Có thể mỉa mai sâu cay và châm biếm. Chỉ trả về câu nói, không giải thích.`;
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

