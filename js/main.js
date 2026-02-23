import { GameEngine } from './engine/GameEngine.js';
import { Player } from './entities/Player.js';
import { Platform } from './entities/Platform.js';
import { EventTracker } from './systems/EventTracker.js';
import { AIRuleEngine } from './systems/AIRuleEngine.js';
import { AIMessageGenerator } from './systems/AIMessageGenerator.js';
import { APIKeyManager } from './systems/APIKeyManager.js';
import { AICallLogic } from './systems/AICallLogic.js';
import { UIManager } from './ui/UIManager.js';
import { NPCDialogSystem } from './systems/NPCDialogSystem.js';

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
const npcDialogSystem = new NPCDialogSystem(aiMessageGenerator);

// ===== Platforms (Dev_Game map: moving, broken, bouncy, ice, oneWay, fake) =====
const platforms = [
    new Platform(-2000, 1000, 6000, 200, "normal"),
    new Platform(150, 800, 160, 40, "normal"),
    new Platform(800, 800, 140, 30, "normal"),
    new Platform(500, 640, 140, 30, "broken"),
    new Platform(1150, 620, 120, 30, "normal"),
    new Platform(500, 400, 120, 30, "moving", 300, 2),
    new Platform(1100, 280, 120, 40, "bouncy"),
    new Platform(500, 160, 140, 100, "fake"),
    new Platform(800, 520, 180, 50, "fake"),
    new Platform(1400, 740, 140, 30, "broken"),
    new Platform(1450, 440, 130, 30, "ice"),
    new Platform(1580, 440, 140, 30, "fake"),
    new Platform(1670, 240, 140, 30, "broken"),
    new Platform(1350, 180, 100, 30, "fake"),
    new Platform(1420, 180, 80, 30, "normal"),
    new Platform(1100, 80, 220, 40, "oneWay"),
];

const player = new Player(50, canvas.height - 150, eventTracker);
const gameEngine = new GameEngine(canvas, ctx, player, platforms, eventTracker, aiRuleEngine, uiManager, npcDialogSystem);

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
function initGameWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(startGame));
    } else {
        requestAnimationFrame(startGame);
    }
}
initGameWhenReady();

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

    // NPC dialog: intro (API hoặc default)
    setTimeout(() => {
        npcDialogSystem.showDialog('intro');
    }, 600);
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
};

// Demo: nút test dialog (intro, stage1-4, ending)
document.querySelectorAll('.demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-dialog');
        if (key && npcDialogSystem) npcDialogSystem.showDialog(key);
    });
});