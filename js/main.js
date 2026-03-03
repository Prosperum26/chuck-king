// ===== Global Error Handler =====
window.addEventListener('error', (event) => {
    console.error('❌ Error:', event.message);
});

import { GameEngine } from './engine/GameEngine.js';
import { Player } from './entities/Player.js';
import { Platform } from './entities/Platform.js';
import { HanChicken } from './entities/HanChicken.js';
import { EventTracker } from './systems/EventTracker.js';
import { AIRuleEngine } from './systems/AIRuleEngine.js';
import { AIMessageGenerator } from './systems/AIMessageGenerator.js';
import { APIKeyManager } from './systems/APIKeyManager.js';
import { UIManager } from './ui/UIManager.js';
import { NPCDialogSystem } from './systems/NPCDialogSystem.js';
import { SoundManager } from './systems/SoundManager.js';
import { Enemy } from './entities/Enemy.js';

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
    // Game resolution stays 1920x1080
});

// ===== Initialize Systems =====
const eventTracker = new EventTracker();
const aiMessageGenerator = new AIMessageGenerator();
const aiRuleEngine = new AIRuleEngine(aiMessageGenerator, eventTracker);
const uiManager = new UIManager();
const npcDialogSystem = new NPCDialogSystem(aiMessageGenerator);
const soundManager = new SoundManager();

// ===== Platforms (Dev_Game map: moving, broken, bouncy, ice, oneWay, fake) =====
// Set up assets
export const platformAssets = {
};


// [SỬA]: Đưa platforms và player ra ngoài để truy cập toàn cục, nhưng KHÔNG khởi tạo giá trị ngay
let platforms = [];
let enemies = [];
let npcs = [];
let player = null;
let gameEngine = null;

async function loadMap() {
    // PHẢI đảm bảo enemies là mảng rỗng ngay từ đầu để tránh lỗi undefined
    platforms = [];
    enemies = [];
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
        const enemyLayer = mapData.layers.find(layer => 
            layer.type === "objectgroup" && layer.name === "EnemyLayer"
        );

        if (enemyLayer && enemyLayer.objects) {
            enemies = enemyLayer.objects.map(obj => {
                let range = 200; 
                if (obj.properties) {
                    const p = obj.properties.find(prop => prop.name === "range");
                    if (p) range = p.value;
                }
                // Sử dụng obj.width/height từ Tiled thay vì fix cứng 40/40 để linh hoạt hơn
                return new Enemy(obj.x, obj.y, obj.width || 40, obj.height || 40, range);
            });
        }
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
        // Hiện tại không còn dùng story riêng lẻ nữa (nội dung chính đã trong DIALOG_PROMPT),
        // nên hàm này được giữ lại chỉ để tránh lỗi nếu có code legacy gọi tới.
        return { success: false, message: 'generateStory() hiện không còn được hỗ trợ.' };
    },

    async generateRage(stage, fallCount = 0) {
        if (!this.hasValidCredentials()) {
            return { success: false, message: 'Chưa cấu hình API' };
        }
        // Taunt đã chuyển sang TAUNT_BATCH_PROMPT trong AIMessageGenerator.
        return { success: false, message: 'generateRage() hiện không còn được hỗ trợ.' };
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

    // 2. Khởi tạo NPCs 
    const tileSize = 32;
    npcs = [];
    npcs.push(new HanChicken(1600, 730)); // Vị trí tương đối trên map, sẽ được camera theo dõi

    // 3. Sau khi có platforms mới tạo Player và Engine (kèm NPCDialogSystem để chạy typing + auto-close)
    player = new Player(1550, 4320-150, eventTracker);
    gameEngine = new GameEngine(
        canvas,
        ctx,
        player,
        platforms,
        eventTracker,
        aiRuleEngine,
        uiManager,
        npcDialogSystem,
        enemies,
        npcs
    );

    // 4. Mở Modal cấu hình
    initGameWhenReady();
}

// Chạy khởi tạo
initGameSystems();

// [SỬA]: Không tự động chạy startGame ngay lập tức, hãy để người dùng bấm nút
function initGameWhenReady() {
    // Hiện modal API lúc đầu để người dùng nhập API, không tự động startGame
    modal.classList.remove('hidden'); 
}

let gameStarted = false;

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

async function startGame() {
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
        console.log('✅ AI API configured');
    } else {
        console.log('ℹ️ Using hardcoded AI messages (no API configured)');
    }

    soundManager.playBackgroundMusic(currentScene);
    gameEngine.start();

    // Prefetch: dialogs (1 lần toàn game) + taunts (1 lần mỗi stage)
    await aiMessageGenerator.prefetchAllDialogs();
    aiMessageGenerator.prefetchStageTaunts('stage1', { fallCount: 0 });

    // NPC dialog: intro (AI cache hoặc default)
    setTimeout(() => npcDialogSystem.showDialog('intro'), 600);
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
// ===== NPC Dialog Trigger Helpers =====
window.triggerNPCDialog = function(dialogKey) {
    if (npcDialogSystem) npcDialogSystem.showDialog(dialogKey);
};
window.changeStage = function(stageName) {
    if (npcDialogSystem) npcDialogSystem.onStageChange(stageName);
    const map = { easy: 'stage1', medium: 'stage2', hard: 'stage3', boss: 'stage4' };
    const key = map[stageName] || (['stage1', 'stage2', 'stage3', 'stage4'].includes(stageName) ? stageName : null);
    if (key) aiMessageGenerator.prefetchStageTaunts(key, { fallCount: eventTracker.getFallCount() });
};

// ===== Sound Manager Event Listeners =====
// Track player's current scene for walking sounds
let currentScene = 1;

// Listen for game events and play appropriate sounds
eventTracker.on('jump', () => {
    soundManager.playJump();
});

// Fall (bao gồm deep fall) → SoundManager đã map tới DEEP_fall.mp3
eventTracker.on('fall', () => {
    soundManager.playFall();
});

eventTracker.on('walk', (data) => {
    soundManager.playWalkSound(currentScene, data.direction);
});

eventTracker.on('bounce', () => {
    soundManager.playJump();
});

eventTracker.on('conversation', () => {
    soundManager.playConversation();
});

// Switch between scenes during gameplay
window.switchScene = function(sceneNumber) {
    currentScene = sceneNumber;
    soundManager.playBackgroundMusic(sceneNumber);
};
