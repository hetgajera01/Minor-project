/**
 * Disease Detection Service
 * PRIMARY:  Gemini Vision API — real AI image analysis (no local model needed)
 * FALLBACK: Python ML service (image classification) if Gemini fails
 * LAST:     Rule-based placeholder result
 *
 * IMPORTANT: Never claims certainty. All results include a disclaimer.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// ── Gemini Vision Setup ─────────────────────────────────────────────────────
let genAI = null;
let visionModel = null;

function getVisionModel() {
  if (!GEMINI_KEY) {
    console.warn('[diseaseService] GEMINI_API_KEY not set — disease detection will use fallback');
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_KEY);
    visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
  return visionModel;
}

// ── Disease knowledge base (for enriching Gemini output) ──────────────────
const DISEASE_DB = {
  "Early Blight": {
    crop: "Tomato",
    symptoms: ["Dark brown spots with concentric rings on older leaves", "Yellow halo around spots", "Leaves turn yellow and drop"],
    causes: ["Fungal pathogen Alternaria solani", "Warm, humid conditions", "Poor plant spacing"],
    prevention: ["Use certified disease-free seeds", "Maintain proper plant spacing for air circulation", "Avoid overhead irrigation"],
    treatment: ["Remove and destroy affected leaves", "Apply Mancozeb (75% WP) at 2g/litre", "Spray Chlorothalonil fungicide every 7-10 days"],
    nextSteps: ["Monitor plant daily for spread", "Consult local agriculture officer if spread continues", "Improve drainage and reduce humidity"],
  },
  "Late Blight": {
    crop: "Potato/Tomato",
    symptoms: ["Water-soaked spots on leaves that turn dark brown", "White fungal growth under leaves in humid conditions", "Rapid plant collapse"],
    causes: ["Fungal-like pathogen Phytophthora infestans", "Cool, wet weather", "High humidity above 90%"],
    prevention: ["Plant resistant varieties", "Avoid planting in low-lying areas", "Ensure good air circulation"],
    treatment: ["Spray Metalaxyl + Mancozeb at 2.5g/litre", "Remove and burn infected plant material", "Apply copper-based fungicides as preventive"],
    nextSteps: ["Act immediately — late blight spreads very fast", "Harvest if crop is mature enough", "Report to local KVK for area-wide management"],
  },
  "Yellow Mosaic": {
    crop: "Soybean/Legumes",
    symptoms: ["Yellow-green mosaic pattern on leaves", "Leaf curling and distortion", "Stunted plant growth"],
    causes: ["Bean Yellow Mosaic Virus (BYMV)", "Spread by aphids and whiteflies", "Infected seed material"],
    prevention: ["Use virus-free certified seeds", "Control aphid/whitefly vectors with imidacloprid", "Remove and destroy infected plants early"],
    treatment: ["No cure for viral disease — remove infected plants", "Spray insecticides to control insect vectors", "Spray mineral oil (2%) to reduce virus spread"],
    nextSteps: ["Isolate affected area", "Consult extension officer for vector control", "Consider resistant varieties next season"],
  },
  "Powdery Mildew": {
    crop: "General",
    symptoms: ["White powdery coating on leaves and stems", "Yellowing of affected tissue", "Premature leaf drop"],
    causes: ["Various Erysiphe fungi species", "Warm days with cool nights", "Overcrowding reducing air flow"],
    prevention: ["Maintain proper plant spacing", "Avoid excess nitrogen fertilization", "Choose resistant varieties"],
    treatment: ["Spray Sulphur dust or wettable sulphur (3g/litre)", "Apply Hexaconazole (0.1%) or Propiconazole", "Neem oil spray (5ml/litre) as organic option"],
    nextSteps: ["Improve plant spacing and pruning", "Reduce irrigation frequency", "Monitor weekly and re-spray if needed"],
  },
  "Leaf Rust": {
    crop: "Wheat",
    symptoms: ["Orange-brown pustules on leaves and stems", "Pustules rupture to release rusty spores", "Leaves turn yellow, dry, and die"],
    causes: ["Puccinia fungi species", "Cool temperatures (15-22°C) with high humidity", "Presence of infected crop residue"],
    prevention: ["Grow rust-resistant wheat varieties", "Avoid late sowing", "Remove and burn crop residue after harvest"],
    treatment: ["Apply Propiconazole (0.1%) or Tebuconazole at first sign", "Spray Mancozeb (75% WP) at 2.5g/litre", "Repeat spray after 15 days if needed"],
    nextSteps: ["Monitor field regularly from tillering stage", "Alert neighboring farmers for coordinated control", "Report severe outbreaks to local agriculture department"],
  },
  "Bacterial Leaf Blight": {
    crop: "Rice",
    symptoms: ["Water-soaked lesions at leaf margins", "Lesions turn yellow then white-grey", "Leaves wilt and dry from tip"],
    causes: ["Bacterium Xanthomonas oryzae", "High humidity and warm temperatures", "Wounds from wind or insects"],
    prevention: ["Use resistant rice varieties", "Avoid excess nitrogen fertilization", "Ensure proper field drainage"],
    treatment: ["Spray Copper Oxychloride (3g/litre)", "Apply Streptomycin sulfate (0.5g/10L)", "Remove and burn severely infected plants"],
    nextSteps: ["Drain field if possible", "Avoid overhead irrigation", "Consult KVK for varietal recommendations"],
  },
  "Anthracnose": {
    crop: "General",
    symptoms: ["Dark, sunken lesions on leaves and fruits", "Lesion edges turn reddish-brown", "Fruit rot in advanced stages"],
    causes: ["Colletotrichum fungal species", "Warm, wet weather", "Infected seeds or plant debris"],
    prevention: ["Use disease-free seeds", "Practice crop rotation", "Remove infected plant debris"],
    treatment: ["Spray Mancozeb or Carbendazim", "Apply Copper-based fungicides", "Remove and destroy infected plant parts"],
    nextSteps: ["Avoid overhead irrigation", "Ensure proper air circulation", "Consult extension officer for severe cases"],
  },
  "Healthy": {
    crop: "General",
    symptoms: [],
    causes: [],
    prevention: ["Continue current farming practices", "Maintain regular crop monitoring", "Follow balanced fertilization schedule"],
    treatment: [],
    nextSteps: ["Schedule regular field inspections", "Continue preventive spraying as per crop calendar"],
  },
};

// ── Gemini Vision Disease Detection ────────────────────────────────────────
const DISEASE_DETECTION_PROMPT = `You are an expert plant pathologist AI assistant for Indian farmers.
Analyze this crop leaf image and detect any disease.

Respond ONLY with a valid JSON object in this exact format (no markdown, no explanation outside JSON):
{
  "detectedCrop": "crop name (e.g. Tomato, Wheat, Rice, Potato, Soybean, or Unknown)",
  "disease": "disease name (e.g. Early Blight, Late Blight, Leaf Rust, Healthy, or specific disease name)",
  "isHealthy": true or false,
  "confidence": number between 0 and 100,
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "causes": ["cause 1", "cause 2"],
  "prevention": ["prevention tip 1", "prevention tip 2", "prevention tip 3"],
  "treatment": ["treatment step 1", "treatment step 2", "treatment step 3"],
  "nextSteps": ["next step 1", "next step 2"],
  "severity": "Low" or "Medium" or "High"
}

Rules:
- If the image is not a plant/leaf, set disease to "Not a plant image" and confidence to 0
- If the leaf appears healthy, set isHealthy to true and disease to "Healthy"
- Be specific about the disease name used in India
- All treatment recommendations must use products available in India
- confidence should reflect how clearly you can see the disease (higher = clearer image + more obvious disease)`;

async function geminiVisionDetect(imagePath) {
  const model = getVisionModel();
  if (!model) return null;

  try {
    const imageBytes = fs.readFileSync(imagePath);
    const base64Image = imageBytes.toString("base64");
    const ext = imagePath.split(".").pop().toLowerCase();
    const mimeType = ext === "jpg" || ext === "jpeg" ? "image/jpeg"
                   : ext === "png" ? "image/png"
                   : ext === "webp" ? "image/webp"
                   : "image/jpeg";

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { text: DISEASE_DETECTION_PROMPT },
          { inlineData: { data: base64Image, mimeType } },
        ],
      }],
    });

    const text = result.response.text().trim();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in Gemini response");

    const parsed = JSON.parse(jsonMatch[0]);

    // Enrich with local disease DB data if we have it
    const dbEntry = DISEASE_DB[parsed.disease];
    if (dbEntry) {
      parsed.symptoms  = parsed.symptoms?.length  ? parsed.symptoms  : dbEntry.symptoms;
      parsed.causes    = parsed.causes?.length    ? parsed.causes    : dbEntry.causes;
      parsed.prevention= parsed.prevention?.length? parsed.prevention: dbEntry.prevention;
      parsed.treatment = parsed.treatment?.length ? parsed.treatment : dbEntry.treatment;
      parsed.nextSteps = parsed.nextSteps?.length ? parsed.nextSteps : dbEntry.nextSteps;
    }

    return {
      ...parsed,
      source: "gemini-vision",
      disclaimer: "AI-assisted analysis. Always confirm with your local agricultural extension officer (KVK) before taking action.",
    };
  } catch (err) {
    console.error("[diseaseService] Gemini Vision error:", err.message);
    return null;
  }
}

// ── Python ML Service Fallback ──────────────────────────────────────────────
async function mlDetect(imagePath) {
  try {
    const form = new FormData();
    form.append("image", fs.createReadStream(imagePath));
    const res = await axios.post(`${ML_SERVICE_URL}/detect-disease`, form, {
      headers: form.getHeaders(),
      timeout: 10000,
    });
    if (res.data && res.data.confidence > 0) {
      return { ...res.data, source: "python-ml-model" };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Rule-based last resort ──────────────────────────────────────────────────
function ruleBasedResult() {
  return {
    detectedCrop: "Unknown",
    disease: "Unable to detect — upload a clearer image",
    confidence: 0,
    isHealthy: false,
    symptoms: ["Ensure the leaf fills most of the image frame", "Use good lighting for better detection"],
    causes: [],
    prevention: DISEASE_DB["Powdery Mildew"].prevention,
    treatment: [],
    nextSteps: ["Consult your local agricultural extension officer", "Bring a physical sample to your nearest KVK"],
    source: "rule-based-placeholder",
    disclaimer: "AI disease analysis unavailable. Please configure GEMINI_API_KEY in backend/.env or consult a local agricultural expert.",
  };
}

// ── Main export ────────────────────────────────────────────────────────────
/**
 * Detect crop disease from an image file path.
 * Priority: Gemini Vision → Python ML → Rule-based
 */
export async function detectDisease(imagePath) {
  // 1. Try Gemini Vision (primary — works without any local model)
  const geminiResult = await geminiVisionDetect(imagePath);
  if (geminiResult && geminiResult.confidence > 0) return geminiResult;

  // 2. Try Python ML service
  const mlResult = await mlDetect(imagePath);
  if (mlResult) return mlResult;

  // 3. Rule-based placeholder
  return ruleBasedResult();
}

/**
 * Get disease info by name (for manual lookup)
 */
export function getDiseaseInfo(diseaseName) {
  return DISEASE_DB[diseaseName] || null;
}
