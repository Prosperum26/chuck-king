/**
 * AIMessageGenerator - Generates AI taunt messages + NPC dialog (intro, stage, ending)
 * Trêu chọc: death/idle/stuck (API hoặc default)
 * Dialog: intro, stage1-4, ending (API hoặc default, output chia thành nhiều dòng)
 */
import { AICallLogic } from './AICallLogic.js';

/** Dialog type keys */
export const DIALOG_TYPES = ['intro', 'stage1', 'stage2', 'stage3', 'stage4', 'ending'];

export class AIMessageGenerator {
    constructor() {
        // Hardcoded taunt messages (trêu chọc)
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

        // Default NPC dialog (intro, 4 stage, ending) - dùng khi không có API
        this.defaultDialogs = {
            intro: {
                npcName: '👾 Game Master',
                dialogs: [
                    "Chào mừng tới Chuck King!",
                    "Công việc của bạn là thoát khỏi mê cung 8-bit này!",
                    "Xuyên qua các sàn, thẻ, và vượt qua những thách thức...",
                    "Bạn sẵn sàng chưa? Hãy bắt đầu!"
                ]
            },
            stage1: {
                npcName: '😊 NPC Hỗ Trợ',
                dialogs: [
                    "Tốt lắm! Bạn bắt đầu rất tốt!",
                    "Tiếp tục nhảy, tránh từng cái bẫy...",
                    "Mỗi bước là gần tới chiến thắng hơn!"
                ]
            },
            stage2: {
                npcName: '🤔 AI Thách Thức',
                dialogs: [
                    "Ồ, nó trở nên khó khăn rồi!",
                    "Các sàn đang di chuyển... Bạn có theo kịp không?",
                    "Tôi đoán bạn sẽ phải cố gắng hơn..."
                ]
            },
            stage3: {
                npcName: '😈 Ma Quỷ Thách Thức',
                dialogs: [
                    "Bây giờ đã vào cấp độ khó đấy!",
                    "Các sàn băng, sàn giả, mọi thứ sẽ rơi...",
                    "Hehe... bạn sẽ rơi bao nhiêu lần nhỉ?"
                ]
            },
            stage4: {
                npcName: '👑 Boss Cuối Cùng',
                dialogs: [
                    "CUỐI CÙNG... chúng ta gặp nhau!",
                    "Đây là sàn khó nhất của tất cả!",
                    "Nếu bạn vượt qua được cái này, bạn sẽ là CHUCK KING!"
                ]
            },
            ending: {
                npcName: '🎉 Bình Luận Viên',
                dialogs: [
                    "TUYỆT VỜI! Bạn đã làm được!",
                    "Bạn chính thức là CHUCK KING rồi!",
                    "Hãy chơi lại để chinh phục các cấp độ khác!"
                ]
            }
        };
        
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
     * Dispatch taunt message → NPC dialog box (event 'npcTaunt' để NPCDialogSystem hiển thị)
     */
    dispatchMessage(message) {
        const event = new CustomEvent('npcTaunt', {
            detail: { message, npcName: '😏 AI' }
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
     * Tạo prompt cho từng loại dialog (intro, stage1-4, ending)
     */
    buildDialogPrompt(dialogType) {
        const prompts = {
            intro: `Bạn là Game Master của game platformer Chuck King. Viết 3-4 câu ngắn chào mừng và hướng dẫn người chơi (tiếng Việt). Mỗi câu trên một dòng, không đánh số, không markdown.`,
            stage1: `Bạn là NPC hỗ trợ trong game platformer. Người chơi vừa vào stage 1 (dễ). Viết 2-3 câu khích lệ ngắn (tiếng Việt). Mỗi câu một dòng.`,
            stage2: `Bạn là NPC thách thức trong game platformer. Người chơi đang ở stage 2 (trung bình). Viết 2-3 câu thách thức ngắn (tiếng Việt). Mỗi câu một dòng.`,
            stage3: `Bạn là NPC ma quỷ trong game platformer. Người chơi đang ở stage 3 (khó). Viết 2-3 câu đe dọa/khó (tiếng Việt). Mỗi câu một dòng.`,
            stage4: `Bạn là Boss cuối cùng trong game platformer. Người chơi đang ở stage 4 (boss). Viết 2-3 câu hùng hồn (tiếng Việt). Mỗi câu một dòng.`,
            ending: `Bạn là bình luận viên game. Người chơi vừa chiến thắng Chuck King. Viết 2-3 câu chúc mừng (tiếng Việt). Mỗi câu một dòng.`
        };
        return prompts[dialogType] || prompts.intro;
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

