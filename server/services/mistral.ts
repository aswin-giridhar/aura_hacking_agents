const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || 'B912vIZxj3H3USwTGpg1TOkfoybltQDd';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

export interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MistralRequest {
  model: string;
  messages: MistralMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callMistralAI(messages: MistralMessage[]): Promise<string> {
  if (!MISTRAL_API_KEY) {
    console.warn('Mistral API key not configured - returning mock response');
    return "I'm here to help with your dating questions! However, my AI service isn't fully configured yet. Please contact support.";
  }

  try {
    const systemMessage: MistralMessage = {
      role: 'system',
      content: `You are LoveCoach AI, a helpful dating assistant. You provide personalized advice for dating conversations, profile optimization, and relationship guidance. Keep responses concise, supportive, and actionable. Focus on building confidence and genuine connections.`
    };

    const request: MistralRequest = {
      model: 'mistral-small-latest',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 300
    };

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    const data: MistralResponse = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
  } catch (error) {
    console.error('Mistral AI call failed:', error);
    return "I'm experiencing technical difficulties. Please try again in a moment or contact support for immediate assistance.";
  }
}

export async function generateDatingAdvice(userMessage: string, conversationHistory: string[] = []): Promise<string> {
  const messages: MistralMessage[] = [
    ...conversationHistory.map((msg, index): MistralMessage => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: msg
    })),
    {
      role: 'user',
      content: userMessage
    }
  ];

  return await callMistralAI(messages);
}

export async function generateConversationSuggestion(context: string): Promise<string> {
  const messages: MistralMessage[] = [
    {
      role: 'user',
      content: `Based on this dating conversation context, suggest a thoughtful response: ${context}`
    }
  ];

  return await callMistralAI(messages);
}