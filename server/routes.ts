import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertMessageSchema, insertCoachingTipSchema } from "@shared/schema";
import { sendDailyTip, sendResponseReminder, sendEmergencyHelp } from "./services/twilio";
import { analyzeConversation, generateConversationStarter, analyzeProfile, generateResponseSuggestion } from "./services/langflow";
import { sendWhatsAppMessage, setupWhatsAppWebhook } from "./services/whatsapp";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get('/api/stats/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getStats(userId);
      
      if (!stats) {
        // Create default stats if none exist
        const defaultStats = await storage.updateStats(userId, {
          activeConversations: 0,
          responseRate: 0,
          coachingTipsSent: 0,
          successScore: 0,
        });
        return res.json(defaultStats);
      }
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Get conversations for user
  app.get('/api/conversations/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  // Get specific conversation with messages
  app.get('/api/conversations/:userId/:conversationId', async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      const messages = await storage.getMessages(conversationId);
      res.json({ conversation, messages });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  });

  // Create new conversation
  app.post('/api/conversations', async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      
      // Update stats
      const currentStats = await storage.getStats(validatedData.userId);
      await storage.updateStats(validatedData.userId, {
        activeConversations: (currentStats?.activeConversations || 0) + 1
      });
      
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ error: 'Invalid conversation data' });
    }
  });

  // Send message in conversation
  app.post('/api/messages', async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      
      // Update conversation last activity
      await storage.updateConversation(validatedData.conversationId, {
        lastMessage: validatedData.content,
        lastActive: new Date(),
      });
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: 'Invalid message data' });
    }
  });

  // Get coaching tips for user
  app.get('/api/coaching-tips/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const tips = await storage.getCoachingTips(userId);
      res.json(tips);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch coaching tips' });
    }
  });

  // Create coaching tip
  app.post('/api/coaching-tips', async (req, res) => {
    try {
      const validatedData = insertCoachingTipSchema.parse(req.body);
      const tip = await storage.createCoachingTip(validatedData);
      
      // Update stats
      const currentStats = await storage.getStats(validatedData.userId);
      await storage.updateStats(validatedData.userId, {
        coachingTipsSent: (currentStats?.coachingTipsSent || 0) + 1
      });
      
      res.json(tip);
    } catch (error) {
      res.status(400).json({ error: 'Invalid tip data' });
    }
  });

  // Mark coaching tip as read
  app.patch('/api/coaching-tips/:tipId/read', async (req, res) => {
    try {
      const tipId = parseInt(req.params.tipId);
      await storage.markTipAsRead(tipId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark tip as read' });
    }
  });

  // Get workflows for user
  app.get('/api/workflows/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const workflows = await storage.getWorkflows(userId);
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch workflows' });
    }
  });

  // Send SMS tip
  app.post('/api/sms/daily-tip', async (req, res) => {
    try {
      const { userId, tip } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user || !user.phone || !user.smsEnabled) {
        return res.status(400).json({ error: 'User not found or SMS not enabled' });
      }
      
      const smsLog = await storage.createSmsLog({
        userId,
        type: 'daily_tip',
        content: tip,
        phone: user.phone,
        status: 'pending',
      });
      
      const result = await sendDailyTip(user.phone, tip);
      
      await storage.updateSmsLog(smsLog.id, {
        status: result.success ? 'sent' : 'failed',
        twilioSid: result.sid,
        sentAt: result.success ? new Date() : undefined,
      });
      
      res.json({ success: result.success, error: result.error });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send SMS tip' });
    }
  });

  // Send response reminder
  app.post('/api/sms/reminder', async (req, res) => {
    try {
      const { userId, partnerName } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user || !user.phone || !user.smsEnabled) {
        return res.status(400).json({ error: 'User not found or SMS not enabled' });
      }
      
      const smsLog = await storage.createSmsLog({
        userId,
        type: 'reminder',
        content: `Reminder to respond to ${partnerName}`,
        phone: user.phone,
        status: 'pending',
      });
      
      const result = await sendResponseReminder(user.phone, partnerName);
      
      await storage.updateSmsLog(smsLog.id, {
        status: result.success ? 'sent' : 'failed',
        twilioSid: result.sid,
        sentAt: result.success ? new Date() : undefined,
      });
      
      res.json({ success: result.success, error: result.error });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send reminder' });
    }
  });

  // Emergency help
  app.post('/api/sms/emergency-help', async (req, res) => {
    try {
      const { userId, conversationContext } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user || !user.phone || !user.smsEnabled) {
        return res.status(400).json({ error: 'User not found or SMS not enabled' });
      }
      
      // Generate emergency suggestion using Langflow
      const suggestion = await generateResponseSuggestion(conversationContext, "EMERGENCY_HELP");
      
      const smsLog = await storage.createSmsLog({
        userId,
        type: 'emergency_help',
        content: suggestion,
        phone: user.phone,
        status: 'pending',
      });
      
      const result = await sendEmergencyHelp(user.phone, suggestion);
      
      await storage.updateSmsLog(smsLog.id, {
        status: result.success ? 'sent' : 'failed',
        twilioSid: result.sid,
        sentAt: result.success ? new Date() : undefined,
      });
      
      res.json({ success: result.success, suggestion, error: result.error });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send emergency help' });
    }
  });

  // Analyze conversation with AI
  app.post('/api/analyze-conversation', async (req, res) => {
    try {
      const { conversationId } = req.body;
      const messages = await storage.getMessages(conversationId);
      const messageTexts = messages.map(m => m.content);
      
      const analysis = await analyzeConversation(messageTexts);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze conversation' });
    }
  });

  // Generate conversation starter
  app.post('/api/conversation-starter', async (req, res) => {
    try {
      const { profileInfo } = req.body;
      const starter = await generateConversationStarter(profileInfo);
      res.json({ starter });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate conversation starter' });
    }
  });

  // Generate response suggestion
  app.post('/api/response-suggestion', async (req, res) => {
    try {
      const { conversationContext, partnerMessage } = req.body;
      const suggestion = await generateResponseSuggestion(conversationContext, partnerMessage);
      res.json({ suggestion });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate response suggestion' });
    }
  });

  // Update user SMS preferences
  app.patch('/api/users/:userId/sms-settings', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { smsEnabled, phone } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        smsEnabled,
        phone
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update SMS settings' });
    }
  });

  // Aura chat endpoint
  app.post('/api/aura-chat', async (req, res) => {
    try {
      const { userId, message, conversations } = req.body;
      
      // Generate AI response based on user message and conversation context
      let response = "";
      
      if (message.toLowerCase().includes('sarah')) {
        response = "Sarah seems to be in the Labor stage - she's showing genuine interest in deeper connection. As a Leo ENFP, she values authenticity and enthusiasm. Try sharing something meaningful about your goals or passions to deepen the bond.";
      } else if (message.toLowerCase().includes('dead lead')) {
        response = "For dead leads like Jordan, you have two options: 1) Send a thoughtful re-engagement message referencing something specific from your past conversation, or 2) Focus your energy on active leads. The choice depends on how promising the initial connection was.";
      } else if (message.toLowerCase().includes('alex')) {
        response = "Alex is still in the Lust phase - perfect for building attraction! As a Scorpio INTJ, they appreciate depth and mystery. Ask thought-provoking questions about their passions and share intriguing stories about yourself.";
      } else if (message.toLowerCase().includes('emma')) {
        response = "Emma has reached the Loyal stage - congratulations! As a Gemini ESFJ, she values communication and future planning. This is the perfect time to discuss shared goals and plan meaningful experiences together.";
      } else {
        response = "I'm here to help you navigate your dating journey! You can ask me about specific people in your leads, strategies for different relationship stages, or request personalized advice based on personality types.";
      }
      
      res.json({ response });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });

  // Coach call request endpoint
  app.post('/api/coach-call-request', async (req, res) => {
    try {
      const { userId } = req.body;
      
      // In a real app, this would schedule a call with a human coach
      // For now, we'll just log the request and return success
      console.log(`Coach call requested for user ${userId}`);
      
      res.json({ success: true, message: 'Call request submitted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to request coach call' });
    }
  });

  // Setup WhatsApp webhook
  await setupWhatsAppWebhook(app);

  // Send WhatsApp message endpoint
  app.post('/api/whatsapp/send', async (req, res) => {
    try {
      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ error: 'Phone number and message are required' });
      }
      
      const result = await sendWhatsAppMessage(phoneNumber, message);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send WhatsApp message' });
    }
  });

  // Get WhatsApp status endpoint
  app.get('/api/whatsapp/status', async (req, res) => {
    try {
      const isConfigured = !!(process.env.TWILIO_ACCOUNT_SID && 
                             process.env.TWILIO_AUTH_TOKEN && 
                             process.env.TWILIO_PHONE_NUMBER &&
                             process.env.MISTRAL_API_KEY);
      
      res.json({ 
        configured: isConfigured,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || null
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get WhatsApp status' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
