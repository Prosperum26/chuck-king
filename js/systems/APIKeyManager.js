/**
 * APIKeyManager - Quản lý API key trong bộ nhớ (❌ KHÔNG lưu key)
 * API key chỉ được giữ trong memory trong session hiện tại
 */
export class APIKeyManager {
    constructor() {
        this.endpoint = null;
        this.apiKey = null;
        this.model = 'gpt-3.5-turbo';
        this.isValid = false;
        this.testInProgress = false;
        // ❌ KHÔNG lưu key vào localStorage/sessionStorage - quan trọng
    }
    
    /**
     * Validate format API key
     * @returns {Promise<{valid: boolean, message: string}>}
     */
    validateKeyFormat() {
        if (!this.apiKey) {
            return { valid: false, message: 'API key trống' };
        }
        if (this.apiKey.length < 8) {
            return { valid: false, message: 'API key quá ngắn' };
        }
        return { valid: true, message: 'Format hợp lệ' };
    }
    
    /**
     * Kiểm tra API key bằng cách gửi request test
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async testAPIKey() {
        if (this.testInProgress) {
            console.warn('Test đang chạy, vui lòng chờ...');
            return { success: false, message: 'Test đang chạy' };
        }
        
        if (!this.endpoint || !this.apiKey) {
            return { success: false, message: 'Missing endpoint hoặc API key' };
        }
        
        // Validate format trước
        const formatCheck = this.validateKeyFormat();
        if (!formatCheck.valid) {
            return { success: false, message: formatCheck.message };
        }
        
        this.testInProgress = true;
        
        try {
            // Tạo prompt test ngắn
            const testPrompt = 'Trả lời ngắn (1 từ): Bạn là AI?';
            
            const requestBody = {
                model: this.model,
                messages: [
                    {
                        role: 'user',
                        content: testPrompt
                    }
                ],
                max_tokens: 5,
                temperature: 0.7
            };
            
            console.log('🔄 Testing API key...');
            console.log('Endpoint:', this.endpoint);
            console.log('Model:', this.model);
            
            // Tạo timeout controller
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                // Kiểm xem có response hợp lệ không
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    this.isValid = true;
                    // ❌ KHÔNG lưu key vào storage - chỉ giữ trong memory
                    console.log('✅ API key hợp lệ!');
                    return { success: true, message: 'API key hợp lệ' };
                }
            } else {
                const errorText = await response.text();
                const errorMsg = `HTTP ${response.status}: ${errorText}`;
                console.error('❌ API test failed:', errorMsg);
                
                let message = 'API key không hợp lệ';
                if (response.status === 401) {
                    message = 'Unauthorized - API key sai hoặc hết hạn';
                } else if (response.status === 403) {
                    message = 'Forbidden - Không có quyền';
                } else if (response.status === 429) {
                    message = 'Rate limit exceeded - Thử lại sau';
                }
                
                return { success: false, message, details: errorText };
            }
            
            this.isValid = false;
            return { success: false, message: 'Invalid API response' };
        } catch (error) {
            let message = 'Lỗi khi test API';
            if (error.name === 'AbortError') {
                message = 'Timeout - API không phản hồi';
            } else if (error instanceof TypeError) {
                message = 'Endpoint URL không hợp lệ';
            }
            console.error('❌ API test error:', error);
            return { success: false, message, details: error.message };
        } finally {
            this.isValid = false;
            this.testInProgress = false;
        }
    }
    
    /**
     * Set endpoint và API key
     */
    setConfig(endpoint, apiKey, model = 'gpt-3.5-turbo') {
        this.endpoint = endpoint?.trim();
        this.apiKey = apiKey?.trim();
        this.model = model;
    }
    
    /**
     * Lấy config
     */
    getConfig() {
        return {
            endpoint: this.endpoint,
            apiKey: this.apiKey,
            model: this.model,
            isValid: this.isValid
        };
    }
    
    /**
     * Clear tất cả config
     */
    clear() {
        this.endpoint = null;
        this.apiKey = null;
        this.isValid = false;
        // ❌ Không xoá sessionStorage (vì không lưu gì cả)
    }
    
    /**
     * Kiểm tra đã có API key hợp lệ chưa
     */
    hasValidKey() {
        return this.isValid && this.endpoint && this.apiKey;
    }
}
