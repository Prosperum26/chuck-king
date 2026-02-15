import { GameEngine } from './engine/GameEngine.js';
import { Player } from './entities/Player.js';
import { Platform } from './entities/Platform.js';
import { EventTracker } from './systems/EventTracker.js';
import { AIRuleEngine } from './systems/AIRuleEngine.js';
import { AIMessageGenerator } from './systems/AIMessageGenerator.js';
import { UIManager } from './ui/UIManager.js';

// Setup Canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

//  Thiết lập độ phân giải LOGIC cố định (không bao giờ đổi)
const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

// --- THAY ĐỔI 1: sử dụng tỉ lệ 16:9 rồi scale ---
function setupCanvas() {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
}
// Gọi ngay lập tức khi vào game
setupCanvas();

// Tự động chỉnh lại khi người chơi co kéo cửa sổ trình duyệt
window.addEventListener('resize', () => {
    // Chúng ta để CSS (aspect-ratio và object-fit) tự lo việc co giãn
    // Code ở đây chỉ cần xử lý nếu bạn muốn re-render cái gì đó đặc biệt
    console.log("Cửa sổ thay đổi, nhưng độ phân giải game vẫn là 1920x1080");
});

// --- THAY ĐỔI 2: Cập nhật Map để sàn (Platform đầu tiên) dài bằng màn hình ---
const platforms = [

    // =====================================================
    // MẶT ĐẤT
    // =====================================================
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

    // ĐỈNH
    new Platform(1100, 80, 220, 40, "oneWay"),

];


// ... (Phần code khởi tạo EventTracker, AI, Player... giữ nguyên như cũ) ...
const eventTracker = new EventTracker();
const aiMessageGenerator = new AIMessageGenerator();
const aiRuleEngine = new AIRuleEngine(aiMessageGenerator, eventTracker);
const uiManager = new UIManager();
const player = new Player(50, canvas.height - 150, eventTracker); // Chỉnh lại vị trí spawn của player cho hợp lý

const gameEngine = new GameEngine(canvas, ctx, player, platforms, eventTracker, aiRuleEngine, uiManager);
gameEngine.start();

// Xử lý nút Mute
const muteBtn = document.getElementById('mute-ai-btn');
if (muteBtn) {
    muteBtn.addEventListener('click', () => {
        aiRuleEngine.toggleMute();
        if (aiRuleEngine.isMuted()) {
            muteBtn.textContent = '🔊 Unmute AI';
            muteBtn.classList.add('muted');
        } else {
            muteBtn.textContent = '🔇 Mute AI';
            muteBtn.classList.remove('muted');
        }
    });
}