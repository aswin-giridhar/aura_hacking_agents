import { 
  users, conversations, messages, coachingTips, smsLogs, workflows, stats,
  type User, type InsertUser,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type CoachingTip, type InsertCoachingTip,
  type SmsLog, type InsertSmsLog,
  type Workflow, type InsertWorkflow,
  type Stats, type InsertStats
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Conversation operations
  getConversations(userId: number): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, updates: Partial<InsertConversation>): Promise<Conversation | undefined>;

  // Message operations
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Coaching tip operations
  getCoachingTips(userId: number): Promise<CoachingTip[]>;
  createCoachingTip(tip: InsertCoachingTip): Promise<CoachingTip>;
  markTipAsRead(id: number): Promise<void>;

  // SMS log operations
  getSmsLogs(userId: number): Promise<SmsLog[]>;
  createSmsLog(log: InsertSmsLog): Promise<SmsLog>;
  updateSmsLog(id: number, updates: Partial<InsertSmsLog>): Promise<SmsLog | undefined>;

  // Workflow operations
  getWorkflows(userId: number): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined>;

  // Stats operations
  getStats(userId: number): Promise<Stats | undefined>;
  updateStats(userId: number, stats: Partial<InsertStats>): Promise<Stats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private conversations: Map<number, Conversation> = new Map();
  private messages: Map<number, Message> = new Map();
  private coachingTips: Map<number, CoachingTip> = new Map();
  private smsLogs: Map<number, SmsLog> = new Map();
  private workflows: Map<number, Workflow> = new Map();
  private statsMap: Map<number, Stats> = new Map();
  
  private currentUserId = 1;
  private currentConversationId = 1;
  private currentMessageId = 1;
  private currentTipId = 1;
  private currentSmsLogId = 1;
  private currentWorkflowId = 1;
  private currentStatsId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create a test user
    const user: User = {
      id: 1,
      username: "jordan_doe",
      password: "password123",
      firstName: "Jordan",
      lastName: "Doe",
      phone: "+1234567890",
      smsEnabled: true,
      createdAt: new Date(),
    };
    this.users.set(1, user);
    this.currentUserId = 2;

    // Create sample conversations for Aura dating coach
    const sampleConversations: Conversation[] = [
      {
        id: 1,
        userId: 1,
        partnerName: "Sarah M.",
        partnerImage: "https://images.unsplash.com/photo-1494790108755-2616b9f5c5c3?w=100&h=100&fit=crop&crop=face",
        lastMessage: "That sounds like a great restaurant! I'd love to try...",
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: "active_lead",
        relationshipStage: "labor",
        starSign: "Leo",
        mbtiType: "ENFP",
        responseRate: 85,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: 2,
        userId: 1,
        partnerName: "Alex R.",
        partnerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        lastMessage: "Hey, thanks for last night. Had fun!",
        lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        status: "active_lead",
        relationshipStage: "lust",
        starSign: "Scorpio",
        mbtiType: "INTJ",
        responseRate: 65,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: 3,
        userId: 1,
        partnerName: "Emma K.",
        partnerImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        lastMessage: "I had such a great time yesterday! When can we...",
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: "active_lead",
        relationshipStage: "loyal",
        starSign: "Gemini",
        mbtiType: "ESFJ",
        responseRate: 92,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        id: 4,
        userId: 1,
        partnerName: "Jordan P.",
        partnerImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        lastMessage: "Seen two weeks ago",
        lastActive: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        status: "dead_lead",
        relationshipStage: "lust",
        starSign: "Virgo",
        mbtiType: "ISTP",
        responseRate: 20,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      },
    ];

    sampleConversations.forEach(conv => {
      this.conversations.set(conv.id, conv);
    });
    this.currentConversationId = 4;

    // Create sample messages for first conversation
    const sampleMessages: Message[] = [
      {
        id: 1,
        conversationId: 1,
        content: "Hey Sarah! How was your weekend hiking trip?",
        isFromUser: true,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        aiSuggested: false,
      },
      {
        id: 2,
        conversationId: 1,
        content: "It was amazing! The views from Half Dome were incredible. Have you been to Yosemite?",
        isFromUser: false,
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        aiSuggested: false,
      },
    ];

    sampleMessages.forEach(msg => {
      this.messages.set(msg.id, msg);
    });
    this.currentMessageId = 3;

    // Create sample coaching tips
    const sampleTips: CoachingTip[] = [
      {
        id: 1,
        userId: 1,
        type: "conversation_starter",
        title: "Conversation Starter Tip",
        content: "Based on Sarah's profile, ask about her recent hiking trip to Yosemite. She mentioned loving outdoor adventures.",
        conversationId: 1,
        isRead: false,
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: 1,
        type: "response_pattern",
        title: "Response Pattern",
        content: "You get 40% better responses when you ask open-ended questions. Try \"What's been the highlight of your week?\"",
        conversationId: null,
        isRead: false,
        createdAt: new Date(),
      },
      {
        id: 3,
        userId: 1,
        type: "date_suggestion",
        title: "Date Suggestion",
        content: "Emma loves art galleries. The MOMA has a new exhibition this weekend - perfect for a creative date!",
        conversationId: 3,
        isRead: false,
        createdAt: new Date(),
      },
    ];

    sampleTips.forEach(tip => {
      this.coachingTips.set(tip.id, tip);
    });
    this.currentTipId = 4;

    // Create sample workflows
    const sampleWorkflows: Workflow[] = [
      {
        id: 1,
        userId: 1,
        name: "Profile Analysis",
        status: "completed",
        lastUpdated: new Date(Date.now() - 10 * 60 * 1000),
        results: { score: 85, insights: ["Strong profile", "Good photo variety"] },
      },
      {
        id: 2,
        userId: 1,
        name: "Conversation Processing",
        status: "running",
        lastUpdated: new Date(Date.now() - 2 * 60 * 1000),
        results: null,
      },
      {
        id: 3,
        userId: 1,
        name: "Recommendation Engine",
        status: "queued",
        lastUpdated: new Date(Date.now() - 5 * 60 * 1000),
        results: null,
      },
    ];

    sampleWorkflows.forEach(workflow => {
      this.workflows.set(workflow.id, workflow);
    });
    this.currentWorkflowId = 4;

    // Create sample stats
    const userStats: Stats = {
      id: 1,
      userId: 1,
      activeConversations: 12,
      responseRate: 78,
      coachingTipsSent: 47,
      successScore: 84, // 8.4 * 10
      updatedAt: new Date(),
    };
    this.statsMap.set(1, userStats);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      phone: insertUser.phone || null,
      smsEnabled: insertUser.smsEnabled ?? true,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Conversation operations
  async getConversations(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => new Date(b.lastActive!).getTime() - new Date(a.lastActive!).getTime());
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = {
      ...insertConversation,
      id,
      status: insertConversation.status || 'active_lead',
      partnerImage: insertConversation.partnerImage || null,
      lastMessage: insertConversation.lastMessage || null,
      relationshipStage: insertConversation.relationshipStage || 'lust',
      starSign: insertConversation.starSign || null,
      mbtiType: insertConversation.mbtiType || null,
      responseRate: insertConversation.responseRate ?? 0,
      lastActive: new Date(),
      createdAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: number, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation = { ...conversation, ...updates };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Message operations
  async getMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      aiSuggested: insertMessage.aiSuggested ?? false,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  // Coaching tip operations
  async getCoachingTips(userId: number): Promise<CoachingTip[]> {
    return Array.from(this.coachingTips.values())
      .filter(tip => tip.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createCoachingTip(insertTip: InsertCoachingTip): Promise<CoachingTip> {
    const id = this.currentTipId++;
    const tip: CoachingTip = {
      ...insertTip,
      id,
      conversationId: insertTip.conversationId || null,
      isRead: insertTip.isRead ?? false,
      createdAt: new Date(),
    };
    this.coachingTips.set(id, tip);
    return tip;
  }

  async markTipAsRead(id: number): Promise<void> {
    const tip = this.coachingTips.get(id);
    if (tip) {
      tip.isRead = true;
      this.coachingTips.set(id, tip);
    }
  }

  // SMS log operations
  async getSmsLogs(userId: number): Promise<SmsLog[]> {
    return Array.from(this.smsLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createSmsLog(insertLog: InsertSmsLog): Promise<SmsLog> {
    const id = this.currentSmsLogId++;
    const log: SmsLog = {
      ...insertLog,
      id,
      status: insertLog.status || 'pending',
      twilioSid: insertLog.twilioSid || null,
      sentAt: null,
      createdAt: new Date(),
    };
    this.smsLogs.set(id, log);
    return log;
  }

  async updateSmsLog(id: number, updates: Partial<InsertSmsLog>): Promise<SmsLog | undefined> {
    const log = this.smsLogs.get(id);
    if (!log) return undefined;
    
    const updatedLog = { ...log, ...updates };
    this.smsLogs.set(id, updatedLog);
    return updatedLog;
  }

  // Workflow operations
  async getWorkflows(userId: number): Promise<Workflow[]> {
    return Array.from(this.workflows.values())
      .filter(workflow => workflow.userId === userId)
      .sort((a, b) => new Date(b.lastUpdated!).getTime() - new Date(a.lastUpdated!).getTime());
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.currentWorkflowId++;
    const workflow: Workflow = {
      ...insertWorkflow,
      id,
      status: insertWorkflow.status || 'queued',
      results: insertWorkflow.results || null,
      lastUpdated: new Date(),
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;
    
    const updatedWorkflow = { 
      ...workflow, 
      ...updates,
      lastUpdated: new Date()
    };
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  // Stats operations
  async getStats(userId: number): Promise<Stats | undefined> {
    return Array.from(this.statsMap.values()).find(stats => stats.userId === userId);
  }

  async updateStats(userId: number, updates: Partial<InsertStats>): Promise<Stats> {
    const existingStats = await this.getStats(userId);
    
    if (existingStats) {
      const updatedStats = { 
        ...existingStats, 
        ...updates,
        updatedAt: new Date()
      };
      this.statsMap.set(existingStats.id, updatedStats);
      return updatedStats;
    } else {
      const id = this.currentStatsId++;
      const newStats: Stats = {
        id,
        userId,
        activeConversations: 0,
        responseRate: 0,
        coachingTipsSent: 0,
        successScore: 0,
        updatedAt: new Date(),
        ...updates,
      };
      this.statsMap.set(id, newStats);
      return newStats;
    }
  }
}

export const storage = new MemStorage();
