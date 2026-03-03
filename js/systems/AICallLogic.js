/**
 * AICallLogic - Helper kiểm tra API (testAPI) + xử lý lỗi HTTP/timeout.
 * Toàn bộ prompt game chính (taunt, dialog) đã chuyển sang dùng trực tiếp trong AIMessageGenerator + NPCDialogConfig.
 * File này giờ chỉ còn nhiệm vụ: test API key / endpoint trước khi áp dụng vào game.
 */
import { callLLMText, detectProvider } from './LLMClient.js';
export class AICallLogic {
    /**
     * Timeout dành cho mỗi API call (milliseconds)
     */
    static API_TIMEOUT = 15000; // 15 giây

    /**
     * Call OpenAI-compatible / Gemini API với error handling chuẩn hóa cho test API.
     * @private
     */
    static async callOpenAIAPI(apiKey, endpoint, model, prompt, maxTokens) {
        const result = await callLLMText({
            endpoint,
            apiKey,
            model,
            prompt,
            maxTokens,
            temperature: 0.8,
            timeoutMs: this.API_TIMEOUT
        });

        if (result.success) {
            return { success: true, content: result.content };
        }

        // Giữ semantics cũ cho endpoint kiểu OpenAI: map HTTP code → message thân thiện
        const provider = result.provider || detectProvider(endpoint);
        if (provider === 'openai') {
            const match = String(result.message || '').match(/^HTTP\s+(\d{3})$/);
            if (match) {
                const fakeResponse = { status: Number(match[1]) };
                return this.handleHTTPError(fakeResponse);
            }
        }

        return {
            success: false,
            message: result.message || 'API error',
            error: provider === 'gemini' ? 'GEMINI_ERROR' : 'API_ERROR'
        };
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

        const apiKeyTrimmed = apiKey.trim();
        if (apiKeyTrimmed.length < 8) {
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
