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
        this.typingSpeed = 25; // chars per second (chậm hơn để đọc kịp)
        this.typingTimer = 0;
        this.maxChars = 260;
        this.isTyping = false;
        
        // Dialog queue - hiển thị từng dòng một
        this.dialogQueue = [];
        this.currentDialogLines = [];
        this.currentDialogIndex = 0;
        this.currentNPCName = '';
        this.delayBetweenLines = 3000; // 3 giây (milliseconds)
        this.dialogLineTimer = null;
        
        // Flag để biết dialog main (intro, stage, ending) có đang chạy không
        this.isPlayingMainDialog = false;

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
        // Trêu chọc: AI (fall/idle/stuck) gửi qua event → hiển thị trong cùng NPC box
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
     * Taunt sẽ dừng dialog queue hiện tại (nhưng không interrupt main dialog)
     */
    showTaunt(npcName, message) {
        if (!this.dialogBox || !this.dialogContent || !this.dialogNPCName) return;
        
        // Không show taunt nếu đang chạy main dialog (intro, stage, ending)
        if (this.isPlayingMainDialog) return;
        
        // Dừng dialog queue nếu đang chạy
        if (this.dialogLineTimer) {
            clearTimeout(this.dialogLineTimer);
            this.dialogLineTimer = null;
        }
        this.currentDialogLines = [];
        this.currentDialogIndex = 0;
        
        this.openDialogBox(npcName);
        this.startTyping(message);
        this.autoCloseTimer = this.dialogDuration;
    }

    /**
     * Hiển thị dialog theo key: intro | stage1 | stage2 | stage3 | stage4 | ending
     * Nội dung lấy từ AI (API) hoặc default
     * Hiển thị từng dòng một, mỗi dòng cách nhau 2 giây
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
        this.currentNPCName = data.npcName;
        this.currentDialogLines = data.dialogs;
        this.currentDialogIndex = 0;
        this.isPlayingMainDialog = true; // Đánh dấu đang chạy main dialog
        
        // Xóa timer cũ nếu có
        if (this.dialogLineTimer) clearTimeout(this.dialogLineTimer);
        
        // Bắt đầu hiển thị dòng đầu tiên
        this.showNextDialogLine();
    }

    onStageChange(stageName) {
        this.currentStage = stageName;
        const map = { easy: 'stage1', medium: 'stage2', hard: 'stage3', boss: 'stage4' };
        const key = map[stageName] || (['stage1', 'stage2', 'stage3', 'stage4'].includes(stageName) ? stageName : null);
        if (key) this.showDialog(key);
    }

    /**
     * Hiển thị dòng tiếp theo trong dialog queue
     */
    showNextDialogLine() {
        if (this.currentDialogIndex >= this.currentDialogLines.length) {
            // Hết tất cả dòng - đóng dialog sau delay
            this.dialogLineTimer = setTimeout(() => {
                this.isPlayingMainDialog = false; // Dialog chính kết thúc
                this.closeDialog();
            }, this.delayBetweenLines);
            return;
        }

        const line = this.currentDialogLines[this.currentDialogIndex];
        this.currentDialogIndex++;
        
        this.openDialogBox(this.currentNPCName);
        this.startTyping(line);
        
        // Sau khi typing xong + delay, hiển thị dòng tiếp theo
        const textLength = line.length;
        const typingDuration = (textLength / this.typingSpeed) * 1000; // ms
        
        this.dialogLineTimer = setTimeout(() => {
            this.showNextDialogLine();
        }, typingDuration + this.delayBetweenLines);
    }

    closeDialog() {
        this.isDialogOpen = false;
        this.isTyping = false;
        this.fullText = '';
        this.charIndex = 0;
        this.typingTimer = 0;
        this.currentDialogIndex = 0;
        this.currentDialogLines = [];
        this.isPlayingMainDialog = false; // Reset flag
        
        // Xóa timer đang chạy
        if (this.dialogLineTimer) {
            clearTimeout(this.dialogLineTimer);
            this.dialogLineTimer = null;
        }
        
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
