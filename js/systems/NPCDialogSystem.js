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
        // Thời gian chờ sau khi gõ xong toàn bộ chữ trước khi ẩn (giây)
        this.dialogDuration = 3;
        this.fullText = '';
        this.charIndex = 0;
        this.typingSpeed = 40; // chars per second
        this.typingTimer = 0;
        this.maxChars = 260;
        this.isTyping = false;

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
        this.openDialogBox(npcName);
        this.startTyping(message);
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
        this.openDialogBox(data.npcName);
        const firstLine = data.dialogs[0];
        this.startTyping(firstLine);
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
        this.isTyping = false;
        this.fullText = '';
        this.charIndex = 0;
        this.typingTimer = 0;
        if (this.dialogBox) {
            this.dialogBox.classList.add('hidden');
            this.dialogBox.classList.remove('show');
        }
    }

    update(dt) {
        if (this.isDialogOpen && this.isTyping && this.dialogContent && this.fullText) {
            this.typingTimer += dt;
            const charsToShow = Math.floor(this.typingTimer * this.typingSpeed);
            if (charsToShow > this.charIndex) {
                this.charIndex = Math.min(charsToShow, this.fullText.length);
                this.dialogContent.textContent = this.fullText.slice(0, this.charIndex);
                if (this.charIndex >= this.fullText.length) {
                    this.isTyping = false;
                    this.typingTimer = 0;
                }
            }
        }

        if (this.isDialogOpen && !this.isTyping && this.autoCloseTimer > 0) {
            this.autoCloseTimer -= dt;
            if (this.autoCloseTimer <= 0) this.closeDialog();
        }
    }

    openDialogBox(npcName) {
        this.isDialogOpen = true;
        if (this.dialogBox) {
            this.dialogBox.classList.remove('hidden');
            this.dialogBox.classList.add('show');
        }
        if (this.dialogNPCName && npcName) {
            this.dialogNPCName.textContent = npcName;
        }
    }

    startTyping(message) {
        if (!this.dialogContent) return;
        const raw = (message || '').toString().trim();
        const limited = raw.length > this.maxChars ? raw.slice(0, this.maxChars) : raw;
        this.fullText = limited;
        this.charIndex = 0;
        this.typingTimer = 0;
        this.isTyping = true;
        this.dialogContent.textContent = '';
    }
}
