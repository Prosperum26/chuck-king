/**
 * AICallLogic - Các hàm để gọi AI API: generateStory, generateRage
 * Xử lý error: Invalid Key, Quota Exceeded, Timeout
 * ❌ Không lưu key
 * ❌ Không đụng UI
 */
export class AICallLogic {
    /**
     * Timeout dành cho mỗi API call (milliseconds)
     */
    static API_TIMEOUT = 15000; // 15 giây

    /**
     * Generate a story using AI API - output JSON với 4 phần cho 4 stage (mỗi phần 100-150 chữ, tổng 400-600 chữ).
     * @param {string} apiKey - OpenAI API key (sk-...)
     * @param {string} endpoint - API endpoint
     * @param {string} model - AI model name (default: gpt-3.5-turbo)
     * @returns {Promise<{success: boolean, message: string, storyParts?: string[], story?: string, error?: string}>}
     */
    static async generateStory(apiKey, endpoint, model = 'gpt-3.5-turbo') {
        const validation = this.validateInput(apiKey, endpoint);
        if (!validation.valid) {
            return { success: false, message: validation.error };
        }

        const prompt = `Bạn là nhà sáng tạo câu chuyện. Tạo một câu chuyện khích lệ cho game platformer, chia làm 4 phần tương ứng 4 stage (hiển thị lần lượt trong game).
Yêu cầu:
- Trả về ĐÚNG một JSON object với 4 key: "stage1", "stage2", "stage3", "stage4".
- Mỗi phần (stage1 đến stage4) từ 100 đến 150 chữ, viết bằng tiếng Việt.
- Tổng toàn bộ 4 phần từ 400 đến 600 chữ.
- Nội dung tích cực, gợi cảm hứng, khích lệ người chơi.
- Không thêm markdown, không giải thích, chỉ trả về JSON thuần. Ví dụ format:
{"stage1":"...","stage2":"...","stage3":"...","stage4":"..."}`;

        try {
            const result = await this.callOpenAIAPI(apiKey, endpoint, model, prompt, 700);
            if (!result.success) {
                return result;
            }
            const parsed = this.parseStoryJSON(result.content);
            if (parsed) {
                return {
                    success: true,
                    message: 'Thành công',
                    storyParts: parsed,
                    story: parsed.join('|||') // Dấu ngăn cách để code tách ra dễ dàng
                };
            }
            return {
                success: false,
                message: 'AI trả về không đúng format JSON (stage1, stage2, stage3, stage4)',
                error: 'INVALID_JSON'
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Parse JSON story response thành mảng [stage1, stage2, stage3, stage4]
     * @private
     */
    static parseStoryJSON(content) {
        if (!content || typeof content !== 'string') return null;
        const trimmed = content.trim().replace(/^```json\s*|\s*```$/g, '').trim();
        try {
            const obj = JSON.parse(trimmed);
            if (obj && typeof obj.stage1 === 'string' && typeof obj.stage2 === 'string' && typeof obj.stage3 === 'string' && typeof obj.stage4 === 'string') {
                return [obj.stage1.trim(), obj.stage2.trim(), obj.stage3.trim(), obj.stage4.trim()];
            }
        } catch (_) {}
        return null;
    }

    /**
     * Generate danh sách câu rage (10-20 câu) dựa trên stage và số lần chết.
     * @param {string} apiKey - OpenAI API key
     * @param {string} endpoint - API endpoint
     * @param {number} stage - Game stage number
     * @param {number} deathCount - Số lần người chơi đã rơi/chết
     * @param {string} model - AI model name
     * @returns {Promise<{success: boolean, message: string, rages?: string[], error?: string}>}
     */
    static async generateRage(apiKey, endpoint, stage, deathCount = 0, model = 'gpt-3.5-turbo') {
        const validation = this.validateInput(apiKey, endpoint);
        if (!validation.valid) {
            return { success: false, message: validation.error };
        }

        const stageDesc = stage >= 1 && stage <= 10 ? `Stage ${stage}` : `Stage ${stage} (khó)`;
        const prompt = `Bạn là NPC mỉa mai trong game platformer. Hiện tại: ${stageDesc}, người chơi đã chết/rơi ${deathCount} lần.
Trả về ĐÚNG một JSON array gồm 10 đến 20 câu trêu chọc/mỉa mai (độ dài mỗi câu khác nhau: có câu ngắn 5-8 từ, có câu dài 12-20 từ). Mỗi phần tử là một câu tiếng Việt. Châm biếm, cay cú về stage hoặc kỹ năng người chơi.
Chỉ trả về JSON array thuần, không markdown không giải thích. Ví dụ: ["Câu 1.","Câu 2 ngắn.","Câu 3 dài hơn một chút."]`;

        try {
            const result = await this.callOpenAIAPI(apiKey, endpoint, model, prompt, 600);
            if (!result.success) {
                return result;
            }
            const rages = this.parseRageJSON(result.content);
            if (rages && rages.length > 0) {
                return {
                    success: true,
                    message: 'Thành công',
                    rages
                };
            }
            return {
                success: false,
                message: 'AI trả về không đúng format JSON array',
                error: 'INVALID_JSON'
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Parse JSON array rage response
     * @private
     */
    static parseRageJSON(content) {
        if (!content || typeof content !== 'string') return null;
        const trimmed = content.trim().replace(/^```json\s*|\s*```$/g, '').trim();
        try {
            const arr = JSON.parse(trimmed);
            if (Array.isArray(arr)) {
                const list = arr.filter((item) => typeof item === 'string' && item.trim().length > 0).map((s) => s.trim());
                return list.length > 0 ? list : null;
            }
        } catch (_) {}
        return null;
    }

    /**
     * Call OpenAI API with error handling
     * @private
     */
    static async callOpenAIAPI(apiKey, endpoint, model, prompt, maxTokens) {
        const requestBody = {
            model: model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: maxTokens,
            temperature: 0.8
        };

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Handle HTTP responses
            if (!response.ok) {
                return this.handleHTTPError(response);
            }

            const data = await response.json();

            // Validate response format
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                return {
                    success: false,
                    message: 'Invalid API response format',
                    error: 'INVALID_RESPONSE'
                };
            }

            const content = data.choices[0].message.content?.trim();
            if (!content) {
                return {
                    success: false,
                    message: 'Empty response from AI',
                    error: 'EMPTY_RESPONSE'
                };
            }

            return {
                success: true,
                content: content
            };
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Handle HTTP error responses
     * @private
     */
    static handleHTTPError(response) {
        const status = response.status;

        // Handle specific error codes
        if (status === 401) {
            return {
                success: false,
                message: 'API key không hợp lệ hoặc hết hạn. Vui lòng kiểm tra và nhập lại.',
                error: 'INVALID_KEY'
            };
        }

        if (status === 403) {
            return {
                success: false,
                message: 'Không có quyền sử dụng API. Kiểm tra quyền tài khoản.',
                error: 'PERMISSION_DENIED'
            };
        }

        if (status === 429) {
            return {
                success: false,
                message: 'Đã vượt quá giới hạn request. Hết quota hoặc rate limit. Vui lòng thử lại sau.',
                error: 'QUOTA_EXCEEDED'
            };
        }

        if (status === 500 || status === 502 || status === 503) {
            return {
                success: false,
                message: 'Server API không phản hồi. Vui lòng thử lại sau.',
                error: 'SERVER_ERROR'
            };
        }

        return {
            success: false,
            message: `API error: HTTP ${status}`,
            error: `HTTP_${status}`
        };
    }

    /**
     * Handle generic errors (timeout, network, etc)
     * @private
     */
    static handleError(error) {
        console.error('[AICallLogic]', error);

        if (error.name === 'AbortError') {
            return {
                success: false,
                message: `API timeout (vượt quá ${this.API_TIMEOUT / 1000}s). Server không phản hồi kịp thời. Vui lòng thử lại.`,
                error: 'TIMEOUT'
            };
        }

        if (error instanceof TypeError) {
            // Network error or invalid URL
            return {
                success: false,
                message: 'API endpoint không hợp lệ hoặc lỗi kết nối mạng.',
                error: 'NETWORK_ERROR'
            };
        }

        return {
            success: false,
            message: `Lỗi: ${error.message || 'Unknown error'}`,
            error: 'UNKNOWN_ERROR'
        };
    }

    /**
     * Validate API key and endpoint format
     * @private
     */
    static validateInput(apiKey, endpoint) {
        if (!apiKey || !apiKey.trim()) {
            return {
                valid: false,
                error: 'API key không được để trống.'
            };
        }

        if (!endpoint || !endpoint.trim()) {
            return {
                valid: false,
                error: 'API endpoint không được để trống.'
            };
        }

        // Validate API key format
        const apiKeyTrimmed = apiKey.trim();
        if (!apiKeyTrimmed.startsWith('sk-')) {
            return {
                valid: false,
                error: 'API key phải bắt đầu với "sk-".'
            };
        }

        if (apiKeyTrimmed.length < 20) {
            return {
                valid: false,
                error: 'API key quá ngắn hoặc không hợp lệ.'
            };
        }

        // Validate endpoint format
        const endpointTrimmed = endpoint.trim();
        if (!endpointTrimmed.startsWith('https://')) {
            return {
                valid: false,
                error: 'API endpoint phải sử dụng HTTPS.'
            };
        }

        if (!endpointTrimmed.includes('openai.com') && !endpointTrimmed.includes('api')) {
            return {
                valid: false,
                error: 'API endpoint không hợp lệ.'
            };
        }

        return { valid: true };
    }

    /**
     * Test API credentials (without storing key)
     * @param {string} apiKey
     * @param {string} endpoint
     * @param {string} model
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async testAPI(apiKey, endpoint, model = 'gpt-3.5-turbo') {
        // Validate input
        const validation = this.validateInput(apiKey, endpoint);
        if (!validation.valid) {
            return { success: false, message: validation.error };
        }

        const testPrompt = 'Trả lời với một từ duy nhất: OK';

        try {
            const result = await this.callOpenAIAPI(apiKey, endpoint, model, testPrompt, 5);
            if (result.success) {
                return {
                    success: true,
                    message: 'API key hợp lệ!'
                };
            } else {
                return {
                    success: false,
                    message: result.message
                };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }
}
