/**
 * AIMessageGenerator - Generates AI taunt messages + NPC dialog (intro, stage, ending)
 * Trêu chọc: fall/idle/stuck (API hoặc default)
 * Dialog: intro, stage1-4, ending (API hoặc default, output chia thành nhiều dòng)
 */
import {
    DEFAULT_TAUNT_MESSAGES,
    TAUNT_NPC_NAME,
    TAUNT_BATCH_PROMPT,
    DEFAULT_DIALOGS,
    DIALOG_PROMPT,
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

        // New taunt batch caches (fall / idle)
        this.aiFallTaunts = [];
        this.aiIdleTaunts = [];
        this.tauntBatchPrefetched = false;
        this.tauntBatchPrefetchInProgress = false;
    }
    
    /**
     * Generate AI message based on trigger type and context
     * @param {string} triggerType - 'fall', 'idle', or 'stuck'
     * @param {object} context - Event tracker context
     */
    async generateMessage(triggerType, context) {
        try {
            // IMPORTANT: Taunt AI chỉ được tạo 1 lần ở đầu stage (prefetch).
            // Ở đây chỉ lấy ngẫu nhiên từ cache AI (fall/idle) nếu có.
            if (this.apiEndpoint && this.apiKey) {
                const pooled = this.getRandomTaunt(triggerType);
                if (pooled) {
                    console.log(`[AIMessageGenerator] 🤖 AI(${triggerType}) -> "${pooled}"`);
                    this.currentMessage = pooled;
                    this.dispatchMessage(pooled);
                    return;
                }
                console.log('[AIMessageGenerator] ℹ️ AI taunt pool empty -> fallback DEFAULT');
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
     * Prefetch taunts (fall + idle) bằng TAUNT_BATCH_PROMPT (gọi 1 lần khi có API).
     */
    async prefetchStageTaunts(stageKey = 'stage1', context = {}) {
        // Giữ API cũ: hàm vẫn nhận stageKey/context nhưng bên trong dùng batch prompt mới.
        const key = stageKey || 'stage1';
        this.currentStageKey = key;

        if (!this.apiEndpoint || !this.apiKey) {
            console.log(`[AIMessageGenerator] 💬 DEFAULT(taunt batch) - no API config, will use hardcoded per trigger`);
            return { success: false, message: 'NO_API' };
        }

        if (this.tauntBatchPrefetched && this.aiFallTaunts.length + this.aiIdleTaunts.length > 0) {
            console.log(`[AIMessageGenerator] 🤖 AI(taunt batch) already prefetched (fall:${this.aiFallTaunts.length}, idle:${this.aiIdleTaunts.length})`);
            return {
                success: true,
                message: 'CACHED',
                count: this.aiFallTaunts.length + this.aiIdleTaunts.length,
            };
        }
        if (this.tauntBatchPrefetchInProgress) {
            console.log('[AIMessageGenerator] ⏳ AI(taunt batch) prefetch in progress...');
            return { success: false, message: 'IN_PROGRESS' };
        }

        this.tauntBatchPrefetchInProgress = true;
        try {
            const result = await this.callTauntBatchPrompt();
            if (!result.success) return result;
            console.log(
                `[AIMessageGenerator] ✅ AI(taunt batch) prefetched fall:${this.aiFallTaunts.length}, idle:${this.aiIdleTaunts.length}`
            );
            return {
                success: true,
                message: 'OK',
                count: this.aiFallTaunts.length + this.aiIdleTaunts.length,
            };
        } finally {
            this.tauntBatchPrefetchInProgress = false;
        }
    }

    /**
     * Gọi TAUNT_BATCH_PROMPT → parse theo format:
     * ===FALL=== ... ||| ...
     *
     * ===IDLE=== ... ||| ...
     */
    async callTauntBatchPrompt() {
        const result = await callLLMText({
            endpoint: this.apiEndpoint,
            apiKey: this.apiKey,
            model: this.model,
            prompt: TAUNT_BATCH_PROMPT,
            maxTokens: 800,
            temperature: 0.85,
            timeoutMs: 18000,
        });

        if (!result.success) {
            console.warn(`[AIMessageGenerator] ❌ AI(taunt batch) failed: ${result.message}`);
            this.tauntBatchPrefetched = true; // tránh spam API
            this.aiFallTaunts = [];
            this.aiIdleTaunts = [];
            return { success: false, message: result.message || 'FAILED' };
        }

        const parsed = this.parseTauntBatch(result.content);
        if (!parsed) {
            console.warn('[AIMessageGenerator] ❌ AI(taunt batch) invalid format, fallback DEFAULT');
            this.tauntBatchPrefetched = true;
            this.aiFallTaunts = [];
            this.aiIdleTaunts = [];
            return { success: false, message: 'INVALID_FORMAT' };
        }

        this.aiFallTaunts = parsed.fallTaunts;
        this.aiIdleTaunts = parsed.idleTaunts;
        this.tauntBatchPrefetched = true;
        return { success: true, message: 'OK' };
    }

    /**
     * Parse batch string theo format yêu cầu (FALL / IDLE, separator "|||").
     */
    parseTauntBatch(rawContent) {
        if (!rawContent || typeof rawContent !== 'string') return null;

        // Loại bỏ ``` hoặc ```json wrapper nếu có
        let response = rawContent.trim().replace(/^```[a-zA-Z]*\s*|\s*```$/g, '').trim();

        if (!response.includes('===FALL===') || !response.includes('===IDLE===')) {
            return null;
        }

        const [fallPart, idlePartRaw] = response.split('===IDLE===');
        if (!fallPart || !idlePartRaw) return null;

        const fallTaunts = fallPart
            .replace('===FALL===', '')
            .trim()
            .split('|||')
            .map((s) => s.trim())
            .filter(Boolean);

        const idleTaunts = idlePartRaw
            .trim()
            .split('|||')
            .map((s) => s.trim())
            .filter(Boolean);

        if (!fallTaunts.length && !idleTaunts.length) return null;

        return {
            fallTaunts,
            idleTaunts,
        };
    }

    /**
     * Lấy random 1 câu trêu chọc từ pool AI theo triggerType (fall/idle/stuck).
     * - fall → ưu tiên fallTaunts
     * - idle → ưu tiên idleTaunts
     * - stuck → dùng cả 2 pool
     */
    getRandomTaunt(triggerType) {
        const hasAny = (this.aiFallTaunts && this.aiFallTaunts.length) || (this.aiIdleTaunts && this.aiIdleTaunts.length);
        if (!hasAny) return null;

        let list = [];
        if (triggerType === 'idle') {
            list = this.aiIdleTaunts.length ? this.aiIdleTaunts : this.aiFallTaunts;
        } else if (triggerType === 'fall') {
            list = this.aiFallTaunts.length ? this.aiFallTaunts : this.aiIdleTaunts;
        } else {
            // stuck hoặc loại khác → gộp chung
            list = [...(this.aiFallTaunts || []), ...(this.aiIdleTaunts || [])];
        }

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
            const result = await callLLMText({
                endpoint: this.apiEndpoint,
                apiKey: this.apiKey,
                model: this.model,
                // Dùng DIALOG_PROMPT mới (batch, có ===SECTION===)
                prompt: DIALOG_PROMPT,
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

            const parsed = this.parseDialogSections(result.content);
            if (!parsed) {
                console.warn('[AIMessageGenerator] ❌ AI(dialogs) invalid SECTION format, fallback DEFAULT');
                this.dialogPrefetchDone = true;
                this.prefetchedDialogs = null;
                return { success: false, message: 'INVALID_FORMAT' };
            }

            this.prefetchedDialogs = parsed;
            this.dialogPrefetchDone = true;
            console.log('[AIMessageGenerator] ✅ AI(dialogs) prefetched for whole game');
            return { success: true, message: 'OK' };
        } finally {
            this.dialogPrefetchInProgress = false;
        }
    }

    /**
     * Tạo prompt cho từng loại dialog (intro, stage1-4, ending).
     * (Giữ API cũ nhưng hiện tại dùng DIALOG_PROMPT batch thay vì per-type).
     */
    buildDialogPrompt(dialogType) {
        return DIALOG_PROMPT;
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

    /**
     * Parse dialog batch theo DIALOG_PROMPT:
     * - 5 SECTION, mỗi SECTION là 3–5 dòng, ngăn bởi "===SECTION===".
     * - Thứ tự: intro, stage1, stage2, stage3, ending.
     */
    parseDialogSections(rawContent) {
        if (!rawContent || typeof rawContent !== 'string') return null;

        // Bỏ ``` hoặc ```json nếu có
        let text = rawContent.trim().replace(/^```[a-zA-Z]*\s*|\s*```$/g, '').trim();

        const parts = text
            .split('===SECTION===')
            .map((p) => p.trim())
            .filter(Boolean);

        if (parts.length < 5) return null;

        const [introRaw, stage1Raw, stage2Raw, stage3Raw, endingRaw] = parts;

        const toLines = (block) =>
            block
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean);

        const dialogsByType = {
            intro: toLines(introRaw),
            stage1: toLines(stage1Raw),
            stage2: toLines(stage2Raw),
            stage3: toLines(stage3Raw),
            ending: toLines(endingRaw),
        };

        const hasAny = Object.values(dialogsByType).some((a) => Array.isArray(a) && a.length > 0);
        if (!hasAny) return null;

        // NPC name: giữ giống default (Sun) để UI ổn định
        const npcName = DEFAULT_DIALOGS?.intro?.npcName || 'Sun';

        return {
            npcName,
            dialogsByType,
        };
    }
}

