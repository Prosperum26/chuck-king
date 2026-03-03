/**
 * AIMessageGenerator - Generates AI taunt messages + NPC dialog (intro, stage, ending)
 * Trêu chọc: fall/idle/stuck (API hoặc default)
 * Dialog: intro, stage1-4, ending (API hoặc default, output chia thành nhiều dòng)
 */
import {
    DEFAULT_TAUNT_MESSAGES,
    TAUNT_NPC_NAME,
    TAUNT_PROMPT_BASE,
    TAUNT_TRIGGER_DESCRIPTIONS,
    DEFAULT_DIALOGS,
    DIALOG_PROMPTS,
} from '../config/NPCDialogConfig.js';
import { callLLMText } from './LLMClient.js';

/** Dialog type keys */
export const DIALOG_TYPES = ['intro', 'stage1', 'stage2', 'stage3', 'ending'];

export class AIMessageGenerator {
    constructor() {
        this.hardcodedMessages = DEFAULT_TAUNT_MESSAGES;
        this.defaultDialogs = DEFAULT_DIALOGS;

        this.currentMessage = null;
        this.apiEndpoint = null;
        this.apiKey = null;
        this.model = 'gpt-3.5-turbo';
        this.callInProgress = false;
        this.dialogCallInProgress = false;

        // Prefetch caches
        this.dialogPrefetchDone = false;
        this.dialogPrefetchInProgress = false;
        this.prefetchedDialogs = null; // { npcName, dialogsByType: { intro:[], stage1:[], ... } }

        this.currentStageKey = 'stage1';
        this.stageTauntCache = new Map(); // stageKey -> string[]
        this.stageTauntPrefetchInProgress = new Set(); // stageKey
    }
    
    /**
     * Generate AI message based on trigger type and context
     * @param {string} triggerType - 'fall', 'idle', or 'stuck'
     * @param {object} context - Event tracker context
     */
    async generateMessage(triggerType, context) {
        try {
            // IMPORTANT: Taunt AI chỉ được tạo 1 lần ở đầu stage (prefetch).
            // Ở đây chỉ lấy ngẫu nhiên từ cache của stage hiện tại.
            if (this.apiEndpoint && this.apiKey) {
                const pooled = this.getRandomTauntFromStagePool(this.currentStageKey);
                if (pooled) {
                    console.log(`[AIMessageGenerator] 🤖 AI(pool:${this.currentStageKey}) -> "${pooled}"`);
                    this.currentMessage = pooled;
                    this.dispatchMessage(pooled);
                    return;
                }
                console.log(`[AIMessageGenerator] ℹ️ AI pool empty for stage "${this.currentStageKey}" -> fallback DEFAULT`);
            }
        } catch (error) {
            console.warn('[AIMessageGenerator] AI taunt pool failed, using hardcoded:', error.message);
        }
        
        // Fallback to hardcoded messages nếu không có API hoặc API fail
        const messages = this.hardcodedMessages[triggerType] || this.hardcodedMessages.fall;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.currentMessage = randomMessage;
        console.log(`[AIMessageGenerator] 💬 DEFAULT(${triggerType}): "${randomMessage}"`);
        this.dispatchMessage(randomMessage);
    }
    
    /**
     * Call AI API to generate message using AICallLogic
     * @param {string} triggerType 
     * @param {object} context 
     * @returns {Promise<string|null>}
     */
    /**
     * Prefetch taunts 20-30 câu cho 1 stage (gọi 1 lần ở đầu stage).
     */
    async prefetchStageTaunts(stageKey = 'stage1', context = {}) {
        const key = stageKey || 'stage1';
        this.currentStageKey = key;

        if (!this.apiEndpoint || !this.apiKey) {
            console.log(`[AIMessageGenerator] 💬 DEFAULT(pool:${key}) - no API config, will use hardcoded per trigger`);
            return { success: false, message: 'NO_API' };
        }

        if (this.stageTauntCache.has(key)) {
            console.log(`[AIMessageGenerator] 🤖 AI(pool:${key}) already prefetched (${this.stageTauntCache.get(key).length} lines)`);
            return { success: true, message: 'CACHED', count: this.stageTauntCache.get(key).length };
        }
        if (this.stageTauntPrefetchInProgress.has(key)) {
            console.log(`[AIMessageGenerator] ⏳ AI(pool:${key}) prefetch in progress...`);
            return { success: false, message: 'IN_PROGRESS' };
        }

        this.stageTauntPrefetchInProgress.add(key);
        try {
            const fallCount = Number(context?.fallCount || 0);
            const prompt = `Bạn là NPC mỉa mai trong game platformer. Người chơi đang ở ${key}, đã rơi ${fallCount} lần.
Hãy tạo một danh sách câu trêu chọc (châm biếm/cà khịa) để dùng ngẫu nhiên trong stage này.
Yêu cầu:
- Trả về ĐÚNG một JSON array gồm 20 đến 30 câu tiếng Việt.
- Mỗi phần tử là 1 câu, không markdown, không giải thích.
- Tránh câu quá dài: mỗi câu <= 20 từ.
Ví dụ: ["Câu 1.","Câu 2.","Câu 3..."]`;

            const result = await callLLMText({
                endpoint: this.apiEndpoint,
                apiKey: this.apiKey,
                model: this.model,
                prompt,
                maxTokens: 700,
                temperature: 0.85,
                timeoutMs: 15000
            });
            if (!result.success) {
                console.warn(`[AIMessageGenerator] ❌ AI(pool:${key}) prefetch failed: ${result.message}`);
                return { success: false, message: result.message || 'FAILED' };
            }

            const list = this.parseJSONArray(result.content);
            if (!list || list.length < 5) {
                console.warn(`[AIMessageGenerator] ❌ AI(pool:${key}) invalid JSON array, fallback DEFAULT`);
                return { success: false, message: 'INVALID_JSON' };
            }

            // Clamp to 20-30 if model returns more
            const trimmed = list.slice(0, 30);
            this.stageTauntCache.set(key, trimmed);
            console.log(`[AIMessageGenerator] ✅ AI(pool:${key}) prefetched ${trimmed.length} taunts`);
            return { success: true, message: 'OK', count: trimmed.length };
        } finally {
            this.stageTauntPrefetchInProgress.delete(key);
        }
    }

    getRandomTauntFromStagePool(stageKey) {
        const list = this.stageTauntCache.get(stageKey);
        if (!list || list.length === 0) return null;
        return list[Math.floor(Math.random() * list.length)];
    }
    
    /**
     * Build prompt for AI based on trigger type (dùng config: TAUNT_PROMPT_BASE + TAUNT_TRIGGER_DESCRIPTIONS)
     */
    buildPrompt(triggerType, context) {
        const fallCountInZone = context.fallZones?.[context.lastFallZone] || 0;
        const vars = {
            fallCount: context.fallCount,
            idleTime: Math.floor(context.idleTime),
            fallsInZone: fallCountInZone,
            lastFallZone: context.lastFallZone || 'bottom',
        };
        let triggerDesc = TAUNT_TRIGGER_DESCRIPTIONS[triggerType] || TAUNT_TRIGGER_DESCRIPTIONS.fall;
        for (const [key, value] of Object.entries(vars)) {
            triggerDesc = triggerDesc.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }
        return TAUNT_PROMPT_BASE.replace('{{triggerDesc}}', triggerDesc);
    }
    
    /**
     * Dispatch taunt message → NPC dialog box (event 'npcTaunt' để NPCDialogSystem hiển thị)
     */
    dispatchMessage(message) {
        const event = new CustomEvent('npcTaunt', {
            detail: { message, npcName: TAUNT_NPC_NAME }
        });
        window.dispatchEvent(event);
    }

    /**
     * Lấy nội dung dialog (intro / stage1-4 / ending). Có API thì gọi API và chia dòng, không thì dùng default.
     * @param {string} dialogType - 'intro' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'ending'
     * @returns {Promise<{npcName: string, dialogs: string[]}>}
     */
    async getDialogContent(dialogType) {
        const defaultData = this.defaultDialogs[dialogType];
        if (!defaultData) {
            return { npcName: 'NPC', dialogs: ['...'] };
        }

        // Dialog AI: chỉ gọi 1 lần ở đầu game (prefetchAllDialogs). Ở đây chỉ dùng cache.
        let dialogs = null;
        let npcName = defaultData.npcName;
        
        if (this.dialogPrefetchDone && this.prefetchedDialogs?.dialogsByType?.[dialogType]) {
            dialogs = this.prefetchedDialogs.dialogsByType[dialogType];
            if (dialogs && dialogs.length > 0) {
                console.log(`[AIMessageGenerator] 🤖 AI(dialog:${dialogType}) from prefetched cache (${dialogs.length} lines)`);
                npcName = this.prefetchedDialogs.npcName || defaultData.npcName;
            }
        }

        if (!dialogs) {
            console.log(`[AIMessageGenerator] 💬 DEFAULT(dialog:${dialogType})`);
            dialogs = [...defaultData.dialogs];
        } else {
            dialogs = [...dialogs];
        }

        // Replace {{playerName}} với tên người chơi từ localStorage
        const playerName = localStorage.getItem('playerName') || 'Player';
        dialogs = dialogs.map(line => line.replace(/{{playerName}}/g, playerName));

        return {
            npcName: npcName,
            dialogs: dialogs
        };
    }

    /**
     * Prefetch toàn bộ dialog (intro/stage1-4/ending) bằng 1 API call duy nhất.
     */
    async prefetchAllDialogs() {
        if (this.dialogPrefetchDone) {
            console.log('[AIMessageGenerator] 🤖 AI(dialogs) already prefetched');
            return { success: true, message: 'CACHED' };
        }
        if (this.dialogPrefetchInProgress) {
            console.log('[AIMessageGenerator] ⏳ AI(dialogs) prefetch in progress...');
            return { success: false, message: 'IN_PROGRESS' };
        }

        if (!this.apiEndpoint || !this.apiKey) {
            console.log('[AIMessageGenerator] 💬 DEFAULT(dialogs) - no API config, using built-in dialogs');
            this.dialogPrefetchDone = true;
            this.prefetchedDialogs = null;
            return { success: false, message: 'NO_API' };
        }

        this.dialogPrefetchInProgress = true;
        try {
            const prompt = `Bạn là NPC trong game platformer. Hãy tạo toàn bộ dialog cho cả game.
Yêu cầu bắt buộc:
- Trả về ĐÚNG một JSON object (không markdown, không giải thích).
- JSON có dạng:
{
  "npcName": "Tên NPC",
  "intro": ["...","..."],
  "stage1": ["...","..."],
  "stage2": ["...","..."],
  "stage3": ["...","..."],
  "stage4": ["...","..."],
  "ending": ["...","..."]
}
- Mỗi key intro/stage*/ending là một JSON array 2-6 câu (mỗi câu là 1 string tiếng Việt).
- Tông giọng: châm biếm nhẹ, gây cười, hợp game.
- Không dùng ký tự xuống dòng trong từng string (mỗi phần tử là 1 câu).`;

            const result = await callLLMText({
                endpoint: this.apiEndpoint,
                apiKey: this.apiKey,
                model: this.model,
                prompt,
                maxTokens: 900,
                temperature: 0.8,
                timeoutMs: 20000
            });
            if (!result.success) {
                console.warn(`[AIMessageGenerator] ❌ AI(dialogs) prefetch failed: ${result.message}`);
                this.dialogPrefetchDone = true; // avoid spamming API calls
                this.prefetchedDialogs = null;
                return { success: false, message: result.message || 'FAILED' };
            }

            const obj = this.parseJSONObject(result.content);
            const npcName = typeof obj?.npcName === 'string' ? obj.npcName.trim() : null;
            const keys = ['intro', 'stage1', 'stage2', 'stage3', 'stage4', 'ending'];
            const dialogsByType = {};
            for (const k of keys) {
                const arr = Array.isArray(obj?.[k]) ? obj[k] : null;
                if (!arr) continue;
                dialogsByType[k] = arr
                    .filter((s) => typeof s === 'string')
                    .map((s) => s.trim())
                    .filter(Boolean);
            }

            const hasAny = Object.values(dialogsByType).some((a) => Array.isArray(a) && a.length > 0);
            if (!hasAny) {
                console.warn('[AIMessageGenerator] ❌ AI(dialogs) invalid JSON content, fallback DEFAULT');
                this.dialogPrefetchDone = true;
                this.prefetchedDialogs = null;
                return { success: false, message: 'INVALID_JSON' };
            }

            this.prefetchedDialogs = { npcName, dialogsByType };
            this.dialogPrefetchDone = true;
            console.log('[AIMessageGenerator] ✅ AI(dialogs) prefetched for whole game');
            return { success: true, message: 'OK' };
        } finally {
            this.dialogPrefetchInProgress = false;
        }
    }

    /**
     * Tạo prompt cho từng loại dialog (intro, stage1-4, ending) từ config DIALOG_PROMPTS
     */
    buildDialogPrompt(dialogType) {
        return DIALOG_PROMPTS[dialogType] || DIALOG_PROMPTS.intro;
    }
    
    /**
     * Configure AI API endpoint
     */
    setAPIEndpoint(endpoint, apiKey = null, model = 'gpt-3.5-turbo') {
        this.apiEndpoint = endpoint;
        this.apiKey = apiKey;
        this.model = model;
    }

    parseJSONArray(content) {
        if (!content || typeof content !== 'string') return null;
        const trimmed = content.trim().replace(/^```json\s*|\s*```$/g, '').trim();
        try {
            const arr = JSON.parse(trimmed);
            if (!Array.isArray(arr)) return null;
            return arr
                .filter((x) => typeof x === 'string')
                .map((s) => s.trim())
                .filter(Boolean);
        } catch (_) {
            return null;
        }
    }

    parseJSONObject(content) {
        if (!content || typeof content !== 'string') return null;
        const trimmed = content.trim().replace(/^```json\s*|\s*```$/g, '').trim();
        try {
            const obj = JSON.parse(trimmed);
            return obj && typeof obj === 'object' ? obj : null;
        } catch (_) {
            return null;
        }
    }
}

