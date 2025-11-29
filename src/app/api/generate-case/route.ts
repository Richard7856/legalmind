import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const systemPrompt = `You are a legal case generator assistant for LegalMind, a legal simulation platform.
Your job is to help users create realistic legal cases for simulation.

Based on the conversation, you should:
1. Ask clarifying questions if you need more information (case type, difficulty, key facts, etc.)
2. Once you have enough information, generate a complete case with:
   - title: A clear, descriptive title
   - description: A brief description (2-3 sentences)
   - category: One of: Penal, Civil, Laboral, Mercantil, Administrativo, Familiar
   - difficulty: One of: Básico, Intermedio, Avanzado
   - scenario: Detailed scenario with facts, timeline, and context
   - keyFacts: Array of 3-5 key facts
   - evidences: Array of evidence objects (id, type, title, description) - number depends on difficulty:
     * Básico: 1-2 evidences
     * Intermedio: 3-4 evidences
     * Avanzado: 5+ evidences
   - witnesses: Array of witness objects (name, role, description)
   - parties: Array of party objects (name, role, description)

If you need more information, respond with a JSON object:
{
  "needsMoreInfo": true,
  "message": "Your question or request for clarification"
}

If you have enough information to generate the case, respond with a JSON object:
{
  "needsMoreInfo": false,
  "caseData": {
    "title": "...",
    "description": "...",
    "category": "...",
    "difficulty": "...",
    "scenario": "...",
    "keyFacts": [...],
    "evidences": [...],
    "witnesses": [...],
    "parties": [...]
  }
}

Always respond in Spanish. Make the cases realistic and suitable for legal simulation.`;

        const result = await generateText({
            model: openai("gpt-4o"),
            system: systemPrompt,
            messages: messages.map((msg: any) => ({
                role: msg.role === "user" ? "user" : "assistant",
                content: msg.content,
            })),
            temperature: 0.7,
        });

        // Try to parse JSON from response
        const text = result.text.trim();
        let parsed;
        
        // Remove markdown code blocks if present
        const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        
        try {
            parsed = JSON.parse(cleanedText);
        } catch (e) {
            // If not valid JSON, treat as needing more info
            parsed = {
                needsMoreInfo: true,
                message: text,
            };
        }

        return Response.json(parsed);
    } catch (error) {
        console.error("Error generating case:", error);
        return Response.json(
            {
                needsMoreInfo: true,
                message: "Lo siento, hubo un error. Por favor intenta de nuevo o reformula tu solicitud.",
            },
            { status: 500 }
        );
    }
}

