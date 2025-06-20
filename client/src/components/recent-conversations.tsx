import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RecentConversationsProps {
  userId: number;
  onConversationSelect: (conversation: Conversation) => void;
}

export function RecentConversations({ userId, onConversationSelect }: RecentConversationsProps) {
  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations', userId],
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-200">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6">
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-accent';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-neutral';
      default: return 'bg-neutral';
    }
  };

  const getEngagementLabel = (level: string) => {
    switch (level) {
      case 'high': return 'High Engagement';
      case 'medium': return 'Needs Response';
      case 'low': return 'Low Activity';
      default: return 'Active';
    }
  };

  const getEngagementTextColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-accent';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-neutral';
      default: return 'text-neutral';
    }
  };

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Conversations</h2>
          <Button variant="ghost" className="text-primary hover:text-primary/80 text-sm font-medium">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-slate-200">
          {conversations?.map((conversation) => (
            <div 
              key={conversation.id}
              className="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => onConversationSelect(conversation)}
            >
              <div className="flex items-start space-x-4">
                <img 
                  src={conversation.partnerImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.partnerName}`}
                  alt={`Profile of ${conversation.partnerName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-900">{conversation.partnerName}</h3>
                    <span className="text-xs text-neutral">
                      {conversation.lastActive ? formatDistanceToNow(new Date(conversation.lastActive), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral mt-1 truncate">
                    {conversation.lastMessage || "No messages yet"}
                  </p>
                  <div className="flex items-center mt-2 space-x-3">
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 ${getEngagementColor(conversation.engagementLevel || 'medium')} rounded-full`}></div>
                      <span className={`text-xs ${getEngagementTextColor(conversation.engagementLevel || 'medium')} font-medium`}>
                        {getEngagementLabel(conversation.engagementLevel || 'medium')}
                      </span>
                    </div>
                    {conversation.engagementLevel === 'high' && (
                      <>
                        <span className="text-xs text-neutral">•</span>
                        <span className="text-xs text-neutral">AI Suggestion Available</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {(!conversations || conversations.length === 0) && (
            <div className="p-6 text-center">
              <p className="text-neutral">No conversations yet. Start chatting to see them here!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
