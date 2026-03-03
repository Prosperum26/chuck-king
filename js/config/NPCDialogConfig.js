/**
 * NPC / AI Dialog Config
 * Nội dung được cập nhật chính xác theo file Chuck King Story + Dialogue.docx
 */

// ========================
// TRÊU CHỌC (Taunt) - Lời thoại của Sun (AI Sun)
// Key: fall | idle
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
        "Sixty-Five Sheep, Sixty-Six Sheep, Six Seven! Sheep… Oh, you are back?",
        "You idiot, you would fail again.",
        "Are you that desperate to see LNY and Chu Than acting lovey dovely again in front of you again?",
        "Don’t blame LNY, Chu Than is just better than you. She made the right choice!",
        "First time is just pure luck; you won’t make it the second time.",
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
        "Wait, why are you climbing again? You can’t beat Chu Than.",
        "Why bother even climbing anymore? What are you seeking at the top? You got betrayed, accept that!",
        "Just accept your fate and become Hung’s dinner!",
        "It is raining cold here! Just make it to the top so I can do something else already!",
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
            "Today is the day {{playerName}} is destined to become fried chicken.",
            "{{playerName}} doesn't want to be killed. {{playerName}} wants to crow more.",
            "So, {{playerName}} decides to climb the barn to fulfill his dream once more!",
        ],
    },
    greeting: {
        npcName: 'Sun',
        dialogs: [
            "Good Morning! What a wonderful day! How is it going? {{playerName}}",
            "Say something… We are basically old buddies! Do you remember our memorable moments together?",
            "You always whisper my name every dawn! How romantic you are <3.",
            "Right, you are a chicken. Obviously, you cannot speak…",
            "Anyway, today is the day you will be replaced by a new male rooster.",
            "Honestly, your future looks bleak. With the addition of Chu Than, you will probably be cooked both literally and figuratively.",
            "Don’t be so down! You did have a good time! You were loved by everyone at this farm. You even got yourself a girlfriend: Lieu Nhu Yen.",
            "I know it is hard to accept, but nothing lasts forever. It is the universal rules of this world!",
            "Okay, okay! I know empty words won’t resolve anything.",
            "So how about you climb on top of this barn and give yourself a fine closure?",
            "You know, like relieving your glorious memories one final time?",
            "If it motivates you better, Lieu Nhu Yen is waiting on top of the barn.",
            "I don’t know what she is doing over there, being sneaky and all.",
            "My guess is that she is waiting for you, so don’t let a woman… don’t let a hen hanging like that!",
            "Go! Relive your glory, {{playerName}}. I will be here to accompany you on your journey!",
            "Ah, so this marks the beginning of a triumphant ending. A journey of the great {{playerName}} to find his closure!",
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
    greeting: "You are Sun, a friendly and nostalgic talking sun. Greet the player warmly and ask about their well-being, reminiscing about your old friendship. Use English or Vietnamese.",
    climbing: "You are Sun. The player is climbing the barn. Remind him of LNY's betrayal and mock his slow progress. Use Vietnamese.",
    ending: "You are Sun. The player defeated Chu Than. Admit his skill reluctantly with a sarcastic tone. Use Vietnamese.",
};