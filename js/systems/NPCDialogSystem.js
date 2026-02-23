/**
 * NPCDialogSystem - Hiển thị dialog NPC (intro, 4 stage, ending) và lời trêu chọc AI
 * - Dialog: nội dung từ AIMessageGenerator.getDialogContent (API hoặc default)
 * - Trêu chọc: nhận event 'npcTaunt' từ AIMessageGenerator (sau khi AIRuleEngine trigger)
 */
export class NPCDialogSystem {
    constructor(aiMessageGenerator) {
        this.aiMessageGenerator = aiMessageGenerator;
        this.currentStage = 'intro';
        this.dialogBox = null;
        this.dialogContent = null;
        this.dialogNPCName = null;
        this.closeBtn = null;
        this.isDialogOpen = false;
        this.autoCloseTimer = 0;
        this.dialogDuration = 5;

        this.initializeDialogUI();
        this.setupEventListeners();
    }

    initializeDialogUI() {
        this.dialogBox = document.getElementById('npc-dialog-box');
        this.dialogContent = document.getElementById('npc-dialog-text');
        this.dialogNPCName = document.getElementById('npc-name');
        this.closeBtn = document.getElementById('npc-dialog-close-btn');
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeDialog());
        }
    }

    setupEventListeners() {
        // Trêu chọc: AI (death/idle/stuck) gửi qua event → hiển thị trong cùng NPC box
        window.addEventListener('npcTaunt', (e) => {
            const { message, npcName } = e.detail || {};
            if (message) this.showTaunt(npcName || '😏 AI', message);
        });

        window.addEventListener('stageChange', (e) => {
            this.onStageChange(e.detail.stage);
        });
    }

    /**
     * Hiển thị một dòng trêu chọc (từ AIRuleEngine → AIMessageGenerator)
     */
    showTaunt(npcName, message) {
        if (!this.dialogBox || !this.dialogContent || !this.dialogNPCName) return;
        this.isDialogOpen = true;
        this.dialogBox.classList.remove('hidden');
        this.dialogBox.classList.add('show');
        this.dialogNPCName.textContent = npcName;
        this.dialogContent.textContent = message;
        this.autoCloseTimer = this.dialogDuration;
    }

    /**
     * Hiển thị dialog theo key: intro | stage1 | stage2 | stage3 | stage4 | ending
     * Nội dung lấy từ AI (API) hoặc default
     */
    async showDialog(dialogKey) {
        const allowed = ['intro', 'stage1', 'stage2', 'stage3', 'stage4', 'ending'];
        if (!allowed.includes(dialogKey) || !this.aiMessageGenerator) {
            console.warn(`[NPCDialogSystem] Invalid dialog key or no AI: "${dialogKey}"`);
            return;
        }

        const data = await this.aiMessageGenerator.getDialogContent(dialogKey);
        if (!data || !data.dialogs || data.dialogs.length === 0) return;

        this.currentStage = dialogKey;
        this.isDialogOpen = true;
        if (this.dialogBox) {
            this.dialogBox.classList.remove('hidden');
            this.dialogBox.classList.add('show');
        }
        if (this.dialogNPCName) this.dialogNPCName.textContent = data.npcName;
        if (this.dialogContent) this.dialogContent.textContent = data.dialogs[0];
        this.autoCloseTimer = this.dialogDuration;
    }

    onStageChange(stageName) {
        this.currentStage = stageName;
        const map = { easy: 'stage1', medium: 'stage2', hard: 'stage3', boss: 'stage4' };
        const key = map[stageName] || (['stage1', 'stage2', 'stage3', 'stage4'].includes(stageName) ? stageName : null);
        if (key) this.showDialog(key);
    }

    closeDialog() {
        this.isDialogOpen = false;
        if (this.dialogBox) {
            this.dialogBox.classList.add('hidden');
            this.dialogBox.classList.remove('show');
        }
    }

    update(dt) {
        if (this.isDialogOpen && this.autoCloseTimer > 0) {
            this.autoCloseTimer -= dt;
            if (this.autoCloseTimer <= 0) this.closeDialog();
        }
    }
}
