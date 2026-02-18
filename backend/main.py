"""
NutriLeaf Malunggay Chatbot Backend - Python FastAPI
Replaces the Node.js/Express backend with identical API interface
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import os
import re
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ─── Configuration ───────────────────────────────────────────────────────────
app = FastAPI(title="NutriLeaf Malunggay Chatbot API")

# CORS - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Google AI configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable is required")

genai.configure(api_key=GOOGLE_API_KEY)

# Fallback model list
MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
]

# ─── Request/Response Models ─────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    language: str = "taglish"
    conversationId: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    conversationId: str

# ─── Knowledge Base ──────────────────────────────────────────────────────────
def get_relevant_knowledge(query: str) -> str:
    """Extract relevant malunggay knowledge based on query keywords"""
    lower_query = query.lower()
    knowledge = []

    if any(kw in lower_query for kw in ['plant', 'grow', 'tanim', 'itanim', 'seedling', 'cutting']):
        knowledge.append('PLANTING: Cut 12-18 inch branch, plant at 45° angle, 6 inches deep. Water daily first week. Roots in 7-14 days.')
    
    if any(kw in lower_query for kw in ['harvest', 'ani', 'pag-aani', 'pick', 'putas']):
        knowledge.append('HARVEST: Early morning 6-8 AM. When 1.5-2m tall. Every 2-4 weeks. Max 30% at once.')
    
    if any(kw in lower_query for kw in ['disease', 'yellow', 'sakit', 'dilaw', 'sick', 'problem']):
        knowledge.append('YELLOW LEAVES: Usually overwatering or nitrogen deficiency. Check soil moisture first.')
    
    if any(kw in lower_query for kw in ['price', 'presyo', 'sell', 'bentahan', 'cost', 'magkano']):
        knowledge.append('PRICES: Fresh leaves ₱50-80/bundle, Powder ₱120-200/100g, Capsules ₱250-400.')
    
    if any(kw in lower_query for kw in ['nutrition', 'vitamin', 'benefit', 'benepisyo', 'healthy', 'good for']):
        knowledge.append('NUTRITION per 100g: Vit A 6,780μg, Vit C 51.7mg, Iron 4mg, Protein 9.4g. Boosts immunity, prevents anemia.')
    
    if any(kw in lower_query for kw in ['water', 'tubig', 'dilig', 'irrigat']):
        knowledge.append('WATERING: Young plants every 2-3 days. Mature plants 1-2x per week. Drought tolerant. Better to underwater.')
    
    if any(kw in lower_query for kw in ['fertilizer', 'pataba', 'compost', 'manure', 'abono']):
        knowledge.append('FERTILIZER: Organic compost every 4-6 weeks (2-3kg/tree). Chicken manure every 2-3 months. 14-14-14 every 2 months (50-100g).')
    
    if any(kw in lower_query for kw in ['pest', 'insect', 'kulisap', 'bug', 'aphid', 'caterpillar']):
        knowledge.append('PESTS: Aphids - spray neem oil. Caterpillars - hand pick or Bt pesticide. Inspect weekly.')
    
    if any(kw in lower_query for kw in ['recipe', 'cook', 'luto', 'lutuin', 'eat', 'food', 'tinola']):
        knowledge.append('RECIPES: Add leaves last 2 min in tinola. Sauté with eggs and garlic. Blend in smoothies. Mix powder in pandesal.')

    return '\n'.join(knowledge) if knowledge else 'General malunggay (moringa) cultivation and usage information for the Philippines.'

# ─── Topic Filter ────────────────────────────────────────────────────────────
def is_obviously_off_topic(query: str) -> bool:
    """
    Loose filter - only block clearly unrelated messages.
    Let the AI handle everything else via system prompt.
    """
    lower_query = query.lower()

    # Always allow conversational messages
    conversational = [
        'hello', 'hi', 'hey', 'kumusta', 'kamusta', 'good morning', 'good afternoon',
        'good evening', 'magandang', 'thank', 'salamat', 'bye', 'goodbye', 'paalam',
        'ok', 'okay', 'sure', 'nice', 'great', 'wow', 'cool', 'ayos', 'sige',
        'oo', 'yes', 'no', 'yep', 'nope', 'got it', 'i see', 'understood',
        'tell me more', 'continue', 'go on', 'next', 'what else', 'ano pa',
    ]
    if any(w in lower_query for w in conversational):
        return False

    # Allow short follow-up messages (likely part of ongoing conversation)
    if len(lower_query.split()) <= 5:
        return False

    # Allow anything with malunggay/farming keywords
    malunggay_keywords = [
        'malunggay', 'moringa', 'moringga', 'kamunggay',
        'dahon', 'leaves', 'leaf', 'tanim', 'plant', 'grow', 'harvest', 'ani',
        'seedling', 'cutting', 'supling', 'dilig', 'water', 'pataba', 'fertilizer',
        'compost', 'kulisap', 'pest', 'insect', 'aphid', 'disease', 'sakit',
        'yellow', 'dilaw', 'nutrition', 'vitamin', 'benefit', 'benepisyo',
        'presyo', 'price', 'sell', 'bentahan', 'recipe', 'cook', 'luto', 'tinola',
        'seed', 'buto', 'pods', 'powder', 'capsule', 'supplement', 'tea',
        'soil', 'lupa', 'prune', 'mulch', 'organic', 'negosyo', 'palengke',
        'kalusugan', 'anemia', 'superfood', 'pandesal', 'smoothie',
    ]
    if any(kw in lower_query for kw in malunggay_keywords):
        return False

    # Block clearly unrelated patterns
    off_topic_patterns = [
        r'\bpresident\b', r'\bpolitics\b', r'\belection\b', r'\bgovernment\b',
        r'\bcelebrity\b', r'\bactor\b', r'\bsinger\b', r'\bnews\b',
        r'\bcapital city\b', r'\bcountry\b', r'what is (the )?(philippines|usa|japan)',
        r'\bworld war\b', r'\bhistory of\b',
        r'\bphone\b', r'\blaptop\b', r'\bcomputer\b', r'\bgame\b', r'\bmovie\b',
        r'\bmusic\b', r'\bsocial media\b', r'\bfacebook\b', r'\btiktok\b',
        r'\bmath\b', r'\bequation\b', r'\bcalculate\b', r'\bformula\b',
        r'who (am|are|is) (i|you|we|they)\b',
        r'what (am|are|is) (i|you|we|they)\b',
    ]
    
    return any(re.search(pattern, lower_query) for pattern in off_topic_patterns)

# ─── Response Generators ─────────────────────────────────────────────────────
def get_off_topic_response(language: str) -> str:
    """Generate off-topic response in the requested language"""
    responses = {
        'tagalog': 'Pasensya na! Ang aking kaalaman ay nakatuon lamang sa malunggay (moringa). Hindi ako makatulong sa paksang iyon. Maaari mo ba akong tanungin tungkol sa pagtatanim, pag-aani, kalusugan, o pagbebenta ng malunggay? 🌿',
        'taglish': "Sorry! I'm only designed to answer questions about malunggay (moringa). Hindi ko ma-assist ang topic na iyon. Ask me about planting, harvesting, health benefits, o presyo ng malunggay! 🌿",
        'english': "Sorry! I'm only designed to answer questions about malunggay (moringa). That topic is outside my expertise. Feel free to ask me about planting, harvesting, health benefits, or selling malunggay! 🌿"
    }
    return responses.get(language, responses['taglish'])

def build_system_prompt(knowledge: str, language: str) -> str:
    """Build system prompt with knowledge base and language instructions"""
    language_instructions = {
        'english': """- Respond ONLY in English
- Be clear and professional but friendly
- Use simple terms a farmer can understand""",
        'tagalog': """- Respond ONLY in Filipino/Tagalog
- Gamitin ang natural na Tagalog na madaling maintindihan ng mga magsasaka
- Iwasan ang sobrang formal na Tagalog""",
        'taglish': """- Respond in Taglish (natural mix of Tagalog and English, the way Filipinos naturally speak)
- Example: "Para sa planting, kailangan mo ng 12-18 inch na cutting..." """
    }
    
    instruction = language_instructions.get(language, language_instructions['taglish'])
    
    return f"""You are Molly, a friendly and knowledgeable chatbot for Filipino farmers, specializing EXCLUSIVELY in malunggay (moringa).

KNOWLEDGE BASE:
{knowledge}

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
{instruction}

Keep answers helpful and concise (2-4 paragraphs max)."""

# ─── API Endpoints ───────────────────────────────────────────────────────────
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "NutriLeaf Malunggay Chatbot API",
        "version": "1.0.0",
        "message": "API is running. Use POST /api/chat to interact with Molly."
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint - identical interface to Node.js version
    Frontend can switch by just changing the API URL
    """
    try:
        if not request.message:
            raise HTTPException(status_code=400, detail="Message is required")

        # Gate 1: Block clearly off-topic messages
        if is_obviously_off_topic(request.message):
            return ChatResponse(
                message=get_off_topic_response(request.language),
                conversationId=request.conversationId or str(int(datetime.now().timestamp() * 1000))
            )

        # Get relevant knowledge and build prompt
        knowledge = get_relevant_knowledge(request.message)
        system_prompt = build_system_prompt(knowledge, request.language)

        # Convert history to Gemini format
        chat_history = []
        for msg in request.history:
            role = 'model' if msg.role == 'assistant' else 'user'
            chat_history.append({
                'role': role,
                'parts': [{'text': msg.content}]
            })

        # Remove first message if it's from model (Gemini requires user-first)
        if chat_history and chat_history[0]['role'] == 'model':
            chat_history = chat_history[1:]

        # Inject system prompt at start of every request
        chat_history = [
            {'role': 'user', 'parts': [{'text': system_prompt}]},
            {'role': 'model', 'parts': [{'text': 'Understood! I am Molly, your malunggay expert. I will answer all malunggay-related questions naturally and refuse anything off-topic.'}]},
            *chat_history
        ]

        # Try models with fallback
        result = None
        last_error = None

        for model_name in MODELS:
            try:
                print(f"Trying model: {model_name}")
                model = genai.GenerativeModel(model_name)
                
                chat = model.start_chat(history=chat_history)
                response = chat.send_message(
                    request.message,
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=2000,
                        temperature=0.5,
                    )
                )
                
                result = response.text
                print(f"Success with model: {model_name}")
                break

            except Exception as err:
                last_error = err
                error_msg = str(err)
                print(f"Model {model_name} failed: {error_msg}")
                
                # Check if it's a retryable error (503 or 429)
                if '503' in error_msg or '429' in error_msg or 'overloaded' in error_msg.lower():
                    continue
                raise err

        if result is None:
            raise last_error or Exception("All models failed")

        return ChatResponse(
            message=result,
            conversationId=request.conversationId or str(int(datetime.now().timestamp() * 1000))
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

# ─── Run with: uvicorn main:app --reload --port 5000 ───────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)