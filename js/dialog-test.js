import { AIMessageGenerator } from './systems/AIMessageGenerator.js';
import { NPCDialogSystem } from './systems/NPCDialogSystem.js';
import { AICallLogic } from './systems/AICallLogic.js';

// Modal elements
const modal = document.getElementById('api-key-modal');
const endpointInput = document.getElementById('api-endpoint');
const apiKeyInput = document.getElementById('api-key');
const testApiBtn = document.getElementById('test-api-btn');
const apiStatus = document.getElementById('api-status');
const toggleApiBtn = document.getElementById('toggle-api-btn');
const closeApiBtn = document.getElementById('close-api-btn');
const saveApiBtn = document.getElementById('save-api-btn');

// Dialog test elements
const apiModeLabel = document.getElementById('api-mode-label');
const dialogKeySelect = document.getElementById('dialog-key-select');
const showDialogBtn = document.getElementById('show-dialog-btn');
const showTauntBtn = document.getElementById('show-taunt-btn');

// Core systems
const aiMessageGenerator = new AIMessageGenerator();
const npcDialogSystem = new NPCDialogSystem(aiMessageGenerator);

function showStatus(message, type) {
    apiStatus.textContent = message;
    apiStatus.className = `api-status ${type}`;
    apiStatus.classList.remove('hidden');
}

function updateModeLabel() {
    if (aiMessageGenerator.apiEndpoint && aiMessageGenerator.apiKey) {
        apiModeLabel.textContent = 'Mode: AI API';
    } else {
        apiModeLabel.textContent = 'Mode: Hardcoded default';
    }
}

updateModeLabel();

// API modal handlers
toggleApiBtn.addEventListener('click', () => {
    modal.classList.toggle('hidden');
});

closeApiBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

testApiBtn.addEventListener('click', async () => {
    const endpoint = endpointInput.value.trim();
    const apiKey = apiKeyInput.value.trim();

    if (!endpoint || !apiKey) {
        showStatus('❌ Vui lòng nhập cả Endpoint và API Key', 'error');
        return;
    }

    if (!endpoint.startsWith('https://')) {
        showStatus('❌ Endpoint phải bắt đầu với https://', 'error');
        return;
    }

    showStatus('⏳ Đang kiểm tra API...', 'loading');
    testApiBtn.disabled = true;

    const result = await AICallLogic.testAPI(apiKey, endpoint);

    testApiBtn.disabled = false;

    if (result.success) {
        showStatus('✅ API Key hợp lệ!', 'success');
    } else {
        showStatus(`❌ ${result.message}`, 'error');
    }
});

saveApiBtn.addEventListener('click', async () => {
    const endpoint = endpointInput.value.trim();
    const apiKey = apiKeyInput.value.trim();

    if (!endpoint || !apiKey) {
        // Clear config → always use defaults
        aiMessageGenerator.setAPIEndpoint(null, null);
        updateModeLabel();
        showStatus('Đã xóa cấu hình API (test dialog với default messages).', 'success');
        modal.classList.add('hidden');
        return;
    }

    if (!endpoint.startsWith('https://')) {
        showStatus('❌ Endpoint phải bắt đầu với https://', 'error');
        return;
    }

    showStatus('⏳ Đang kiểm tra API...', 'loading');
    saveApiBtn.disabled = true;

    const result = await AICallLogic.testAPI(apiKey, endpoint);

    saveApiBtn.disabled = false;

    if (result.success) {
        aiMessageGenerator.setAPIEndpoint(endpoint, apiKey);
        updateModeLabel();
        showStatus('✅ Đã lưu và áp dụng API cho dialog.', 'success');
        modal.classList.add('hidden');

        // Prefetch (same behavior as in-game): 1 lần lấy full dialog + 1 lần lấy taunt pool cho stage hiện tại
        aiMessageGenerator.prefetchAllDialogs();
        const key = dialogKeySelect.value || 'stage1';
        aiMessageGenerator.prefetchStageTaunts(key, { fallCount: 0 });
    } else {
        showStatus(`❌ ${result.message}`, 'error');
    }
});

// Dialog test actions
showDialogBtn.addEventListener('click', () => {
    const key = dialogKeySelect.value || 'intro';
    npcDialogSystem.showDialog(key);
});

showTauntBtn.addEventListener('click', () => {
    const context = {
        fallCount: 5,
        idleTime: 0,
        fallZones: { bottom: 5 },
        lastFallZone: 'bottom'
    };
    // Generate a sample fall taunt (uses API if configured, otherwise default)
    aiMessageGenerator.generateMessage('fall', context);
});

// Simple loop to drive NPCDialogSystem.update (typewriter + auto-close)
let lastTime = performance.now();
function loop(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    npcDialogSystem.update(dt);
    requestAnimationFrame(loop);
}

requestAnimationFrame((t) => {
    lastTime = t;
    loop(t);
});

