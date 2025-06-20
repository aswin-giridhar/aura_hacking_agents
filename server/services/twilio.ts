import Twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_PHONE;

let twilioClient: any = null;

if (accountSid && authToken) {
  twilioClient = Twilio(accountSid, authToken);
}

export interface SendSmsParams {
  to: string;
  message: string;
}

export interface SmsResponse {
  success: boolean;
  sid?: string;
  error?: string;
}

export async function sendSms({ to, message }: SendSmsParams): Promise<SmsResponse> {
  if (!twilioClient || !fromPhone) {
    console.warn('Twilio not configured - SMS would be sent:', { to, message });
    return {
      success: true,
      sid: 'mock_sid_' + Date.now(),
    };
  }

  try {
    const messageResponse = await twilioClient.messages.create({
      body: message,
      from: fromPhone,
      to: to,
    });

    return {
      success: true,
      sid: messageResponse.sid,
    };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendDailyTip(phone: string, tip: string): Promise<SmsResponse> {
  const message = `💡 Daily Dating Tip: ${tip}\n\nReply STOP to unsubscribe from LoveCoach AI`;
  return sendSms({ to: phone, message });
}

export async function sendResponseReminder(phone: string, partnerName: string): Promise<SmsResponse> {
  const message = `👋 Gentle reminder: ${partnerName} sent you a message! Keep the conversation flowing.\n\nReply HELP for suggestions`;
  return sendSms({ to: phone, message });
}

export async function sendEmergencyHelp(phone: string, suggestion: string): Promise<SmsResponse> {
  const message = `🆘 Emergency Conversation Rescue:\n\n"${suggestion}"\n\nYou've got this! 💪`;
  return sendSms({ to: phone, message });
}
