/**
 * NPC / AI Dialog Config
 * Nội dung được cập nhật chính xác theo file Chuck King Story + Dialogue.docx
 */

// ========================
// TRÊU CHỌC (Taunt) - Lời thoại của Sun (AI Sun)
// Key: fall | idle | stuck
// ========================
export const DEFAULT_TAUNT_MESSAGES = {
    fall: [
        "No wonder you got replaced. Chu Than is bigger, stronger and better…",
        "Wow, you are so COOKED. Maybe you would find better jobs opportunities at McDonald.",
        "Put the fries in the bag, bro. You are loooong gone pass your prime.",
        "My god, you suck. Becoming Hung's dinner would make you much more useful!",
        "Again? Really? How many time is it already?",
        "Welcome back, whaaaaat a surprise…",
        "Dang, maybe you should give up. I am getting secondhand embarrassment watching you.",
        "Words of wisdom, maybe don’t jump that way! How are you keep on failing!!!",
        "Sheesh, what a failure!",
        "No wonder you got cheated on! What a loser!",
        "While you are at here failing, LNY and Chu Than are probably having the time of their live up there!",
        "No surprise that you failed again. Chu Than is laughing up there!",
        "LNY and Chu Than looks like an amazing couple! Better than you soon to be KFC garbage.",
    ],
    idle: [
        "Why are you taking so long? If I were you, I would have made it to the top long ago! Are you even trying?",
        "Tik Tok, Tik Tok. Chu Than would have made it up already.",
        "Damn. Watching you climbing is so boring…",
        "Booooo, why so sloooooow",
        "Go on, jump. Are you afraid?",
        "Chu Than would succeed this jump easily. I have no doubt.",
        "Just jump, bro. You would fall anyway!",
        "What are you waiting? The two up tops already kissing!",
        "Hurry up! You would fail anyway, unlike my glorious Chu Than",
        "Lol, waiting for what? Inevitable fails?",
    ],
    stuck: [
        "Sixty-Five Sheep, Sixty-Six Sheep, Six Seven! Sheep… Oh, you are back?",
        "Wait, why are you climbing again? You can’t beat Chu Than.",
        "You idiot, you would fail again.",
        "Why bother even climbing anymore? What are you seeking at the top? You got betrayed, accept that!",
        "Are you that desperate to see LNY and Chu Than acting lovey dovely again in front of you again?",
        "Just accept your fate and become Hung’s dinner!",
        "Don’t blame LNY, Chu Than is just better than you. She made the right choice!",
        "It is raining cold here! Just make it to the top so I can do something else already!",
        "First time is just pure luck; you won’t make it the second time.",
    ],
};

// Tên NPC hiển thị
export const TAUNT_NPC_NAME = '😏 Sun';

// ========================
// TAUNT TRIGGER DESCRIPTIONS (Mô tả ngắn cho từng loại trigger)
// ========================
export const TAUNT_TRIGGER_DESCRIPTIONS = {
    fall: "The player fell! They have fallen {{fallCount}} times total and {{fallsInZone}} times in {{lastFallZone}} zone.",
    idle: "The player has been idle for {{idleTime}} seconds. They are wasting time!",
    stuck: "The player is stuck in {{lastFallZone}} zone after {{fallsInZone}} falls.",
};

// ========================
// TAUNT PROMPT BASE (Prompt chính để gửi lên API)
// ========================
export const TAUNT_PROMPT_BASE = `You are Sun, a sarcastic, mean-spirited talking sun in a video game. The player is an old rooster trying to climb a barn. Be rude, sarcastic, and mocking. Reference the player's failures, his lost love LNY, and his rival Chu Than. Keep responses short and punchy (1-2 sentences). Use English or Vietnamese.

Situation: {{triggerDesc}}

Now taunt the player:`;

// ========================
// DIALOG MẶC ĐỊNH (Cốt truyện chính)
// ========================
export const DEFAULT_DIALOGS = {
    intro: {
        npcName: 'Story',
        dialogs: [
            "As dawn broke through the starry night sky, a rooster crow resounded across the farmland.",
            "The rooster crow itself is loud and clear. On the other hand, it also contained a feeling of melancholic finality.",
            "Today is the day Player is destined to become fried chicken.",
            "Player doesn’t want to be killed. Player wants to crow more.",
            "So, Player decides to climb the barn to fulfill his dream once more!",
        ],
    },
    meetingLNY: {
        npcName: 'Sun',
        dialogs: [
            "Wow, you actually did it… how lucky.",
            "LOL! LMAO! ROFL! OMG! DAMN! JAJA! =))",
            "No wonder! LNY got on top of the barn not to mourn for you but to cheat with Chu Than!!!",
        ],
    },
    beforeBoss: {
        npcName: 'Sun',
        dialogs: [
            "LOL, prepare to get a beating from Chu Than, you nobody. I warned you before.",
        ],
    },
    ending: {
        npcName: 'Sun',
        dialogs: [
            "Okay I admit, you are pretty good. Kinda good.",
            "Well, now that Chu Than and LNY are gone, maybe Hung wouldn’t turn you to KFC. Congrats!",
        ],
    },
};

// ========================
// PROMPT DIALOG (Dành cho API)
// ========================
export const DIALOG_PROMPTS = {
    intro: "You are Sun, a sarcastic talking sun. The player is an old rooster. Mention he is about to become KFC because Chu Than is better. Use Vietnamese.",
    climbing: "You are Sun. The player is climbing the barn. Remind him of LNY's betrayal and mock his slow progress. Use Vietnamese.",
    ending: "You are Sun. The player defeated Chu Than. Admit his skill reluctantly with a sarcastic tone. Use Vietnamese.",
};