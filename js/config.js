/**
 * API Configuration
 * 
 * ĐIỀN THÔNG TIN API CỦA BẠN VÀO ĐÂY:
 * 
 * 1. Nếu dùng OpenAI:
 *    - endpoint: 'https://api.openai.com/v1/chat/completions'
 *    - apiKey: 'sk-...' (API key của bạn)
 * 
 * 2. Nếu dùng API khác, điều chỉnh endpoint và format request/response trong AIMessageGenerator.js
 * 
 * 3. Để test không cần API, để cả hai giá trị là null - game sẽ dùng hardcoded messages
 */
console.log("AI disabled, running offline mode");
export const API_CONFIG = {
    // API endpoint URL
    endpoint: null, // Ví dụ: 'https://api.openai.com/v1/chat/completions'
    
    // API key (nếu cần)
    apiKey: null, // Ví dụ: 'sk-...'
    
    // Model name (nếu dùng OpenAI)
    model: null // hoặc 'gpt-4'
};

