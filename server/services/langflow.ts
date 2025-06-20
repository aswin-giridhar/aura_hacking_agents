const LANGFLOW_API_URL = process.env.LANGFLOW_API_URL || process.env.LANGFLOW_ENDPOINT;
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY || process.env.LANGFLOW_TOKEN;

export interface LangflowRequest {
  input_value: string;
  output_type?: string;
  input_type?: string;
  tweaks?: Record<string, any>;
}

export interface LangflowResponse {
  result: {
    message: string;
    type: string;
    data?: any;
  };
  session_id: string;
}

export interface ConversationAnalysis {
  engagement_level: 'low' | 'medium' | 'high';
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestions: string[];
  next_steps: string[];
}

export interface ProfileAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  photo_feedback: string[];
}

export async function callLangflowWorkflow(
  flowId: string,
  request: LangflowRequest
): Promise<LangflowResponse> {
  if (!LANGFLOW_API_URL || !LANGFLOW_API_KEY) {
    console.warn('Langflow not configured - returning mock response');
    return {
      result: {
        message: "Mock response from Langflow workflow",
        type: "text",
        data: { mock: true }
      },
      session_id: 'mock_session_' + Date.now()
    };
  }

  try {
    const response = await fetch(`${LANGFLOW_API_URL}/api/v1/run/${flowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LANGFLOW_API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Langflow API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Langflow API call failed:', error);
    throw error;
  }
}

export async function analyzeConversation(messages: string[]): Promise<ConversationAnalysis> {
  try {
    const conversationText = messages.join('\n');
    const response = await callLangflowWorkflow('conversation-analysis', {
      input_value: conversationText,
      output_type: 'chat',
      tweaks: {
        analysis_type: 'dating_conversation'
      }
    });

    // Parse the response or return mock data
    if (response.result.data?.mock) {
      return {
        engagement_level: 'high',
        topics: ['outdoor_activities', 'travel', 'food'],
        sentiment: 'positive',
        suggestions: [
          'Ask about her favorite hiking trails',
          'Share a travel story of your own',
          'Suggest meeting for coffee to continue the conversation'
        ],
        next_steps: [
          'Ask for her phone number',
          'Propose a specific date activity',
          'Share more personal interests'
        ]
      };
    }

    // Parse actual response from Langflow
    const data = JSON.parse(response.result.message || '{}');
    return data as ConversationAnalysis;
  } catch (error) {
    console.error('Failed to analyze conversation:', error);
    // Return fallback analysis
    return {
      engagement_level: 'medium',
      topics: ['general'],
      sentiment: 'neutral',
      suggestions: ['Continue the conversation with open-ended questions'],
      next_steps: ['Share more about your interests']
    };
  }
}

export async function generateConversationStarter(profileInfo: string): Promise<string> {
  try {
    const response = await callLangflowWorkflow('conversation-starter', {
      input_value: profileInfo,
      output_type: 'text',
      tweaks: {
        tone: 'friendly',
        style: 'personalized'
      }
    });

    if (response.result.data?.mock) {
      return "I noticed you love hiking! What's been your favorite trail discovery this year?";
    }

    return response.result.message || "Hey! How's your day going?";
  } catch (error) {
    console.error('Failed to generate conversation starter:', error);
    return "Hey! How's your day going?";
  }
}

export async function analyzeProfile(profileData: any): Promise<ProfileAnalysis> {
  try {
    const response = await callLangflowWorkflow('profile-analysis', {
      input_value: JSON.stringify(profileData),
      output_type: 'json',
      tweaks: {
        analysis_depth: 'comprehensive'
      }
    });

    if (response.result.data?.mock) {
      return {
        score: 85,
        strengths: ['Great variety of photos', 'Interesting hobbies', 'Clear about what you want'],
        improvements: ['Add more photos with friends', 'Write more about your career'],
        photo_feedback: ['Main photo is great', 'Consider adding a group photo', 'Action shots work well']
      };
    }

    const data = JSON.parse(response.result.message || '{}');
    return data as ProfileAnalysis;
  } catch (error) {
    console.error('Failed to analyze profile:', error);
    return {
      score: 70,
      strengths: ['Well-written bio'],
      improvements: ['Add more photos'],
      photo_feedback: ['Photos look good']
    };
  }
}

export async function generateResponseSuggestion(
  conversationContext: string,
  partnerMessage: string
): Promise<string> {
  try {
    const context = `Conversation so far: ${conversationContext}\nLatest message: ${partnerMessage}`;
    const response = await callLangflowWorkflow('response-generator', {
      input_value: context,
      output_type: 'text',
      tweaks: {
        response_style: 'engaging',
        length: 'medium'
      }
    });

    if (response.result.data?.mock) {
      return "That sounds incredible! I've always wanted to visit Yosemite. What was your favorite part of the hike?";
    }

    return response.result.message || "That's interesting! Tell me more about that.";
  } catch (error) {
    console.error('Failed to generate response suggestion:', error);
    return "That's really interesting! I'd love to hear more about that.";
  }
}
