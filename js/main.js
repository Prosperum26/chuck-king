import { GameEngine } from './engine/GameEngine.js';
import { Player } from './entities/Player.js';
import { Platform } from './entities/Platform.js';
import { EventTracker } from './systems/EventTracker.js';
import { AIRuleEngine } from './systems/AIRuleEngine.js';
import { AIMessageGenerator } from './systems/AIMessageGenerator.js';
import { APIKeyManager } from './systems/APIKeyManager.js';
import { AICallLogic } from './systems/AICallLogic.js';
import { UIManager } from './ui/UIManager.js';

// ===== Initialize Modal Elements (AI/FE) =====
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

// ===== Setup Canvas (Dev_Game) =====
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

function setupCanvas() {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
}
setupCanvas();

window.addEventListener('resize', () => {
    console.log("Cửa sổ thay đổi, nhưng độ phân giải game vẫn là 1920x1080");
});

// ===== Initialize Systems =====
const apiKeyManager = new APIKeyManager();
const eventTracker = new EventTracker();
const aiMessageGenerator = new AIMessageGenerator();
const aiRuleEngine = new AIRuleEngine(aiMessageGenerator, eventTracker);
const uiManager = new UIManager();

// ===== Platforms (Dev_Game map: moving, broken, bouncy, ice, oneWay, fake) =====
// [SỬA]: Đưa platforms và player ra ngoài để truy cập toàn cục, nhưng KHÔNG khởi tạo giá trị ngay
let platforms = [];
let player = null;
let gameEngine = null;

async function loadMap() {
    try {
        const response = await fetch('./js/assets/map/mapdata.json'); 
        const mapData = await response.json();
        
        console.log("Dữ liệu từ Tiled:", mapData);

        // 1. Tìm đúng Layer có tên là 'CollisionLayer' (hoặc layer chứa các bục)
        const objectLayer = mapData.layers.find(layer => 
            layer.type === "objectgroup" && layer.name === "CollisionLayer"
        );

        if (!objectLayer || !objectLayer.objects) {
            console.warn("⚠️ Không tìm thấy CollisionLayer, đang tìm Object Layer bất kỳ...");
            // Backup: Nếu không tìm thấy tên chính xác, lấy layer object đầu tiên
            const backupLayer = mapData.layers.find(layer => layer.type === "objectgroup");
            if (!backupLayer) throw new Error("File JSON không có Object Layer nào!");
        }

        const targetLayer = objectLayer || mapData.layers.find(layer => layer.type === "objectgroup");

        // 2. Chuyển đổi dữ liệu
        platforms = targetLayer.objects.map(obj => {
            // Lấy loại bục (Tiled gọi là Class hoặc Type)
            let type = obj.class || obj.type || "normal"; 
            
            // Thông số mặc định
            let speed = 2;   
            let range = 200; 

            // 3. Lấy Custom Properties (Cho bục Moving hoặc Slope nếu cần tùy chỉnh)
            if (obj.properties) {
                const speedProp = obj.properties.find(p => p.name === "speed");
                const rangeProp = obj.properties.find(p => p.name === "range");
                
                if (speedProp) speed = speedProp.value;
                if (rangeProp) range = rangeProp.value;
            }

            // 4. Khởi tạo Platform
            // Lưu ý: Tiled dùng width/height, class Platform dùng w/h
            if (type === "moving") {
                return new Platform(obj.x, obj.y, obj.width, obj.height, type, range, speed);
            } 
            
            // Các loại bục khác bao gồm slopeLeft, slopeRight, ice, bouncy...
            return new Platform(obj.x, obj.y, obj.width, obj.height, type);
        });

        console.log(`✅ Đã nạp thành công ${platforms.length} bục từ CollisionLayer!`);
    } catch (e) {
        console.error("❌ Lỗi nạp Map:", e); 
        // Platform dự phòng cực to dưới chân để tránh rơi vô tận khi lỗi map
        platforms = [new Platform(-2000, 4300, 10000, 200, "normal")];
    }
}
// ===== AI Call Logic Helper (AI team) =====
const gameAI = {
    apiKey: null,
    endpoint: null,
    model: 'gpt-3.5-turbo',

    setCredentials(apiKey, endpoint, model = 'gpt-3.5-turbo') {
        this.apiKey = apiKey?.trim() || null;
        this.endpoint = endpoint?.trim() || null;
        this.model = model;
    },

    hasValidCredentials() {
        return this.apiKey && this.endpoint;
    },

    async generateStory() {
        if (!this.hasValidCredentials()) {
            return { success: false, message: 'Chưa cấu hình API' };
        }
        return await AICallLogic.generateStory(this.apiKey, this.endpoint, this.model);
    },

    async generateRage(stage, deathCount = 0) {
        if (!this.hasValidCredentials()) {
            return { success: false, message: 'Chưa cấu hình API' };
        }
        return await AICallLogic.generateRage(this.apiKey, this.endpoint, stage, deathCount, this.model);
    },

    async testAPI() {
        if (!this.apiKey || !this.endpoint) {
            return { success: false, message: 'Vui lòng nhập cả Endpoint và API Key' };
        }
        return await AICallLogic.testAPI(this.apiKey, this.endpoint, this.model);
    },

    clearCredentials() {
        this.apiKey = null;
        this.endpoint = null;
    }
};
window.gameAI = gameAI;

// ===== Load: start game when ready (modal ẩn, vào trang chơi luôn) =====
// [SỬA]: Hàm khởi tạo hệ thống
async function initGameSystems() {
    // 1. Chờ nạp Map xong
    await loadMap();

    // 2. Sau khi có platforms mới tạo Player và Engine
    player = new Player(1550, 4320 - 150, eventTracker);
    gameEngine = new GameEngine(canvas, ctx, player, platforms, eventTracker, aiRuleEngine, uiManager);

    // 3. Mở Modal cấu hình
    initGameWhenReady();
}

// Chạy khởi tạo
initGameSystems();

// [SỬA]: Không tự động chạy startGame ngay lập tức, hãy để người dùng bấm nút
function initGameWhenReady() {
    modal.classList.remove('hidden'); // Hiện modal API lúc đầu
}

let gameStarted = true;

// ===== Modal Event Handlers =====
testApiBtn.addEventListener('click', async () => {
    const endpoint = endpointInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    if (!endpoint || !apiKey) {
        showStatus('❌ Vui lòng nhập cả Endpoint và API Key', 'error');
        return;
    }
    if (!endpoint.includes('https://')) {
        showStatus('❌ Endpoint phải start với https://', 'error');
        return;
    }
    showStatus('⏳ Đang kiểm tra API...', 'loading');
    testApiBtn.disabled = true;
    gameAI.setCredentials(apiKey, endpoint);
    const result = await gameAI.testAPI();
    testApiBtn.disabled = false;
    if (result.success) {
        showStatus('✅ API Key hợp lệ!', 'success');
        setTimeout(() => startGame(), 1500);
    } else {
        showStatus(`❌ ${result.message}`, 'error');
    }
});

startGameBtn.addEventListener('click', async () => {
    const endpoint = endpointInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    if (endpoint && apiKey) {
        showStatus('⏳ Đang kiểm tra API...', 'loading');
        startGameBtn.disabled = true;
        gameAI.setCredentials(apiKey, endpoint);
        const result = await gameAI.testAPI();
        startGameBtn.disabled = false;
        if (result.success) {
            showStatus('✅ API Key hợp lệ!', 'success');
            setTimeout(() => startGame(), 1000);
        } else {
            showStatus(`❌ ${result.message}`, 'error');
        }
    } else {
        gameAI.clearCredentials();
        startGame();
    }
});

skipApiBtn.addEventListener('click', () => {
    gameAI.clearCredentials();
    startGame();
});

function showStatus(message, type) {
    apiStatus.textContent = message;
    apiStatus.className = `api-status ${type}`;
}

function startGame() {
    // SỬA: Thêm kiểm tra nếu gameEngine chưa sẵn sàng (do load map chậm hoặc lỗi) thì không start được, tránh lỗi
    if (!gameEngine) {
        alert("Game chưa sẵn sàng, vui lòng đợi giây lát!");
        return;
    }
    gameStarted = true;
    modal.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    modalFooterStart.classList.add('hidden');
    modalFooterSettings.classList.remove('hidden');
    // Đảm bảo Camera nhìn đúng chỗ khi bắt đầu
    gameEngine.camera.reset(player.x - 960, player.y - 540);

    if (gameAI.hasValidCredentials()) {
        aiMessageGenerator.setAPIEndpoint(gameAI.endpoint, gameAI.apiKey, gameAI.model);
        console.log('✅ AI API configured for taunt messages');
    } else {
        console.log('ℹ️ Using hardcoded AI messages (no API configured)');
    }

    gameEngine.start();
}

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
closeApiBtn.addEventListener('click', () => modal.classList.add('hidden'));

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
