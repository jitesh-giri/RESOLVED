import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Lazy-initialized Gemini API Client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Using fallback mock responses.");
    }
    aiClient = new GoogleGenAI({ apiKey: key || "MOCK_KEY" });
  }
  return aiClient;
}

// API endpoint to analyze image for text or civic issues
app.post('/api/analyze-image', async (req: express.Request, res: express.Response) => {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64) {
    res.status(400).json({ error: 'Image data is required.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.json({ analysis: "Simulated Image Analysis: The image shows significant infrastructure damage with a large pothole. There is also a sign visible saying 'Caution: Work in Progress'. This poses a safety hazard for commuters." });
    return;
  }

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: 'Analyze this image for a civic issue report. Extract any text that is visible (like street signs, notices, or graffiti) and concisely describe the primary issue (e.g., pothole, broken streetlight, garbage). Provide the output as a short paragraph that can be used to populate a report description.',
            },
          ],
        },
      ],
    });

    res.json({ analysis: response.text });
  } catch (error) {
    console.error('Image Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze the image.' });
  }
});

// API endpoint to generate complaint via Gemini
app.post('/api/generate-complaint', async (req: express.Request, res: express.Response) => {
  const { title, description, locality, category } = req.body;

  if (!title || !description || !locality) {
    res.status(400).json({ error: 'Title, description, and locality are required fields.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Return high-quality, simulated templates if GEMINI_API_KEY is not defined
    console.log("No GEMINI_API_KEY found, returning realistic mockup.");
    const simulatedResponse = getMockComplaint(title, description, locality, category);
    res.json(simulatedResponse);
    return;
  }

  try {
    const ai = getAiClient();
    const prompt = `
You are a civic advocacy expert representing local residents.
Create a professionally drafted official complaint email and a punchy Twitter/X post for the following community issue:

Issue Title: "${title}"
Category: "${category || 'General civic issue'}"
Locality/Area: "${locality}"
Detailed Description: "${description}"

Guidelines:
1. The EMAIL should be highly professional, addressed to the municipal body or local corporation (e.g., Municipal Commissioner, Ward Officer, and local area representative). State the problem clearly, point out safety/hygiene/infrastructure risks, reference the exact locality, and request an urgent inspection and resolution. Use a polite, authoritative tone. Keep it complete and ready to send.
2. The TWITTER/X POST should be extremely punchy, strictly under 280 characters. Highlight the severity of the issue, mention the locality "${locality}", tag simulated local bodies (like @MunicipalCorp, @CityPolice, @CivicRepair), and include 2-3 relevant hashtags (e.g., #CivicIssue, #CommunityAction, #LocalHero).
3. Output the result strictly in a single, valid JSON object with EXACTLY these keys: "emailDraft" and "tweetDraft". Do not put any markdown tags (like \`\`\`json) or extra text outside the JSON block.

Respond ONLY with the JSON:
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    try {
      const parsed = JSON.parse(text.trim());
      if (parsed.emailDraft && parsed.tweetDraft) {
        res.json(parsed);
        return;
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response as JSON. Text was:", text);
    }

    // Fallback if parsing failed or structure was incorrect
    res.json({
      emailDraft: `Subject: Urgent Attention: Civic Issue Regarding ${title} at ${locality}\n\nDear Municipal Commissioner / Ward Officer,\n\nI am writing to draw your urgent attention to a pressing civic concern in our locality: ${title} at ${locality}.\n\nDescription of the issue:\n${description}\n\nThis matter poses a significant challenge to residents of the locality and requires immediate corrective measures. We kindly request the municipal authorities to inspect the site and expedite the resolution process.\n\nThank you for your prompt attention and commitment to community welfare.\n\nSincerely,\nConcerned Citizen`,
      tweetDraft: `🚨 Civic alert at ${locality}: ${title}! This issue needs immediate attention from authorities. Let's make our neighborhood cleaner and safer! @MunicipalCorp @CivicRepair #CivicIssue #CommunityHero #PublicSafety`
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || 'Failed to generate complaint using AI.' });
  }
});

// Helper for generating mock complaints when API key is not available
function getMockComplaint(title: string, description: string, locality: string, category: string) {
  const emailDraft = `Subject: URGENT: Civic Complaint regarding ${title} at ${locality}

Dear Municipal Commissioner & Ward Representative,

I am writing on behalf of the residents of ${locality} to register an official complaint regarding a critical civic grievance: "${title}".

This issue falls under the category of ${category || 'General civic concern'} and is causing significant inconvenience, safety hazards, and distress to local citizens daily.

Specifically, the current status is described as:
${description}

Given the potential risks to public health and safety, we request that the Ward Officer and relevant sanitation/engineering teams conduct an immediate site inspection. We hope to see this issue addressed on high priority before the situation escalates further.

We look forward to your prompt response and a swift resolution.

Yours sincerely,
Concerned Resident & Community Hero Representative
${locality} Constituency`;

  const hashtag = category ? `#${category.charAt(0).toUpperCase() + category.slice(1)}Alert` : '#CivicAlert';
  const tweetDraft = `🚨 URGENT: Residents at ${locality} are facing severe issues with: "${title}". This needs immediate action from local authorities! 🛑\n\n${description.substring(0, 100)}...\n\n@MunicipalCorp @CityCommissioner @CitizenPortal ${hashtag} #CommunityHero`;

  return { emailDraft, tweetDraft };
}

// Vite integration middleware
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

start();
