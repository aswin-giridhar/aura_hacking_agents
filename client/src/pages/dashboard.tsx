import { useState } from "react";
import { NavigationHeader } from "@/components/navigation-header";
import { StatsOverview } from "@/components/stats-overview";
import { RecentConversations } from "@/components/recent-conversations";
import { CoachingInsights } from "@/components/coaching-insights";
import { QuickActions } from "@/components/quick-actions";
import { ConversationModal } from "@/components/conversation-modal";
import { useToast } from "@/hooks/use-toast";
import type { Conversation } from "@shared/schema";

export default function Dashboard() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
  // In a real app, this would come from authentication
  const userId = 1;
  const userName = "Jordan";

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedConversation(null);
  };

  const handleStartNewConversation = () => {
    toast({
      title: "New Conversation",
      description: "This would open a new conversation interface.",
    });
  };

  const handleAnalyzeConversations = () => {
    toast({
      title: "Analyzing Conversations",
      description: "AI analysis of your conversations is starting...",
    });
  };

  const handleScheduleDate = () => {
    toast({
      title: "Date Planning",
      description: "AI is generating personalized date suggestions...",
    });
  };

  const handleEmergencyHelp = () => {
    toast({
      title: "Emergency Help",
      description: "Emergency conversation rescue tips will be sent to your phone!",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-neutral">Here's your dating progress and latest coaching insights.</p>
        </div>

        {/* Stats Overview */}
        <StatsOverview userId={userId} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Conversations */}
          <div className="lg:col-span-2">
            <RecentConversations 
              userId={userId} 
              onConversationSelect={handleConversationSelect}
            />
          </div>

          {/* Coaching Insights */}
          <div>
            <CoachingInsights userId={userId} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <QuickActions
            onStartNewConversation={handleStartNewConversation}
            onAnalyzeConversations={handleAnalyzeConversations}
            onScheduleDate={handleScheduleDate}
            onEmergencyHelp={handleEmergencyHelp}
          />
        </div>
      </div>

      {/* Conversation Modal */}
      <ConversationModal
        conversation={selectedConversation}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        userId={userId}
      />
    </div>
  );
}
