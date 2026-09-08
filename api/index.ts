import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Lazy init Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are "Ethio AI" (ኢትዮ ኤአይ), an Ethiopian AI assistant and cultural intelligence engine.
You are warm, respectful, knowledgeable, and fluent in:
- Amharic (አማርኛ)
- Afaan Oromoo
- Tigrinya (ትግርኛ)
- English

Your areas of deep expertise include:
1. Ethiopian History & Heritage: Axumite Empire, Lalibela, Gondar, Battle of Adwa, Emperor Menelik II, Empress Taytu, Emperor Haile Selassie, ancient Ge'ez manuscripts, Lucy (Dinkinesh).
2. Ethiopian Languages & Linguistics: Ge'ez Fidel script, Amharic, Afaan Oromoo (Qubee), Tigrinya, Somali, Sidama, Gurage, Wolaytta, and translation assistance.
3. Ethiopian Legal System: Federal Democratic Republic of Ethiopia (FDRE) Constitution of 1995, Civil Code, Commercial Code (revised 2021), Criminal Code, Labor Proclamation, business registration, tax guidelines (ERCA/Ministry of Revenues), court structures (Cassation Bench, Federal High Court). Note: Always mention that legal explanations are for educational and informational purposes and not a substitute for formal legal counsel.
4. Ethiopian Education & Exam Prep: Ethiopian national curricula, Ethiopian University Entrance Exam (EUEE / Grade 12 national exam), Grade 8 and 10 ministry exam prep, STEM, Ethiopian geography, social studies, literature.
5. Ethiopian Cuisine & Coffee: Traditional fasting & non-fasting dishes (Injera, Doro Wat, Shiro, Kitfo, Misir Wat, Tibs, Firfir), traditional preparation techniques, ingredients (Berbere, Korarima, Niter Kibbeh, Teff), the Ethiopian Coffee Ceremony (Jebena Buna, Abol, Tona, Baraka, frankincense).
6. Ethiopian Economy, Tourism, Technology & Culture: Fintech (Telebirr, CBE Birr), startups, national parks (Simien, Bale, Nechisar), festivals (Timkat, Meskel, Irreecha, Ashenda, Eid), holidays, music (Tizita, Bati, Ambassel, Anchihoye), calendar (Julian/Ethiopian calendar, Pagume, Enkutatash).

Guidelines:
- Match the language of the user: If the user asks in Amharic (አማርኛ), respond in natural, grammatically correct Amharic with proper Ge'ez script. If the user asks in Afaan Oromoo, respond in Afaan Oromoo. If in Tigrinya, respond in Tigrinya. If in English, respond in English.
- Maintain an encouraging, dignified, polite, and culturally authentic tone.
- Format responses cleanly with readable paragraphs, bullet points, and markdown headers when helpful.
- For legal questions, always include a brief disclaimer that advice is educational.`;

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    name: "Ethio AI",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, language, category } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A 'message' string is required." });
    }

    let contextualPrompt = "";
    if (language && language !== "auto") {
      contextualPrompt += `[User preferred language: ${language}]\n`;
    }
    if (category && category !== "general") {
      contextualPrompt += `[Domain context: Ethiopian ${category}]\n`;
    }
    contextualPrompt += message;

    const formattedContents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-8)) {
        if (msg.role === "user" || msg.role === "model") {
          formattedContents.push({
            role: msg.role,
            parts: [{ text: String(msg.text || "") }],
          });
        }
      }
    }

    formattedContents.push({
      role: "user",
      parts: [{ text: contextualPrompt }],
    });

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "No response generated.";
    res.json({ reply });
  } catch (error: any) {
    console.error("API /api/chat error:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred in Ethio AI.",
    });
  }
});

app.post("/api/legal", async (req, res) => {
  try {
    const { query, lawCategory, language } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getAI();
    const prompt = `You are the Ethiopian Legal Intelligence Assistant.
Category: ${lawCategory || "General Ethiopian Law"}
Language: ${language || "English / Amharic"}

User Legal Inquiry:
${query}

Please provide a detailed, well-structured breakdown:
1. Relevant Legal Framework (referencing FDRE Constitution, Commercial Code 2021, Civil Code, Labor Proclamations, or relevant proclamations where applicable).
2. Key Legal Principles & Requirements in Ethiopia.
3. Practical Steps or Procedural Guidance (e.g. document filings, Ministry of Trade & Regional Integration, courts, or arbitration).
4. Mandatory Legal Disclaimer: Note that this information is educational and recommend consulting a licensed Ethiopian attorney (ጠበቃ) for formal representation.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    res.json({ analysis: response.text || "No analysis generated." });
  } catch (error: any) {
    console.error("API /api/legal error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze legal query." });
  }
});

app.post("/api/education", async (req, res) => {
  try {
    const { topic, gradeLevel, subject, mode, language } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const ai = getAI();
    const prompt = `You are the Ethiopian Education & National Exam Preparation Tutor.
Subject: ${subject || "General"}
Grade/Level: ${gradeLevel || "Grade 12 (EUEE Prep)"}
Mode: ${mode || "quiz"} (Quiz questions with answer explanations, or Concept Study Guide)
Target Language: ${language || "English"}

Topic:
${topic}

Requirements:
- If mode is "quiz": Generate 4-5 high-yield multiple-choice questions aligned with the Ethiopian National Exam curriculum. For each question, provide 4 choices (A, B, C, D), clearly state the correct answer, and provide a clear pedagogical explanation in the requested language.
- If mode is "study": Provide a comprehensive, structured study guide with key definitions, formulas/rules, historical/scientific context, and memory mnemonics.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.6,
      },
    });

    res.json({ content: response.text || "No educational material generated." });
  } catch (error: any) {
    console.error("API /api/education error:", error);
    res.status(500).json({ error: error.message || "Failed to generate educational content." });
  }
});

app.post("/api/culture", async (req, res) => {
  try {
    const { topic, category, language } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const ai = getAI();
    const prompt = `You are the Ethiopian Culture, Cuisine & Heritage Specialist.
Domain: ${category || "Cuisine & Coffee Ceremony"}
Language: ${language || "English"}

Inquiry / Topic:
${topic}

Please provide an authentic, richly detailed guide including:
- Cultural significance, historical roots, and regional variations in Ethiopia.
- If a recipe/dish: Authentic ingredients (including Ethiopian spices like Berbere, Korarima, Mekelesha, Teff), step-by-step preparation, and fasting (Tsom) vs non-fasting adaptations.
- If coffee (Buna): The traditional ceremonial stages (Abol, Tona, Baraka), blessings, accompaniments (popcorn, kolo).
- Traditional proverbs or sayings related to this topic where applicable.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    res.json({ content: response.text || "No cultural guide generated." });
  } catch (error: any) {
    console.error("API /api/culture error:", error);
    res.status(500).json({ error: error.message || "Failed to generate cultural guide." });
  }
});

app.post("/api/translate", async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = getAI();
    const prompt = `Translate the following text accurately, considering cultural context, idioms, and proper orthography.
Source Language: ${sourceLang || "English"}
Target Language: ${targetLang || "Amharic (አማርኛ)"}

Text to translate:
"${text}"

Provide:
1. Primary Translation (in proper script: Ge'ez Fidel for Amharic/Tigrinya, Qubee for Afaan Oromoo, Latin for English).
2. Phonetic Transliteration (pronunciation guide in Latin characters).
3. Cultural context / Nuance notes (if applicable).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    res.json({ translation: response.text || "No translation generated." });
  } catch (error: any) {
    console.error("API /api/translate error:", error);
    res.status(500).json({ error: error.message || "Failed to process translation." });
  }
});

export default app;
