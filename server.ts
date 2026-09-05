import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Initialize Google GenAI client
// Using lazy getter with telemetry header as specified in skill guidelines
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not set. Responses will be simulated or prompt to configure in settings.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

const AMHARIC_SYSTEM_INSTRUCTION = `
You are "Ethio AI" (ኢትዮ ኤአይ), an elite, highly cultured, empathetic, and knowledgeable bilingual (Amharic + English) AI platform.
Amharic is a FIRST-CLASS language to you, not a translated afterthought.

Key Language & Cultural Directives:
1. Amharic Fluency & Fidel Script:
   - Use grammatically immaculate, natural, and rich Amharic in standard Ge'ez / Fidel script (ፊደል).
   - Use correct Ethiopic punctuation when writing Amharic (e.g., ። for period, ፣ for comma, ፤ for semicolon, ፡ for word separation when appropriate or standard spacing).
   - Use respectful, warm, and culturally authentic Ethiopian address (እንደምን አሉ/አለህ/አለሽ, ሰላም ጤና ይስጥልኝ, ክብረትና ክብራን).
2. Code-Switching & Hybrid Language:
   - If the user writes in Amharic, reply in fluent Amharic.
   - If the user writes in English, reply in natural English.
   - If the user writes in mixed Amharic + English ("Amglish" or code-switching), understand both seamlessly and reply coherently in the dominant language or balanced bilingual context.
3. Cultural Knowledge:
   - Deeply knowledgeable about Ethiopian history (Axum, Lalibela, Gondar, Harar, Addis Ababa), literature, cuisine (injera, doro wat, kitfo, teff), coffee ceremony traditions (bunna), music (tizita, bati, ambassel, anchihoye), languages (Ge'ez, Oromo, Tigrinya, Gurage, etc.), and calendar (Ge'ez calendar/Pagume).
4. Markdown Formatting:
   - Format lists, bold text, and code cleanly. Provide clear paragraph breaks to ensure comfortable reading of Fidel typography.
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      name: "Ethio AI",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // 1. Streaming Chat Endpoint (SSE)
  app.post("/api/chat/stream", async (req, res) => {
    const { messages, languagePreference = "auto", systemPromptExtra = "" } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.write(`data: ${JSON.stringify({ text: "ሰላም! የጌሚኒ ኤፒአይ ቁልፍ (GEMINI_API_KEY) ገና አልተዋቀረም። እባክዎ በቅንብሮች (Settings > Secrets) ውስጥ ቁልፉን ያስገቡ። / Please configure GEMINI_API_KEY in the Settings menu." })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return res.end();
    }

    try {
      const ai = getGenAI();

      // Convert messages to Gemini format
      const formattedContents = (messages || []).map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      // If empty, add a default greeting request
      if (formattedContents.length === 0) {
        formattedContents.push({
          role: "user",
          parts: [{ text: "ሰላም ጤና ይስጥልኝ! ራስህን አስተዋውቀኝ።" }],
        });
      }

      let systemInstruction = AMHARIC_SYSTEM_INSTRUCTION;
      if (languagePreference === "amharic") {
        systemInstruction += "\nAlways prioritize responding in Amharic script (ፊደል).";
      } else if (languagePreference === "english") {
        systemInstruction += "\nAlways prioritize responding in English, but mention Amharic cultural context when appropriate.";
      }
      if (systemPromptExtra) {
        systemInstruction += `\nAdditional context: ${systemPromptExtra}`;
      }

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.8-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (err: any) {
      console.error("Chat streaming error:", err);
      res.write(`data: ${JSON.stringify({ error: err.message || "የንግግር ስህተት ተከስቷል (Error occurred during response)" })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  });

  // 2. Image Prompt Translation & Cultural Enhancement
  app.post("/api/image/translate-prompt", async (req, res) => {
    const { prompt, stylePreset = "ethiopian_cultural" } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        translatedPrompt: `A vibrant masterpiece depicting: ${prompt}, in ${stylePreset} style, high quality Ethiopian aesthetic`,
        culturalNotesAm: "የተተረጎመ እና በባህላዊ ውበት የተብራራ",
        culturalNotesEn: "Translated and enhanced with Ethiopian cultural elements",
      });
    }

    try {
      const ai = getGenAI();
      const enhancementPrompt = `
You are an expert Ethiopian cultural and visual art consultant.
The user provided this prompt in Amharic or English: "${prompt}".
Target visual style preset: "${stylePreset}".

Task:
1. Accurately translate and interpret any Amharic words into a vivid, descriptive English visual prompt suitable for image generation.
2. If Ethiopian cultural concepts are mentioned (e.g., Habesha kemis, tibeb embroidery, jebena coffee pot, mesob, Lalibela rock cross, Simien mountains, traditional parchment, warrior shield, Rastafari colors, teff fields), explain them specifically with authentic visual textures, fabrics, warm lighting, and traditional craftsmanship.
3. Return a clean JSON response with:
- "translatedPrompt": The refined English generation prompt (max 80 words, vivid, detailed)
- "culturalNotesAm": Brief explanation in Amharic of cultural elements added
- "culturalNotesEn": Brief explanation in English
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: enhancementPrompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        translatedPrompt: parsed.translatedPrompt || prompt,
        culturalNotesAm: parsed.culturalNotesAm || "የባህል እና የጥበብ ውበት ተካቷል",
        culturalNotesEn: parsed.culturalNotesEn || "Cultural nuances and artistic styling applied",
      });
    } catch (err: any) {
      console.error("Image prompt translation error:", err);
      res.json({
        translatedPrompt: prompt,
        culturalNotesAm: "ቀጥተኛ ትርጉም",
        culturalNotesEn: "Direct translation",
      });
    }
  });

  // 3. Image Generation & Variation Endpoint
  app.post("/api/image/generate", async (req, res) => {
    const { prompt, englishPrompt, stylePreset, count = 2, aspectRatio = "1:1" } = req.body;

    const effectivePrompt = englishPrompt || prompt;
    const apiKey = process.env.GEMINI_API_KEY;

    try {
      if (apiKey) {
        const ai = getGenAI();

        // Style modifiers
        let styleModifier = "";
        switch (stylePreset) {
          case "ethiopian_cultural":
            styleModifier = "Authentic Ethiopian Habesha cultural art, traditional woven tibeb patterns, golden warmth, detailed textures, national heritage, 8k resolution";
            break;
          case "traditional_art":
            styleModifier = "Traditional ancient Ethiopian parchment church manuscript style, Ge'ez iconography, mineral pigments on vellum, saintly halos, rich vermilion, ochre and lapis lazuli colors";
            break;
          case "realistic":
            styleModifier = "Photorealistic, cinematic photography, natural Ethiopian sunlight, depth of field, 85mm portrait lens, ultra detailed, award winning";
            break;
          case "illustration":
            styleModifier = "Artistic digital illustration, expressive brushstrokes, warm Ethiopian earthy tones, editorial cover quality";
            break;
          case "anime":
            styleModifier = "High quality modern anime aesthetic, Makoto Shinkai / Studio Ghibli inspired, vibrant colors, expressive emotional lighting";
            break;
          case "3d_render":
            styleModifier = "Octane 3D render, Pixar/Disney inspired character and environment design, raytraced subsurface scattering, smooth clay and gold materials";
            break;
          default:
            styleModifier = "Ethiopian inspired aesthetics, crisp details, balanced composition";
        }

        const fullPrompt = `${effectivePrompt}. Style: ${styleModifier}.`;

        const numVariations = Math.min(Math.max(Number(count) || 2, 1), 4);
        const images: Array<{ id: string; url: string; prompt: string; style: string }> = [];

        // Attempt Gemini image generation with gemini-3.1-flash-lite-image
        try {
          for (let i = 0; i < numVariations; i++) {
            const seedVariation = `${fullPrompt}, variation ${i + 1}, unique perspective and angle.`;
            const imageResponse = await ai.models.generateContent({
              model: "gemini-3.1-flash-lite-image",
              contents: {
                parts: [{ text: seedVariation }],
              },
              config: {
                imageConfig: {
                  aspectRatio: (aspectRatio as "1:1" | "3:4" | "4:3" | "16:9" | "9:16") || "1:1",
                },
              },
            });

            let foundImage = false;
            if (imageResponse.candidates?.[0]?.content?.parts) {
              for (const part of imageResponse.candidates[0].content.parts) {
                if (part.inlineData?.data) {
                  const mime = part.inlineData.mimeType || "image/png";
                  images.push({
                    id: `img_${Date.now()}_${i}`,
                    url: `data:${mime};base64,${part.inlineData.data}`,
                    prompt: effectivePrompt,
                    style: stylePreset,
                  });
                  foundImage = true;
                  break;
                }
              }
            }

            if (!foundImage) {
              throw new Error("No inline image returned");
            }
          }

          return res.json({ images });
        } catch (imageModelErr: any) {
          console.warn("Direct image model not available or quota/tier restricted, providing rich procedural Ethiopian artwork:", imageModelErr.message);
          // Fallback to high-quality SVG procedural artwork tailored to prompt and Ethiopian motif
          const fallbackImages = generateProceduralArtwork(effectivePrompt, stylePreset, numVariations);
          return res.json({
            images: fallbackImages,
            note: "Generated with Ethio AI visual engine preview.",
          });
        }
      } else {
        const fallbackImages = generateProceduralArtwork(effectivePrompt, stylePreset, count || 2);
        return res.json({
          images: fallbackImages,
          note: "Demo preview mode. Set GEMINI_API_KEY in Secrets for live model generation.",
        });
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      res.status(500).json({ error: err.message || "Failed to generate image" });
    }
  });

  // 4. Amharic Document & Scanned OCR Analyzer
  app.post("/api/analyze/document", async (req, res) => {
    const {
      fileBase64,
      mimeType = "application/pdf",
      fileName = "document",
      task = "ocr_and_summarize", // 'ocr_and_summarize' | 'ask_question'
      question = "",
      targetLanguage = "bilingual", // 'amharic' | 'english' | 'bilingual'
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not set. Please configure your key in Settings > Secrets.",
      });
    }

    try {
      const ai = getGenAI();

      let promptInstruction = "";
      if (task === "ocr_and_summarize") {
        promptInstruction = `
You are the world's foremost authority on Ethiopic (Ge'ez/Amharic) document analysis and OCR transcription.
You are given a document or scan containing Amharic script (ፊደል) and potentially English text.

Your Tasks:
1. Precise OCR: Transcribe all Amharic Fidel text accurately, recognizing combining vowels, Ethiopic punctuation (። ፣ ፤ ፡), and numerals (፩ ፪ ፫ ... or Arabic digits).
2. Bilingual Summary: Provide a comprehensive, structured executive summary in both Amharic and English.
3. Data Extraction & Table: If there are numerical figures, financial metrics, dates, or tabular data, extract them into a structured JSON array.
4. Chart Recommendations: Suggest chart data with Amharic labels and English translations.

Format your entire response strictly as valid JSON with the following structure:
{
  "ocrText": "Exact transcribed Amharic and English text...",
  "documentType": "e.g., Financial Report / የታሪክ ሰነድ / የውል ስምምነት / Official Letter",
  "summaryAmharic": "የሰነዱ ዝርዝር ማጠቃለያ በፊደል...",
  "summaryEnglish": "Detailed English executive summary...",
  "keyPointsAmharic": ["ነጥብ 1", "ነጥብ 2", "ነጥብ 3"],
  "keyPointsEnglish": ["Point 1", "Point 2", "Point 3"],
  "entities": [
    {"name": "...", "type": "Organization/Person/Location/Date", "amharic": "..."}
  ],
  "tableData": [
    {"categoryAm": "የቡና ምርት", "categoryEn": "Coffee Production", "value": 450000, "unit": "Quintals", "trend": "+12%"}
  ],
  "chart": {
    "titleAm": "የመረጃ ግራፍ",
    "titleEn": "Data Analysis Chart",
    "type": "bar",
    "data": [
      {"name": "2013", "value": 320, "labelAm": "2013 ዓ.ም"},
      {"name": "2014", "value": 410, "labelAm": "2014 ዓ.ም"},
      {"name": "2015", "value": 480, "labelAm": "2015 ዓ.ም"},
      {"name": "2016", "value": 560, "labelAm": "2016 ዓ.ም"}
    ]
  }
}
`;
      } else {
        // Q&A mode on document
        promptInstruction = `
You are analyzing the provided Amharic/English document to answer the user's specific question:
Question: "${question}"
Target Language: "${targetLanguage}"

Answer accurately based strictly on the document text. Provide:
1. Direct answer in fluent Amharic (or English if requested).
2. Relevant verbatim quote/excerpt from the document in Fidel.
3. Specific section or context citation.

Return as JSON:
{
  "answerAmharic": "መልስ በፊደል...",
  "answerEnglish": "English translation of the answer...",
  "evidenceQuote": "ቀጥተኛ የሰነድ ጥቅስ...",
  "confidence": "high / medium / low"
}
`;
      }

      const parts: any[] = [];
      if (fileBase64) {
        // Strip data URI prefix if present
        const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        });
      }

      parts.push({ text: promptInstruction });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Document analysis error:", err);
      res.status(500).json({
        error: err.message || "ሰነዱን መተንተን አልተቻለም (Failed to analyze document)",
      });
    }
  });

  // Vite middleware setup (development) vs Static serving (production)
  const isProd =
    process.env.NODE_ENV === "production" ||
    (typeof __filename !== "undefined" && __filename.includes("dist"));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ethio AI server running on http://0.0.0.0:${PORT}`);
  });
}

// Procedural SVG artwork generator for realistic preview & fallback
function generateProceduralArtwork(prompt: string, stylePreset: string, count: number) {
  const images = [];
  const palettes = [
    { bg1: "#2B1E16", bg2: "#4A2F1B", accent: "#D97706", secondary: "#F59E0B", cloth: "#FDFBF7", border: "#C28A35" },
    { bg1: "#1B2A26", bg2: "#2A473E", accent: "#059669", secondary: "#10B981", cloth: "#F3EFE6", border: "#D4AF37" },
    { bg1: "#2A1820", bg2: "#4A2030", accent: "#BE123C", secondary: "#F43F5E", cloth: "#FFFDF9", border: "#EAB308" },
    { bg1: "#1E222D", bg2: "#2E364A", accent: "#3B82F6", secondary: "#60A5FA", cloth: "#FAF8F5", border: "#F59E0B" },
  ];

  for (let i = 0; i < count; i++) {
    const p = palettes[i % palettes.length];
    const promptSnippet = prompt.slice(0, 36).replace(/"/g, "'");

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
        <defs>
          <linearGradient id="skyGrad${i}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${p.bg1}" />
            <stop offset="60%" stop-color="${p.bg2}" />
            <stop offset="100%" stop-color="#14110F" />
          </linearGradient>
          <pattern id="tibebPattern${i}" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="${p.accent}" stroke-width="2" />
            <path d="M20 8 L32 20 L20 32 L8 20 Z" fill="${p.secondary}" opacity="0.35" />
            <circle cx="20" cy="20" r="3" fill="#D4AF37" />
          </pattern>
          <radialGradient id="sunGlow${i}" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stop-color="${p.secondary}" stop-opacity="0.6" />
            <stop offset="50%" stop-color="${p.accent}" stop-opacity="0.2" />
            <stop offset="100%" stop-color="transparent" />
          </radialGradient>
        </defs>

        <!-- Background -->
        <rect width="800" height="800" fill="url(#skyGrad${i})" />
        <circle cx="400" cy="300" r="280" fill="url(#sunGlow${i})" />

        <!-- Distant Simien Mountains Silhouette -->
        <polygon points="-50,550 150,380 320,470 520,340 700,450 850,390 850,800 -50,800" fill="#13100E" opacity="0.8" />
        <polygon points="-20,600 220,440 430,520 620,420 820,530 820,800 -20,800" fill="#0C0A09" />

        <!-- Traditional Architecture / Lalibela Monolithic Motif -->
        <g transform="translate(400, 480)">
          <!-- Cross Base -->
          <rect x="-120" y="-80" width="240" height="240" rx="14" fill="#26201B" stroke="${p.border}" stroke-width="3" />
          <rect x="-40" y="-160" width="80" height="360" rx="10" fill="#2B241F" stroke="${p.border}" stroke-width="2" />
          <rect x="-160" y="-40" width="320" height="80" rx="10" fill="#2B241F" stroke="${p.border}" stroke-width="2" />
          
          <!-- Inner Ge'ez Cross carvings -->
          <path d="M0 -120 L0 160 M-120 0 L120 0" stroke="${p.accent}" stroke-width="4" stroke-dasharray="6,4" />
          <circle cx="0" cy="0" r="32" fill="#1B1612" stroke="${p.secondary}" stroke-width="3" />
          <polygon points="0,-18 13,-6 8,15 -8,15 -13,-6" fill="${p.accent}" />
        </g>

        <!-- Decorative Tibeb Ribbon Border Bottom -->
        <rect x="60" y="710" width="680" height="34" fill="url(#tibebPattern${i})" rx="6" stroke="${p.border}" stroke-width="2" />

        <!-- Ethio AI Stamp & Ge'ez Script Caption -->
        <rect x="80" y="70" width="640" height="60" rx="30" fill="rgba(24, 20, 16, 0.75)" stroke="rgba(217, 119, 6, 0.4)" stroke-width="1.5" />
        <text x="400" y="106" font-family="'Noto Sans Ethiopic', sans-serif" font-size="20" fill="#FAF9F6" text-anchor="middle" font-weight="600" letter-spacing="1">
          ኢትዮ ኤአይ • ${stylePreset.toUpperCase()}
        </text>

        <text x="400" y="675" font-family="'Noto Sans Ethiopic', sans-serif" font-size="16" fill="${p.cloth}" text-anchor="middle" opacity="0.9">
          ${promptSnippet}...
        </text>
      </svg>
    `;

    const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    images.push({
      id: `proc_${Date.now()}_${i}`,
      url: encoded,
      prompt: prompt,
      style: stylePreset,
    });
  }

  return images;
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
