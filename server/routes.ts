import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertMessageSchema, insertCoachingTipSchema } from "@shared/schema";
import { sendDailyTip, sendResponseReminder, sendEmergencyHelp, sendWhatsAppMessage, handleWhatsAppIncoming } from "./services/twilio";
import { analyzeConversation, generateConversationStarter, analyzeProfile, generateResponseSuggestion } from "./services/langflow";

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

  // WhatsApp webhook for incoming messages
  app.post('/webhook/whatsapp', async (req, res) => {
    try {
      const { From, To, Body, MessageSid } = req.body;
      
      if (!From || !Body) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Extract phone number from WhatsApp format
      const phoneNumber = From.replace('whatsapp:', '');
      
      // Find or create user based on phone number
      let user = await storage.getUserByUsername(phoneNumber);
      if (!user) {
        user = await storage.createUser({
          username: phoneNumber,
          password: 'whatsapp_user',
          firstName: 'WhatsApp',
          lastName: 'User',
          phone: phoneNumber,
          smsEnabled: true,
        });
      }

      // Get conversation history for context
      const conversations = await storage.getConversations(user.id);
      let conversation = conversations.find(c => c.partnerName === 'LoveCoach AI');
      
      if (!conversation) {
        conversation = await storage.createConversation({
          userId: user.id,
          partnerName: 'LoveCoach AI',
          partnerImage: null,
          lastMessage: Body,
          engagementLevel: 'high',
          status: 'active',
          responseRate: 100,
        });
      }

      // Store incoming message
      await storage.createMessage({
        conversationId: conversation.id,
        content: Body,
        isFromUser: true,
        aiSuggested: false,
      });

      // Get recent conversation history for context
      const messages = await storage.getMessages(conversation.id);
      const conversationHistory = messages.slice(-10).map(m => m.content);

      // Generate AI response and send via WhatsApp
      const aiResponse = await handleWhatsAppIncoming(From, Body, conversationHistory);

      // Store AI response
      await storage.createMessage({
        conversationId: conversation.id,
        content: aiResponse,
        isFromUser: false,
        aiSuggested: true,
      });

      // Update conversation
      await storage.updateConversation(conversation.id, {
        lastMessage: aiResponse,
      });

      // Log the interaction
      await storage.createSmsLog({
        userId: user.id,
        type: 'whatsapp_chat',
        content: `User: ${Body}\nAI: ${aiResponse}`,
        phone: phoneNumber,
        status: 'sent',
        twilioSid: MessageSid,
        sentAt: new Date(),
      });

      res.status(200).send('OK');
    } catch (error) {
      console.error('WhatsApp webhook error:', error);
      res.status(500).json({ error: 'Failed to process WhatsApp message' });
    }
  });

  // Send WhatsApp message API
  app.post('/api/whatsapp/send', async (req, res) => {
    try {
      const { to, message, userId } = req.body;
      
      if (!to || !message) {
        return res.status(400).json({ error: 'Phone number and message are required' });
      }

      const result = await sendWhatsAppMessage(to, message);
      
      if (userId) {
        // Log the outgoing message
        await storage.createSmsLog({
          userId,
          type: 'whatsapp_outgoing',
          content: message,
          phone: to,
          status: result.success ? 'sent' : 'failed',
          twilioSid: result.sid,
          sentAt: result.success ? new Date() : undefined,
        });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send WhatsApp message' });
    }
  });

  // Get WhatsApp conversation for a user
  app.get('/api/whatsapp/conversation/:phoneNumber', async (req, res) => {
    try {
      const phoneNumber = req.params.phoneNumber;
      
      // Find user by phone number
      const user = await storage.getUserByUsername(phoneNumber);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get WhatsApp conversation
      const conversations = await storage.getConversations(user.id);
      const whatsappConv = conversations.find(c => c.partnerName === 'LoveCoach AI');
      
      if (!whatsappConv) {
        return res.json({ conversation: null, messages: [] });
      }

      const messages = await storage.getMessages(whatsappConv.id);
      res.json({ conversation: whatsappConv, messages });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch WhatsApp conversation' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
