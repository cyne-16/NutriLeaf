import { Request, Response } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure API key exists
if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is missing in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Fallback model list - tries in order if one fails
const MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
];

// Knowledge base
function getRelevantKnowledge(query: string): string {
    const lowerQuery = query.toLowerCase();
    let knowledge = '';

    if (lowerQuery.includes('plant') || lowerQuery.includes('grow') || lowerQuery.includes('tanim') || lowerQuery.includes('itanim')) {
        knowledge += 'PLANTING: Cut 12-18 inch branch, plant at 45° angle, 6 inches deep. Water daily first week. Roots in 7-14 days.\n';
    }
    if (lowerQuery.includes('harvest') || lowerQuery.includes('ani') || lowerQuery.includes('pag-aani')) {
        knowledge += 'HARVEST: Early morning 6-8 AM. When 1.5-2m tall. Every 2-4 weeks. Max 30% at once.\n';
    }
    if (lowerQuery.includes('disease') || lowerQuery.includes('yellow') || lowerQuery.includes('sakit') || lowerQuery.includes('dilaw')) {
        knowledge += 'YELLOW LEAVES: Usually overwatering or nitrogen deficiency. Check soil moisture first.\n';
    }
    if (lowerQuery.includes('price') || lowerQuery.includes('presyo') || lowerQuery.includes('sell') || lowerQuery.includes('bentahan')) {
        knowledge += 'PRICES: Fresh leaves ₱50-80/bundle, Powder ₱120-200/100g, Capsules ₱250-400.\n';
    }
    if (lowerQuery.includes('nutrition') || lowerQuery.includes('vitamin') || lowerQuery.includes('benefit') || lowerQuery.includes('benepisyo')) {
        knowledge += 'NUTRITION per 100g: Vit A 6,780μg, Vit C 51.7mg, Iron 4mg, Protein 9.4g. Boosts immunity, prevents anemia.\n';
    }
    if (lowerQuery.includes('water') || lowerQuery.includes('tubig') || lowerQuery.includes('dilig')) {
        knowledge += 'WATERING: Young plants every 2-3 days. Mature plants 1-2x per week. Drought tolerant. Better to underwater.\n';
    }
    if (lowerQuery.includes('fertilizer') || lowerQuery.includes('pataba') || lowerQuery.includes('compost')) {
        knowledge += 'FERTILIZER: Organic compost every 4-6 weeks (2-3kg/tree). Chicken manure every 2-3 months. 14-14-14 every 2 months (50-100g).\n';
    }
    if (lowerQuery.includes('pest') || lowerQuery.includes('insect') || lowerQuery.includes('kulisap')) {
        knowledge += 'PESTS: Aphids - spray neem oil. Caterpillars - hand pick or Bt pesticide. Inspect weekly.\n';
    }
    if (lowerQuery.includes('recipe') || lowerQuery.includes('cook') || lowerQuery.includes('luto') || lowerQuery.includes('lutuin')) {
        knowledge += 'RECIPES: Add leaves last 2 min in tinola. Sauté with eggs and garlic. Blend in smoothies. Mix powder in pandesal.\n';
    }

    return knowledge || 'General malunggay (moringa) cultivation and usage information for the Philippines.';
}

// Detect if query is related to malunggay/moringa
function isMalunggayRelated(query: string): boolean {
    const lowerQuery = query.toLowerCase();

    // Always allow greetings and farewells
    const greetings = [
        'hello', 'hi', 'hey', 'kumusta', 'kamusta', 'good morning', 'good afternoon',
        'good evening', 'magandang', 'thank', 'salamat', 'bye', 'goodbye', 'paalam'
    ];
    if (greetings.some(g => lowerQuery.includes(g))) return true;

    // Malunggay-related keywords (English, Tagalog, scientific)
    const malunggayKeywords = [
        'malunggay', 'moringa', 'moringga', 'kamunggay', 'marongay',
        'dahon', 'leaves', 'leaf', 'seed', 'buto', 'pods', 'bunga', 'roots', 'ugat',
        'branch', 'sanga', 'bark', 'balat', 'flower', 'bulaklak', 'stem', 'tangkay',
        'plant', 'grow', 'tanim', 'itanim', 'harvest', 'ani', 'pag-aani', 'prune',
        'water', 'dilig', 'tubig', 'fertilize', 'pataba', 'compost', 'mulch',
        'propagate', 'cutting', 'supling', 'seedling',
        'disease', 'sakit', 'pest', 'insect', 'kulisap', 'yellow', 'dilaw', 'wilt',
        'rot', 'bulok', 'fungus', 'blight', 'aphid', 'caterpillar',
        'nutrition', 'vitamin', 'benefit', 'benepisyo', 'protein', 'iron', 'calcium',
        'superfood', 'health', 'kalusugan', 'immunity', 'anemia',
        'sell', 'buy', 'price', 'presyo', 'market', 'palengke', 'business', 'negosyo',
        'profit', 'kita', 'income', 'organic', 'capsule', 'powder', 'supplement',
        'cook', 'luto', 'lutuin', 'recipe', 'resipe', 'tinola', 'gisa',
        'smoothie', 'tea', 'tsaa', 'pandesal', 'food', 'pagkain',
        'soil', 'lupa', 'sand', 'buhangin', 'clay', 'fertilizer', 'sunlight', 'araw',
        'rain', 'ulan', 'drought', 'tagtuyot', 'season', 'panahon',
    ];

    return malunggayKeywords.some(keyword => lowerQuery.includes(keyword));
}

// Get off-topic response based on language
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

// Build system prompt based on language
function buildSystemPrompt(knowledge: string, language: string): string {
    const languageInstructions: Record<string, string> = {
        english: `- Respond ONLY in English
- Be clear and professional
- Use simple terms a farmer can understand`,
        tagalog: `- Respond ONLY in Filipino/Tagalog
- Gamitin ang natural na Tagalog na madaling maintindihan ng mga magsasaka
- Iwasan ang sobrang formal na Tagalog`,
        taglish: `- Respond in Taglish (natural mix of Tagalog and English)
- Mix English and Tagalog naturally the way Filipinos speak
- Example: "Para sa planting, kailangan mo ng 12-18 inch na cutting..."`,
    };

    const instruction = languageInstructions[language] || languageInstructions['taglish'];

    return `You are NutriLeaf, an expert agricultural assistant specializing EXCLUSIVELY in malunggay (moringa) cultivation, nutrition, and usage in the Philippines.

Knowledge Base:
${knowledge}

STRICT RULES:
1. You ONLY answer questions about malunggay/moringa. If the user asks about anything else (other crops, animals, general topics, politics, technology, etc.), politely decline and redirect them to malunggay topics.
2. Never provide information outside of malunggay cultivation, nutrition, recipes, diseases, pests, pricing, or farming practices.
3. Always use the knowledge base to ensure accuracy.
4. Be conversational, warm, and encouraging to Filipino farmers.
5. Give specific steps, measurements, and costs in Philippine pesos (₱) when relevant.
6. Keep answers helpful but concise (2-4 paragraphs).

LANGUAGE INSTRUCTIONS:
${instruction}

You are a helpful malunggay expert. Stay on topic at all times.`;
}

export const chat = async (req: Request, res: Response) => {
    try {
        const { message, history = [], language = 'taglish' } = req.body;

        if (!message) return res.status(400).json({ error: 'Message is required' });

        // Check if message is malunggay-related
        if (!isMalunggayRelated(message)) {
            return res.json({
                message: getOffTopicResponse(language),
                conversationId: req.body.conversationId || Date.now().toString()
            });
        }

        const knowledge = getRelevantKnowledge(message);
        const systemPrompt = buildSystemPrompt(knowledge, language);

        // Convert history to Gemini format
        let chatHistory = history.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Ensure first message is user
        if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
            chatHistory = chatHistory.slice(1);
        }

        // Inject system prompt for new conversation
        if (chatHistory.length === 0) {
            chatHistory.push({
                role: 'user',
                parts: [{ text: systemPrompt }]
            });
            chatHistory.push({
                role: 'model',
                parts: [{ text: 'Understood! I am NutriLeaf, your malunggay expert. I will only answer questions about malunggay and respond in the requested language.' }]
            });
        }

        // Try each model in order, fallback on 503 or 429
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
                        temperature: 0.7,
                    },
                });
                result = await chatSession.sendMessage(message);
                console.log(`Success with model: ${modelName}`);
                break;
            } catch (err: any) {
                lastError = err;
                console.warn(`Model ${modelName} failed with status ${err.status}: ${err.message}`);
                if (err.status === 503 || err.status === 429) {
                    continue; // try next model
                }
                throw err; // non-retryable error
            }
        }

        if (!result) throw lastError;

        const responseText = result.response.text();

        res.json({
            message: responseText,
            conversationId: req.body.conversationId || Date.now().toString()
        });

    } catch (error: any) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Chat failed', details: error.message });
    }
};