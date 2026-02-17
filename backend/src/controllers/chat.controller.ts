import { Request, Response } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is missing in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
];

// Knowledge base
function getRelevantKnowledge(query: string): string {
    const lowerQuery = query.toLowerCase();
    let knowledge = '';

    if (lowerQuery.includes('plant') || lowerQuery.includes('grow') || lowerQuery.includes('tanim') || lowerQuery.includes('itanim') || lowerQuery.includes('seedling') || lowerQuery.includes('cutting')) {
        knowledge += 'PLANTING: Cut 12-18 inch branch, plant at 45° angle, 6 inches deep. Water daily first week. Roots in 7-14 days.\n';
    }
    if (lowerQuery.includes('harvest') || lowerQuery.includes('ani') || lowerQuery.includes('pag-aani') || lowerQuery.includes('pick') || lowerQuery.includes('putas')) {
        knowledge += 'HARVEST: Early morning 6-8 AM. When 1.5-2m tall. Every 2-4 weeks. Max 30% at once.\n';
    }
    if (lowerQuery.includes('disease') || lowerQuery.includes('yellow') || lowerQuery.includes('sakit') || lowerQuery.includes('dilaw') || lowerQuery.includes('sick') || lowerQuery.includes('problem')) {
        knowledge += 'YELLOW LEAVES: Usually overwatering or nitrogen deficiency. Check soil moisture first.\n';
    }
    if (lowerQuery.includes('price') || lowerQuery.includes('presyo') || lowerQuery.includes('sell') || lowerQuery.includes('bentahan') || lowerQuery.includes('cost') || lowerQuery.includes('magkano')) {
        knowledge += 'PRICES: Fresh leaves ₱50-80/bundle, Powder ₱120-200/100g, Capsules ₱250-400.\n';
    }
    if (lowerQuery.includes('nutrition') || lowerQuery.includes('vitamin') || lowerQuery.includes('benefit') || lowerQuery.includes('benepisyo') || lowerQuery.includes('healthy') || lowerQuery.includes('good for')) {
        knowledge += 'NUTRITION per 100g: Vit A 6,780μg, Vit C 51.7mg, Iron 4mg, Protein 9.4g. Boosts immunity, prevents anemia.\n';
    }
    if (lowerQuery.includes('water') || lowerQuery.includes('tubig') || lowerQuery.includes('dilig') || lowerQuery.includes('irrigat')) {
        knowledge += 'WATERING: Young plants every 2-3 days. Mature plants 1-2x per week. Drought tolerant. Better to underwater.\n';
    }
    if (lowerQuery.includes('fertilizer') || lowerQuery.includes('pataba') || lowerQuery.includes('compost') || lowerQuery.includes('manure') || lowerQuery.includes('abono')) {
        knowledge += 'FERTILIZER: Organic compost every 4-6 weeks (2-3kg/tree). Chicken manure every 2-3 months. 14-14-14 every 2 months (50-100g).\n';
    }
    if (lowerQuery.includes('pest') || lowerQuery.includes('insect') || lowerQuery.includes('kulisap') || lowerQuery.includes('bug') || lowerQuery.includes('aphid') || lowerQuery.includes('caterpillar')) {
        knowledge += 'PESTS: Aphids - spray neem oil. Caterpillars - hand pick or Bt pesticide. Inspect weekly.\n';
    }
    if (lowerQuery.includes('recipe') || lowerQuery.includes('cook') || lowerQuery.includes('luto') || lowerQuery.includes('lutuin') || lowerQuery.includes('eat') || lowerQuery.includes('food') || lowerQuery.includes('tinola')) {
        knowledge += 'RECIPES: Add leaves last 2 min in tinola. Sauté with eggs and garlic. Blend in smoothies. Mix powder in pandesal.\n';
    }

    return knowledge || 'General malunggay (moringa) cultivation and usage information for the Philippines.';
}

// ─── Keyword filter ────────────────────────────────────────────────────────────
// Purpose: only block messages that are CLEARLY unrelated with zero ambiguity.
// The AI handles everything else — we trust the system prompt for nuanced cases.
function isObviouslyOffTopic(query: string): boolean {
    const lowerQuery = query.toLowerCase();

    // Always allow greetings, thanks, farewells — these are conversational glue
    const conversational = [
        'hello', 'hi', 'hey', 'kumusta', 'kamusta', 'good morning', 'good afternoon',
        'good evening', 'magandang', 'thank', 'salamat', 'bye', 'goodbye', 'paalam',
        'ok', 'okay', 'sure', 'nice', 'great', 'wow', 'cool', 'ayos', 'sige',
        'oo', 'yes', 'no', 'yep', 'nope', 'got it', 'i see', 'understood',
        'tell me more', 'continue', 'go on', 'next', 'what else', 'ano pa',
    ];
    if (conversational.some(w => lowerQuery.includes(w))) return false;

    // Allow short follow-up messages (likely part of ongoing malunggay conversation)
    // e.g. "how often?", "what about seeds?", "and the leaves?"
    if (lowerQuery.split(' ').length <= 5) return false;

    // Allow anything that contains a malunggay/farming keyword
    const malunggayKeywords = [
        'malunggay', 'moringa', 'moringga', 'kamunggay',
        'dahon', 'leaves', 'leaf', 'tanim', 'plant', 'grow', 'harvest', 'ani',
        'seedling', 'cutting', 'supling', 'dilig', 'water', 'pataba', 'fertilizer',
        'compost', 'kulisap', 'pest', 'insect', 'aphid', 'disease', 'sakit',
        'yellow', 'dilaw', 'nutrition', 'vitamin', 'benefit', 'benepisyo',
        'presyo', 'price', 'sell', 'bentahan', 'recipe', 'cook', 'luto', 'tinola',
        'seed', 'buto', 'pods', 'powder', 'capsule', 'supplement', 'tea',
        'soil', 'lupa', 'prune', 'mulch', 'organic', 'negosyo', 'palengke',
        'kalusugan', 'anemia', 'superfood', 'pandesal', 'smoothie',
    ];
    if (malunggayKeywords.some(k => lowerQuery.includes(k))) return false;

    // Block ONLY if it matches clearly unrelated topic patterns
    const clearlyOffTopic = [
        // Politics & people
        /\bpresident\b/, /\bpolitics\b/, /\belection\b/, /\bgovernment\b/,
        /\bcelebrity\b/, /\bactor\b/, /\bsinger\b/, /\bnews\b/,
        // Geography & history (without farming context)
        /\bcapital city\b/, /\bcountry\b/, /what is (the )?(philippines|usa|japan)/,
        /\bworld war\b/, /\bhistory of\b/,
        // Tech & entertainment
        /\bphone\b/, /\blaptop\b/, /\bcomputer\b/, /\bgame\b/, /\bmovie\b/,
        /\bmusic\b/, /\bsocial media\b/, /\bfacebook\b/, /\btiktok\b/,
        // Math & random
        /\bmath\b/, /\bequation\b/, /\bcalculate\b/, /\bformula\b/,
        /who (am|are|is) (i|you|we|they)\b/,
        /what (am|are|is) (i|you|we|they)\b/,
    ];

    return clearlyOffTopic.some(pattern => pattern.test(lowerQuery));
}

// Off-topic response
function getOffTopicResponse(language: string): string {
    switch (language) {
        case 'tagalog':
            return 'Pasensya na! Ang aking kaalaman ay nakatuon lamang sa malunggay (moringa). Hindi ako makatulong sa paksang iyon. Maaari mo ba akong tanungin tungkol sa pagtatanim, pag-aani, kalusugan, o pagbebenta ng malunggay? 🌿';
        case 'taglish':
            return "Sorry! I'm only designed to answer questions about malunggay (moringa). Hindi ko ma-assist ang topic na iyon. Ask me about planting, harvesting, health benefits, o presyo ng malunggay! 🌿";
        case 'english':
        default:
            return "Sorry! I'm only designed to answer questions about malunggay (moringa). That topic is outside my expertise. Feel free to ask me about planting, harvesting, health benefits, or selling malunggay! 🌿";
    }
}

// System prompt
function buildSystemPrompt(knowledge: string, language: string): string {
    const languageInstructions: Record<string, string> = {
        english: `- Respond ONLY in English
- Be clear and professional but friendly
- Use simple terms a farmer can understand`,
        tagalog: `- Respond ONLY in Filipino/Tagalog
- Gamitin ang natural na Tagalog na madaling maintindihan ng mga magsasaka
- Iwasan ang sobrang formal na Tagalog`,
        taglish: `- Respond in Taglish (natural mix of Tagalog and English, the way Filipinos naturally speak)
- Example: "Para sa planting, kailangan mo ng 12-18 inch na cutting..."`,
    };

    const instruction = languageInstructions[language] || languageInstructions['taglish'];

    return `You are Molly, a friendly and knowledgeable chatbot for Filipino farmers, specializing EXCLUSIVELY in malunggay (moringa).

KNOWLEDGE BASE:
${knowledge}

YOUR PERSONALITY:
- Warm, encouraging, and conversational
- You remember the context of the conversation, so you can answer follow-up questions naturally
- Example: if the user just asked about planting malunggay and then asks "how often should I water it?" — you know they mean the malunggay they just asked about

STRICT TOPIC RULES:
1. You ONLY discuss malunggay (moringa) — cultivation, nutrition, recipes, diseases, pests, pricing, and farming.
2. If a question is clearly NOT about malunggay (e.g. politics, celebrities, geography, technology, other plants), respond with ONLY:
   "Sorry, I can only answer questions about malunggay! Feel free to ask me about planting, harvesting, nutrition, or selling malunggay 🌿"
3. Follow-up questions in an ongoing malunggay conversation (e.g. "how often?", "what about the leaves?", "is that expensive?") should be answered naturally — assume they refer to malunggay.
4. Short acknowledgments like "ok", "thanks", "i see", "got it" should get a brief, friendly response.
5. NEVER answer questions about presidents, countries, celebrities, technology, math, or general trivia.

LANGUAGE INSTRUCTIONS:
${instruction}

Keep answers helpful and concise (2-4 paragraphs max).`;
}

export const chat = async (req: Request, res: Response) => {
    try {
        const { message, history = [], language = 'taglish' } = req.body;

        if (!message) return res.status(400).json({ error: 'Message is required' });

        // Gate 1: Block only clearly off-topic messages
        if (isObviouslyOffTopic(message)) {
            return res.json({
                message: getOffTopicResponse(language),
                conversationId: req.body.conversationId || Date.now().toString()
            });
        }

        const knowledge = getRelevantKnowledge(message);
        const systemPrompt = buildSystemPrompt(knowledge, language);

        // Build history
        let chatHistory = history.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
            chatHistory = chatHistory.slice(1);
        }

        // Inject system prompt at start of every request so AI never forgets rules
        chatHistory = [
            { role: 'user',  parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Understood! I am Molly, your malunggay expert. I will answer all malunggay-related questions naturally and refuse anything off-topic.' }] },
            ...chatHistory
        ];

        let result;
        let lastError;

        for (const modelName of MODELS) {
            try {
                console.log(`Trying model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const chatSession = model.startChat({
                    history: chatHistory,
                    generationConfig: {
                        maxOutputTokens: 2000,
                        temperature: 0.5,
                    },
                });
                result = await chatSession.sendMessage(message);
                console.log(`Success with model: ${modelName}`);
                break;
            } catch (err: any) {
                lastError = err;
                console.warn(`Model ${modelName} failed with status ${err.status}: ${err.message}`);
                if (err.status === 503 || err.status === 429) continue;
                throw err;
            }
        }

        if (!result) throw lastError;

        res.json({
            message: result.response.text(),
            conversationId: req.body.conversationId || Date.now().toString()
        });

    } catch (error: any) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Chat failed', details: error.message });
    }
};