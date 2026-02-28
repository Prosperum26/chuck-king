/**
 * NPC / AI Dialog Config
 * Chứa toàn bộ nội dung default và prompt cho trêu chọc + dialog.
 * Chỉnh sửa file này để thay đổi lời NPC khi không dùng API hoặc thay đổi prompt gửi AI.
 */

// ========================
// TRÊU CHỌC (Taunt) - Default khi không có API
// Key: fall | idle | stuck
// ========================
export const DEFAULT_TAUNT_MESSAGES = {
    fall: [
        "Lại rơi rồi à?",
        "Giỏi quá nhỉ!",
        "Lần thứ mấy rồi?",
        "Cố gắng lên nào!",
        "Dễ vậy mà không làm được?",
        "Thật là tệ...",
        "Lại rơi xuống à?",
        "Chán quá đi!",
    ],
    idle: [
        "Đang làm gì đấy?",
        "Ngủ rồi à?",
        "Chơi hay không chơi?",
        "Bỏ cuộc rồi à?",
        "Còn sống không?",
        "Động đậy đi chứ!",
    ],
    stuck: [
        "Kẹt ở đây rồi à?",
        "Lại rơi ở chỗ này nữa?",
        "Học hỏi đi chứ!",
        "Làm sao mà rơi hoài vậy?",
        "Thử cách khác đi!",
        "Ngu quá!",
    ],
};

// Tên NPC hiển thị khi trêu chọc (trong hộp thoại)
export const TAUNT_NPC_NAME = '😏 AI';

// ========================
// PROMPT TRÊU CHỌC (gửi API)
// {{triggerDesc}} sẽ được thay bằng mô tả theo từng trigger (fall/idle/stuck)
// ========================
export const TAUNT_PROMPT_BASE = `Bạn là một NPC mỉa mai vô cùng cay đắng và tệ bạo trong game platformer. {{triggerDesc}} Hãy nói một câu ngắn (tối đa 15-20 từ) để trêu chọc và châm biếm người chơi một cách cơ cấu, đanh thép và vô duyên. Không giải thích, chỉ trả về câu nói ngắn gọn.`;

// Mẫu mô tả context cho từng trigger. Placeholder: {{fallCount}}, {{idleTime}}, {{fallsInZone}}, {{lastFallZone}}
export const TAUNT_TRIGGER_DESCRIPTIONS = {
    fall: 'Người chơi vừa rơi lần thứ {{fallCount}}.',
    idle: 'Người chơi đã không làm gì trong {{idleTime}} giây.',
    stuck: 'Người chơi đã rơi {{fallsInZone}} lần ở khu vực "{{lastFallZone}}" và vẫn không thể vượt qua.',
};

// ========================
// DIALOG (Intro, Stage 1-4, Ending) - Default khi không có API
// ========================
export const DEFAULT_DIALOGS = {
    intro: {
        npcName: '👾 Game Master',
        dialogs: [
            "Chào mừng tới Chuck King!",
            "Công việc của bạn là thoát khỏi mê cung 8-bit này!",
            "Xuyên qua các sàn, thẻ, và vượt qua những thách thức...",
            "Bạn sẵn sàng chưa? Hãy bắt đầu!"
        ],
    },
    stage1: {
        npcName: '😊 NPC Hỗ Trợ',
        dialogs: [
            "Tốt lắm! Bạn bắt đầu rất tốt!",
            "Tiếp tục nhảy, tránh từng cái bẫy...",
            "Mỗi bước là gần tới chiến thắng hơn!"
        ],
    },
    stage2: {
        npcName: '🤔 AI Thách Thức',
        dialogs: [
            "Ồ, nó trở nên khó khăn rồi!",
            "Các sàn đang di chuyển... Bạn có theo kịp không?",
            "Tôi đoán bạn sẽ phải cố gắng hơn..."
        ],
    },
    stage3: {
        npcName: '😈 Ma Quỷ Thách Thức',
        dialogs: [
            "Bây giờ đã vào cấp độ khó đấy!",
            "Các sàn băng, sàn giả, mọi thứ sẽ rơi...",
            "Hehe... bạn sẽ rơi bao nhiêu lần nhỉ?"
        ],
    },
    stage4: {
        npcName: '👑 Boss Cuối Cùng',
        dialogs: [
            "CUỐI CÙNG... chúng ta gặp nhau!",
            "Đây là sàn khó nhất của tất cả!",
            "Nếu bạn vượt qua được cái này, bạn sẽ là CHUCK KING!"
        ],
    },
    ending: {
        npcName: '🎉 Bình Luận Viên',
        dialogs: [
            "TUYỆT VỜI! Bạn đã làm được!",
            "Bạn chính thức là CHUCK KING rồi!",
            "Hãy chơi lại để chinh phục các cấp độ khác!"
        ],
    },
};

// ========================
// PROMPT DIALOG (gửi API cho intro / stage1-4 / ending)
// Mỗi key một prompt; AI trả về nhiều dòng (mỗi câu một dòng)
// ========================
export const DIALOG_PROMPTS = {
    intro: `Bạn là Game Master của game platformer Chuck King. Viết 3-4 câu ngắn chào mừng và hướng dẫn người chơi (tiếng Việt). Mỗi câu trên một dòng, không đánh số, không markdown.`,
    stage1: `Bạn là NPC hỗ trợ trong game platformer. Người chơi vừa vào stage 1 (dễ). Viết 2-3 câu khích lệ ngắn (tiếng Việt). Mỗi câu một dòng.`,
    stage2: `Bạn là NPC thách thức trong game platformer. Người chơi đang ở stage 2 (trung bình). Viết 2-3 câu thách thức ngắn (tiếng Việt). Mỗi câu một dòng.`,
    stage3: `Bạn là NPC ma quỷ trong game platformer. Người chơi đang ở stage 3 (khó). Viết 2-3 câu đe dọa/khó (tiếng Việt). Mỗi câu một dòng.`,
    stage4: `Bạn là Boss cuối cùng trong game platformer. Người chơi đang ở stage 4 (boss). Viết 2-3 câu hùng hồn (tiếng Việt). Mỗi câu một dòng.`,
    ending: `Bạn là bình luận viên game. Người chơi vừa chiến thắng Chuck King. Viết 2-3 câu chúc mừng (tiếng Việt). Mỗi câu một dòng.`,
};
