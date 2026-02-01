import { GameEngine } from './engine/GameEngine.js';
import { Player } from './entities/Player.js';
import { Platform } from './entities/Platform.js';
import { EventTracker } from './systems/EventTracker.js';
import { AIRuleEngine } from './systems/AIRuleEngine.js';
import { AIMessageGenerator } from './systems/AIMessageGenerator.js';
import { UIManager } from './ui/UIManager.js';
import { API_CONFIG } from './config.js';

// Initialize game
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

// Configure AI API (nếu có)
if (API_CONFIG.endpoint) {
    aiMessageGenerator.setAPIEndpoint(API_CONFIG.endpoint, API_CONFIG.apiKey, API_CONFIG.model);
    console.log('✅ AI API configured:', API_CONFIG.endpoint);
} else {
    console.log('ℹ️ Using hardcoded AI messages (no API configured)');
}

const aiRuleEngine = new AIRuleEngine(aiMessageGenerator, eventTracker);
const uiManager = new UIManager();

// Create game engine
const gameEngine = new GameEngine(canvas, ctx, player, platforms, eventTracker, aiRuleEngine, uiManager);

// Start game
gameEngine.start();

// Handle mute button
document.getElementById('mute-ai-btn').addEventListener('click', () => {
    aiRuleEngine.toggleMute();
    const btn = document.getElementById('mute-ai-btn');
    if (aiRuleEngine.isMuted()) {
        btn.textContent = '🔊 Unmute AI';
        btn.classList.add('muted');
    } else {
        btn.textContent = '🔇 Mute AI';
        btn.classList.remove('muted');
    }
});

