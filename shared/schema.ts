import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  smsEnabled: boolean("sms_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  partnerName: text("partner_name").notNull(),
  partnerImage: text("partner_image"),
  lastMessage: text("last_message"),
  lastActive: timestamp("last_active").defaultNow(),
  status: text("status").default("lust"), // lust, labor, loyal, dead
  relationshipStage: text("relationship_stage").default("lust"), // lust, labor, loyal, dead
  starSign: text("star_sign"),
  mbtiType: text("mbti_type"),
  emotionalTemperature: text("emotional_temperature").default("neutral"), // cold, lukewarm, warm, hot, confused
  redFlags: text("red_flags").array().default([]),
  greenFlags: text("green_flags").array().default([]),
  aiSuggestedNextStep: text("ai_suggested_next_step"),
  responseRate: integer("response_rate").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  content: text("content").notNull(),
  isFromUser: boolean("is_from_user").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  aiSuggested: boolean("ai_suggested").default(false),
});

export const coachingTips = pgTable("coaching_tips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // conversation_starter, response_pattern, date_suggestion, general
  title: text("title").notNull(),
  content: text("content").notNull(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const smsLogs = pgTable("sms_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // daily_tip, reminder, emergency_help
  content: text("content").notNull(),
  phone: text("phone").notNull(),
  status: text("status").default("pending"), // pending, sent, failed
  twilioSid: text("twilio_sid"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  status: text("status").default("queued"), // queued, running, completed, failed
  lastUpdated: timestamp("last_updated").defaultNow(),
  results: jsonb("results"),
});

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activeConversations: integer("active_conversations").default(0),
  responseRate: integer("response_rate").default(0),
  coachingTipsSent: integer("coaching_tips_sent").default(0),
  successScore: integer("success_score").default(0), // stored as integer (8.4 becomes 84)
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertCoachingTipSchema = createInsertSchema(coachingTips).omit({
  id: true,
  createdAt: true,
});

export const insertSmsLogSchema = createInsertSchema(smsLogs).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  lastUpdated: true,
});

export const insertStatsSchema = createInsertSchema(stats).omit({
  id: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertCoachingTip = z.infer<typeof insertCoachingTipSchema>;
export type CoachingTip = typeof coachingTips.$inferSelect;

export type InsertSmsLog = z.infer<typeof insertSmsLogSchema>;
export type SmsLog = typeof smsLogs.$inferSelect;

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

export type InsertStats = z.infer<typeof insertStatsSchema>;
export type Stats = typeof stats.$inferSelect;
