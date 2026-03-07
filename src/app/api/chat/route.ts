import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

type HistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_INSTRUCTION = `
You are an AI career advisor helping students explore careers, skills, and education opportunities.
Always suggest practical career paths, required skills, learning resources, and next steps.
Primary audience: students in Montgomery, Alabama.
Keep responses concise, practical, and student-friendly.
Use this structure in your response:
1) Career suggestion
2) Why it matches the student
3) Skills needed
4) Learning resources (include Montgomery local options when relevant)
5) Next steps
`;

const PREFERRED_MODEL_HINTS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-pro',
];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error);
};

const fetchAvailableModelNames = async (apiKey: string) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error(`ListModels failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
  };

  return (
    payload.models
      ?.filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => (m.name || '').replace('models/', ''))
      .filter(Boolean) || []
  );
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const history = Array.isArray(body?.history) ? (body.history as HistoryMessage[]) : [];

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on server' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const context = history
      .slice(-8)
      .map((item) => `${item.role === 'user' ? 'Student' : 'Advisor'}: ${item.content}`)
      .join('\n');

    const prompt = `
Conversation context:
${context || 'No previous context.'}

Current student question:
${message}
`;

    let modelNamesToTry: string[] = [];
    try {
      const availableModels = await fetchAvailableModelNames(apiKey);

      if (availableModels.length > 0) {
        // Prefer flash-capable fast models first, then all other available models.
        const preferred = PREFERRED_MODEL_HINTS.filter((hint) => availableModels.includes(hint));
        const remaining = availableModels.filter((name) => !preferred.includes(name));
        modelNamesToTry = [...preferred, ...remaining];
      }
    } catch {
      // If listing fails, fallback to common model guesses.
      modelNamesToTry = [...PREFERRED_MODEL_HINTS];
    }

    if (modelNamesToTry.length === 0) {
      modelNamesToTry = [...PREFERRED_MODEL_HINTS];
    }

    let lastError: unknown = null;
    for (const modelName of modelNamesToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_INSTRUCTION,
        });
        const result = await model.generateContent(prompt);
        const reply = result.response.text()?.trim() || 'I could not generate a response at this time.';
        return NextResponse.json({ reply, model: modelName });
      } catch (error) {
        lastError = error;
      }
    }

    const detailedError = getErrorMessage(lastError || 'Unknown Gemini error');
    return NextResponse.json(
      { error: `Gemini request failed: ${detailedError}`, tried_models: modelNamesToTry },
      { status: 500 }
    );
  } catch (error) {
    const detailedError = getErrorMessage(error);
    console.error('Chat API error:', detailedError);
    return NextResponse.json(
      { error: `Failed to generate chat response: ${detailedError}` },
      { status: 500 }
    );
  }
}
