/**
 * AI Service — Gemini API wrapper with rule-based fallback
 * Provider can be swapped by changing this file only.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_KEY = process.env.GEMINI_API_KEY;

// System prompt that gives Gemini agricultural context
const SYSTEM_PROMPT = `You are AgriAI, an expert agricultural assistant for Indian farmers on the AgriBudget platform.
You specialize in:
- Crop selection, planting schedules, and harvesting advice
- Soil health, fertilizer recommendations, and pest/disease management
- Weather impact on farming and irrigation advice
- Farm financial planning: income, expenses, budgeting, profit optimization
- Market timing: when to sell crops for best prices
- Government schemes and subsidies for farmers

Guidelines:
- Always be practical and specific to Indian agriculture
- Give advice in simple, clear language a farmer can act on
- When financial data is provided, reference it in your advice
- Always recommend consulting local agricultural experts for critical decisions
- Mention limitations clearly: "This is AI-generated advice, not a substitute for expert consultation."
- Keep responses concise (3-5 sentences max per point) and actionable
- Use ₹ for currency, local crop names when relevant`;

let genAI = null;
let model = null;

function getModel() {
  if (!GEMINI_KEY) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_KEY);
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    });
  }
  return model;
}

/**
 * Rule-based fallback responses when Gemini is unavailable
 */
const RULE_BASED_RESPONSES = {
  yellow_leaves: "Yellowing leaves often indicate Nitrogen deficiency, waterlogging, or pest attack. Check soil drainage first. If soil is well-drained, apply Urea (46% N) at 20-25 kg/acre. If yellowing is on older leaves only, it's likely N-deficiency. If on new growth, check for iron/manganese deficiency. Consult your local KVK for a soil test.",
  irrigate: "Irrigation timing depends on the crop stage and soil type. For most crops: irrigate when topsoil (6 inches) feels dry. Use the thumb test — press soil; if it crumbles, irrigate. Wheat needs irrigation at tillering, jointing, and grain fill stages. For drip/sprinkler, aim for 60-70% field capacity. Avoid watering in peak afternoon heat.",
  fertilizer: "Fertilizer recommendations by crop: Wheat: 120-60-40 kg NPK/ha. Rice: 100-50-50 kg NPK/ha. Cotton: 100-50-50 kg NPK/ha. Always split N application — 50% basal, 50% top-dress. Get a soil test from your nearest Krishi Vigyan Kendra for customized recommendations.",
  sell: "Market timing depends on current mandi prices and your storage capacity. Generally, prices are lowest right after harvest (Oct-Nov for kharif crops) and rise 15-25% by Feb-March. If you have dry storage, holding 30-50% of your produce for 3-4 months often improves profit. Check your nearest APMC mandi rates daily.",
  disease: "If you suspect crop disease, upload a photo in the Disease Detection section for AI analysis. Generally: remove and destroy affected plant parts, avoid overhead irrigation, apply appropriate fungicide/pesticide based on the disease. Always consult your agriculture extension officer before chemical application.",
  default: "I'm here to help with your farming questions. You can ask me about crop selection, fertilizers, irrigation, pest management, market timing, or farm budgeting. For the most accurate advice, please share your crop type, location, and current crop stage."
};

function getRuleBasedResponse(message) {
  const msg = message.toLowerCase();
  if (msg.includes('yellow') || msg.includes('पीला')) return RULE_BASED_RESPONSES.yellow_leaves;
  if (msg.includes('irrigat') || msg.includes('water') || msg.includes('सिंचाई')) return RULE_BASED_RESPONSES.irrigate;
  if (msg.includes('fertiliz') || msg.includes('खाद') || msg.includes('urea') || msg.includes('npk')) return RULE_BASED_RESPONSES.fertilizer;
  if (msg.includes('sell') || msg.includes('price') || msg.includes('market') || msg.includes('बेचना')) return RULE_BASED_RESPONSES.sell;
  if (msg.includes('disease') || msg.includes('pest') || msg.includes('रोग')) return RULE_BASED_RESPONSES.disease;
  return RULE_BASED_RESPONSES.default;
}

/**
 * Build context string from farmer's financial/crop data
 */
function buildContext(farmerContext = {}) {
  const parts = [];
  if (farmerContext.crop) parts.push(`Current crop: ${farmerContext.crop}`);
  if (farmerContext.location) parts.push(`Location: ${farmerContext.location}`);
  if (farmerContext.season) parts.push(`Season: ${farmerContext.season}`);
  if (farmerContext.totalExpenses) parts.push(`Total farm expenses this season: ₹${farmerContext.totalExpenses}`);
  if (farmerContext.totalIncome) parts.push(`Total farm income this season: ₹${farmerContext.totalIncome}`);
  if (farmerContext.budget) parts.push(`Planned budget: ₹${farmerContext.budget}`);
  return parts.length ? `\n\nFarmer context:\n${parts.join('\n')}` : '';
}

/**
 * Main chat function
 * @param {string} message - farmer's question
 * @param {Array} history - [{role, content}] previous messages
 * @param {Object} farmerContext - {crop, location, season, totalExpenses, totalIncome, budget}
 * @returns {Promise<{response: string, source: string}>}
 */
export async function chat(message, history = [], farmerContext = {}) {
  const aiModel = getModel();
  
  if (!aiModel) {
    // Fallback to rule-based
    return {
      response: getRuleBasedResponse(message),
      source: 'rule-based'
    };
  }

  try {
    const contextStr = buildContext(farmerContext);

    // Build chat history for Gemini
    const chatHistory = history.slice(-10).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Append farm context to the message itself
    const messageWithContext = contextStr
      ? `${message}\n\n[My farm context: ${contextStr.replace('\n\nFarmer context:\n', '').trim()}]`
      : message;

    const chat = aiModel.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(messageWithContext);
    const responseText = result.response.text();

    return { response: responseText, source: 'gemini' };
  } catch (err) {
    console.error('Gemini API error:', err.message);
    // Graceful fallback
    return {
      response: getRuleBasedResponse(message) + '\n\n*(AI service temporarily unavailable — using built-in knowledge base)*',
      source: 'rule-based-fallback'
    };
  }
}
