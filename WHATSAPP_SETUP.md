# WhatsApp AI Integration Setup Guide

## Overview
Your LoveCoach AI app now includes full WhatsApp integration with Mistral AI. Users can chat directly with your AI dating coach through WhatsApp, powered by your Mistral API key.

## Required Environment Variables

Add these to your Replit Secrets or `.env` file:

```bash
# Mistral AI Configuration
MISTRAL_API_KEY=B912vIZxj3H3USwTGpg1TOkfoybltQDd

# Twilio Configuration for WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_WHATSAPP_NUMBER=whatsapp:+your_whatsapp_business_number
```

## Twilio WhatsApp Setup

1. **Create Twilio Account**
   - Sign up at https://www.twilio.com
   - Get your Account SID and Auth Token from the console

2. **WhatsApp Business Setup**
   - Enable WhatsApp in your Twilio console
   - Complete the WhatsApp Business verification process
   - Get your WhatsApp-enabled phone number

3. **Configure Webhook**
   - In Twilio Console, go to Messaging > Settings > WhatsApp sandbox
   - Set webhook URL to: `https://your-repl-name.replit.app/webhook/whatsapp`
   - Set HTTP method to POST

## How It Works

### User Flow
1. User clicks the floating WhatsApp button on your website
2. System sends a welcome message to their WhatsApp
3. User can reply directly in WhatsApp
4. Mistral AI processes their messages and responds with dating advice
5. All conversations are stored in your database

### AI Capabilities
The Mistral AI integration provides:
- Personalized dating advice
- Conversation starters
- Profile optimization tips
- Confidence building guidance
- Response suggestions for dating apps

### Conversation Context
- System maintains conversation history for personalized responses
- Each user gets their own conversation thread
- Messages are logged for analytics and improvement

## API Endpoints

### Send WhatsApp Message
```
POST /api/whatsapp/send
{
  "to": "+1234567890",
  "message": "Hello from LoveCoach AI!",
  "userId": 1
}
```

### Webhook (Twilio calls this)
```
POST /webhook/whatsapp
```
Automatically processes incoming WhatsApp messages.

### Get Conversation
```
GET /api/whatsapp/conversation/:phoneNumber
```
Retrieves WhatsApp conversation history for a phone number.

## Testing

1. Update the phone number in `FloatingWhatsApp` component
2. Ensure all environment variables are set
3. Deploy your app and configure the Twilio webhook
4. Send a test message through WhatsApp

## Security Notes

- Webhook endpoint validates required fields
- User data is automatically created for new WhatsApp users
- All messages are logged with timestamps and status
- API key is securely stored in environment variables

## Troubleshooting

- Check Twilio webhook logs for delivery issues
- Verify Mistral API key is valid and has credits
- Ensure webhook URL is publicly accessible
- Test with Twilio's WhatsApp sandbox first