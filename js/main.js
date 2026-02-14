import { GameEngine } from './engine/GameEngine.js';
import { Player } from './entities/Player.js';
import { Platform } from './entities/Platform.js';
import { EventTracker } from './systems/EventTracker.js';
import { AIRuleEngine } from './systems/AIRuleEngine.js';
import { AIMessageGenerator } from './systems/AIMessageGenerator.js';
import { APIKeyManager } from './systems/APIKeyManager.js';
import { AICallLogic } from './systems/AICallLogic.js';
import { UIManager } from './ui/UIManager.js';

// ===== Initialize Modal Elements =====
const modal = document.getElementById('api-key-modal');
const gameContainer = document.getElementById('game-container');
const endpointInput = document.getElementById('api-endpoint');
const apiKeyInput = document.getElementById('api-key');
const testApiBtn = document.getElementById('test-api-btn');
const startGameBtn = document.getElementById('start-game-btn');
const skipApiBtn = document.getElementById('skip-api-btn');
const apiStatus = document.getElementById('api-status');
const toggleApiBtn = document.getElementById('toggle-api-btn');
const closeApiBtn = document.getElementById('close-api-btn');
const saveApiBtn = document.getElementById('save-api-btn');
const modalFooterStart = document.getElementById('modal-footer-start');
const modalFooterSettings = document.getElementById('modal-footer-settings');

// ===== Initialize Systems =====
const apiKeyManager = new APIKeyManager();
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Create game entities
const platforms = [
  new Platform(50, 500, 300, 20),
  new Platform(100, 350, 200, 20),
  new Platform(150, 200, 150, 20),
];

const player = new Player(200, 550);

// Create systems
const eventTracker = new EventTracker();
const aiMessageGenerator = new AIMessageGenerator();
const aiRuleEngine = new AIRuleEngine(aiMessageGenerator, eventTracker);
const uiManager = new UIManager();

// Create game engine (but not started yet)
const gameEngine = new GameEngine(canvas, ctx, player, platforms, eventTracker, aiRuleEngine, uiManager);

// ===== AI Call Logic Helper =====
// Expose AICallLogic methods globally để game code có thể gọi
const gameAI = {
    // Lưu trữ current API credentials (chỉ trong memory)
    apiKey: null,
    endpoint: null,
    model: 'gpt-3.5-turbo',

    /**
     * Set API credentials (nhận từ modal input)
     */
    setCredentials(apiKey, endpoint, model = 'gpt-3.5-turbo') {
        this.apiKey = apiKey?.trim() || null;
        this.endpoint = endpoint?.trim() || null;
        this.model = model;
        // ❌ KHÔNG lưu key vào storage
    },

    /**
     * Kiểm tra xem có API credentials hợp lệ không
     */    
    hasValidCredentials() {
        return this.apiKey && this.endpoint;
    },

    /**
     * Generate story từ AI
     */
    async generateStory() {
        if (!this.hasValidCredentials()) {
            return { success: false, message: 'Chưa cấu hình API' };
        }
        return await AICallLogic.generateStory(this.apiKey, this.endpoint, this.model);
    },

    /**
     * Generate rage message từ AI
     */
    async generateRage(stage, deathCount = 0) {
        if (!this.hasValidCredentials()) {
            return { success: false, message: 'Chưa cấu hình API' };
        }
        return await AICallLogic.generateRage(this.apiKey, this.endpoint, stage, deathCount, this.model);
    },

    /**
     * Test API credentials
     */
    async testAPI() {
        if (!this.apiKey || !this.endpoint) {
            return { success: false, message: 'Vui lòng nhập cả Endpoint và API Key' };
        }
        return await AICallLogic.testAPI(this.apiKey, this.endpoint, this.model);
    },

    /**
     * Clear credentials
     */
    clearCredentials() {
        this.apiKey = null;
        this.endpoint = null;
        // ❌ KHÔNG xoá storage
    }
};

// Expose globally cho debugging
window.gameAI = gameAI;

// ===== Load: không tự mở cửa sổ AI, chỉ mở khi bấm nút ⚙️ API =====
// Modal ẩn mặc định (class "hidden" trong HTML). Vào trang là chơi luôn.
// Gọi startGame khi DOM sẵn sàng + sau 1 frame (tránh màn hình đen khi Go Live).
function initGameWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(startGame));
    } else {
        requestAnimationFrame(startGame);
    }
}
initGameWhenReady();

/** Đang trong game hay chưa (để hiện footer Đóng/Lưu thay vì Bắt đầu/Bỏ qua) */
let gameStarted = true;

// ===== Modal Event Handlers =====

/**
 * Test API key
 */
testApiBtn.addEventListener('click', async () => {
    const endpoint = endpointInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    
    if (!endpoint || !apiKey) {
        showStatus('❌ Vui lòng nhập cả Endpoint và API Key', 'error');
        return;
    }
    
    // Validate endpoint format
    if (!endpoint.includes('https://')) {
        showStatus('❌ Endpoint phải start với https://', 'error');
        return;
    }
    
    showStatus('⏳ Đang kiểm tra API...', 'loading');
    testApiBtn.disabled = true;
    
    // Set credentials vào gameAI
    gameAI.setCredentials(apiKey, endpoint);
    
    // Test API
    const result = await gameAI.testAPI();
    
    testApiBtn.disabled = false;
    
    if (result.success) {
        showStatus('✅ API Key hợp lệ!', 'success');
        setTimeout(() => {
            startGame();
        }, 1500);
    } else {
        showStatus(`❌ ${result.message}`, 'error');
    }
});

/**
 * Start game - với hoặc không có API
 */
startGameBtn.addEventListener('click', async () => {
    const endpoint = endpointInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    
    if (endpoint && apiKey) {
        // Nếu có nhập thì test trước
        showStatus('⏳ Đang kiểm tra API...', 'loading');
        startGameBtn.disabled = true;
        
        // Set credentials vào gameAI
        gameAI.setCredentials(apiKey, endpoint);
        
        // Test API
        const result = await gameAI.testAPI();
        
        startGameBtn.disabled = false;
        
        if (result.success) {
            showStatus('✅ API Key hợp lệ!', 'success');
            setTimeout(() => {
                startGame();
            }, 1000);
        } else {
            showStatus(`❌ ${result.message}`, 'error');
        }
    } else {
        // Không có API config, chơi bình thường với hardcoded messages
        gameAI.clearCredentials();
        startGame();
    }
});

/**
 * Skip API configuration
 */
skipApiBtn.addEventListener('click', () => {
    gameAI.clearCredentials();
    startGame();
});

/**
 * Hiển thị status message
 */
function showStatus(message, type) {
    apiStatus.textContent = message;
    apiStatus.className = `api-status ${type}`;
}

/**
 * Start game
 */
function startGame() {
    gameStarted = true;
    modal.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    modalFooterStart.classList.add('hidden');
    modalFooterSettings.classList.remove('hidden');

    if (gameAI.hasValidCredentials()) {
        aiMessageGenerator.setAPIEndpoint(gameAI.endpoint, gameAI.apiKey, gameAI.model);
        console.log('✅ AI API configured for taunt messages');
    } else {
        console.log('ℹ️ Using hardcoded AI messages (no API configured)');
    }

    gameEngine.start();
}

/**
 * Bật/tắt cửa sổ cấu hình API
 */
function toggleApiModal() {
    const isHidden = modal.classList.toggle('hidden');
    if (!isHidden) {
        if (gameStarted) {
            modalFooterStart.classList.add('hidden');
            modalFooterSettings.classList.remove('hidden');
        } else {
            modalFooterStart.classList.remove('hidden');
            modalFooterSettings.classList.add('hidden');
        }
    }
}

toggleApiBtn.addEventListener('click', () => toggleApiModal());

closeApiBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

saveApiBtn.addEventListener('click', async () => {
    const endpoint = endpointInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    if (endpoint && apiKey) {
        showStatus('⏳ Đang kiểm tra API...', 'loading');
        saveApiBtn.disabled = true;
        gameAI.setCredentials(apiKey, endpoint);
        const result = await gameAI.testAPI();
        saveApiBtn.disabled = false;
        if (result.success) {
            showStatus('✅ Đã lưu và áp dụng API!', 'success');
            aiMessageGenerator.setAPIEndpoint(gameAI.endpoint, gameAI.apiKey, gameAI.model);
        } else {
            showStatus(`❌ ${result.message}`, 'error');
        }
    } else {
        gameAI.clearCredentials();
        showStatus('Đã xóa cấu hình API (chơi không API).', 'success');
    }
});

// ===== Game Event Handlers =====

// Handle mute button
document.getElementById("mute-ai-btn").addEventListener("click", () => {
  aiRuleEngine.toggleMute();
  const btn = document.getElementById("mute-ai-btn");
  if (aiRuleEngine.isMuted()) {
    btn.textContent = "🔊 Unmute AI";
    btn.classList.add("muted");
  } else {
    btn.textContent = "🔇 Mute AI";
    btn.classList.remove("muted");
  }
});


