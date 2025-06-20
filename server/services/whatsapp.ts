import Twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;

let twilioClient: any = null;

if (accountSid && authToken) {
  twilioClient = Twilio(accountSid, authToken);
}

export interface WhatsAppMessage {
  from: string;
  to: string;
  body: string;
  messageId?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  sid?: string;
  error?: string;
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<WhatsAppResponse> {
  if (!twilioClient || !fromWhatsApp) {
    console.warn('Twilio WhatsApp not configured - message would be sent:', { to, message });
    return {
      success: true,
      sid: 'mock_whatsapp_sid_' + Date.now(),
    };
  }

  try {
    const messageResponse = await twilioClient.messages.create({
      body: message,
      from: fromWhatsApp,
      to: `whatsapp:${to}`,
    });

    return {
      success: true,
      sid: messageResponse.sid,
    };
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function parseIncomingWhatsApp(body: any): WhatsAppMessage | null {
  try {
    const from = body.From?.replace('whatsapp:', '') || '';
    const to = body.To?.replace('whatsapp:', '') || '';
    const messageBody = body.Body || '';
    const messageId = body.MessageSid || '';

    if (!from || !messageBody) {
      return null;
    }

    return {
      from,
      to,
      body: messageBody,
      messageId,
    };
  } catch (error) {
    console.error('Failed to parse incoming WhatsApp message:', error);
    return null;
  }
}

export async function setupWhatsAppWebhook(app: any) {
  // Webhook endpoint for incoming WhatsApp messages
  app.post('/webhook/whatsapp', async (req: any, res: any) => {
    try {
      const incomingMessage = parseIncomingWhatsApp(req.body);
      
      if (!incomingMessage) {
        return res.status(400).send('Invalid message format');
      }

      console.log('Received WhatsApp message:', incomingMessage);

      // Generate AI response using Mistral
      const aiResponse = await generateMistralResponse(incomingMessage.body);
      
      // Send response back via WhatsApp
      await sendWhatsAppMessage(incomingMessage.from, aiResponse);
      
      res.status(200).send('Message processed');
    } catch (error) {
      console.error('WhatsApp webhook error:', error);
      res.status(500).send('Internal server error');
    }
  });
}

async function generateMistralResponse(userMessage: string): Promise<string> {
  const mistralApiKey = process.env.MISTRAL_API_KEY;
  
  if (!mistralApiKey) {
    console.warn('Mistral API key not configured');
    return "I'm Aura, your AI dating coach! I'm here to help you with relationship advice. Ask me about dating strategies, conversation tips, or any relationship questions you have.";
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mistralApiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small',
        messages: [
          {
            role: 'system',
            content: 'You are Aura, an AI-powered relationship and dating coach. Provide helpful, empathetic, and actionable dating advice. Keep responses concise and supportive. Focus on practical tips for building connections, improving conversations, and navigating relationships.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm here to help with your dating questions! Could you please rephrase your question?";
  } catch (error) {
    console.error('Mistral API call failed:', error);
    return "I'm having trouble connecting right now, but I'm here to help with dating advice! Try asking me about conversation starters, date ideas, or relationship tips.";
  }
}