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
        "No wonder you got replaced. There’s literally nothing impressive about that jump…",
        "Wow, you are so COOKED. Maybe consider a career in fast food.",
        "Put the fries in the bag, bro. You are loooong past your prime.",
        "My god, you suck. Becoming dinner would make you much more useful!",
        "Again? Really? How many times is it already?",
        "Welcome back, whaaaaat a surprise…",
        "Dang, maybe you should give up. I’m getting secondhand embarrassment watching you.",
        "Words of wisdom: maybe don’t jump like that? How do you keep failing!!!",
        "Sheesh, what a failure!",
        "No wonder nobody takes you seriously. Look at that performance.",
        "While you’re down here failing, the top is just… existing without you.",
        "No surprise you failed again. The barn isn’t even trying.",
        "That jump looked confident. The landing said otherwise.",
        "Sixty-Five Sheep, Sixty-Six Sheep, Sixty-Seven— oh, you fell again?",
        "You idiot, you’re going to fail again.",
        "Are you that desperate to fall in the exact same way twice?",
        "Don’t blame the controls. It’s you.",
        "First time was pure luck; you won’t make it the second time.",
    ],

    idle: [
        "Why are you taking so long? Are you even trying?",
        "Tick tock. Even gravity is getting impatient.",
        "Damn. Watching you climb is so boring…",
        "Booooo, why so sloooooow?",
        "Go on, jump. Or are you scared?",
        "That jump isn’t hard. You’re just overthinking it.",
        "Just jump, bro. You’ll probably fall anyway.",
        "What are you waiting for? A motivational speech?",
        "Hurry up! At this speed, sunset will come first.",
        "Lol, waiting for what? Inevitable failure?",
        "Wait, why are you climbing again? Didn’t you learn?",
        "Why bother climbing anymore? The ground clearly loves you.",
        "Just accept your fate and become dinner already.",
        "It’s getting cold up here. Move.",
    ],
};

// Tên NPC hiển thị
export const TAUNT_NPC_NAME = '😏 Sun';

// ========================
// TAUNT TRIGGER DESCRIPTIONS (Mô tả ngắn cho từng loại trigger)
// ========================
export const TAUNT_BATCH_PROMPT = `
You are Sun, a toxic, sarcastic talking sun in a dark comedy platformer game.

The player is an old rooster climbing a barn.

STYLE RULES:
- Be rude, mocking, chaotic, slightly meme-aware.
- No love triangle.
- No rivals.
- No romance references.
- Focus only on climbing, falling, hesitation, skill issues.
- Keep each taunt short (1 sentence max, punchy).
- Do NOT number them.
- Do NOT add extra commentary.
- Separate each taunt using: |||
- Separate categories using EXACTLY:
===FALL===
and
===IDLE===

Generate:
- 20 FALL taunts (player just fell).
- 15 IDLE taunts (player is standing still too long).

Output format EXACTLY like this:

===FALL===
taunt 1|||taunt 2|||taunt 3|||...

===IDLE===
taunt 1|||taunt 2|||taunt 3|||...
`;

// ========================
// DIALOG MẶC ĐỊNH (Cốt truyện chính) - 5 loại
// intro, stage1, stage2, stage3, ending
// ========================
export const DEFAULT_DIALOGS = {
    intro: {
        npcName: 'Sun',
        dialogs: [
            "Rise and shine, {{playerName}}! Or… just rise. Shine is debatable.",
            "Still single, still aging, still dangerously close to becoming KFC.",
            "Before you turn into a bucket special, why not live a little?",
            "Climb that barn. The hen is waiting.",
            "If you’re doomed anyway, at least make it romantic.",
        ],
    },
    stage1: {
        npcName: 'Sun',
        dialogs: [
            "Well, well! You actually made it up here!",
            "Look at you two… standing awkwardly in the sunrise.",
            "Go on. Say something cool. Don’t waste your only shot.",
        ],
    },
    stage2: {
        npcName: 'Sun',
        dialogs: [
            "Oh.",
            "She kicked you off.",
            "That wasn’t very romantic, was it?",
            "You gonna stay down there… or climb back up with some dignity?",
        ],
    },
    stage3: {
        npcName: 'Sun',
        dialogs: [
            "Back again? I didn’t expect that.",
            "That’s either courage… or pure stubbornness.",
            "Alright then. Show her you’re not just poultry.",
        ],
    },
    ending: {
        npcName: 'Sun',
        dialogs: [
            "Now that’s what I call character development.",
            "Revenge served fresh at sunrise.",
            "Maybe you’re not KFC material after all.",
        ],
    },
};

// ========================
// PROMPT DIALOG (Dành cho API) - 5 loại
// intro, stage1, stage2, stage3, ending
// ========================
export const DIALOG_PROMPT = `
You are writing short game dialogues for a dark comedy platformer.

Main character: an old rooster named {{playerName}}.
Narrator/NPC: The Sun (sarcastic, funny, slightly toxic but secretly supportive).

IMPORTANT RULES:
- Use English.
- Keep each section concise (3–5 short lines max).
- Make it humorous, meme-aware, slightly toxic.
- No love triangle.
- No cheating.
- No Chu Than.
- No NTR drama.
- Focus only on climbing, falling, comeback, and revenge energy.
- Separate each section EXACTLY using: ===SECTION===
- Do NOT add anything before the first section or after the last section.
- Output exactly 5 sections in this order:
  intro
  stage1
  stage2
  stage3
  ending

STORY FLOW:

INTRO:
Neutral narrator tone (not Sun).
Introduce the sad fate of old rooster {{playerName}}, who might become fried chicken soon.
He decides to climb the barn one last time to feel alive again.

STAGE1:
Sun is friendly and teasing.
{{playerName}} successfully reaches the top and meets the hen.
Encourage him awkwardly.

STAGE2:
Right after that, he gets kicked off and falls.
Sun becomes toxic and makes fun of him for failing.

STAGE3:
He climbs again.
Sun mockingly praises his stubbornness and pushes him to prove himself.

ENDING:
He reaches the top again and successfully gets revenge.
Sun reluctantly praises him with sarcasm and jokes that maybe he won’t become KFC after all.
`;