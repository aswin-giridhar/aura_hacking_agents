import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Bot } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Conversation, Message } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ConversationModalProps {
  conversation: Conversation | null;
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

interface ConversationData {
  conversation: Conversation;
  messages: Message[];
}

export function ConversationModal({ conversation, isOpen, onClose, userId }: ConversationModalProps) {
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversationData, isLoading } = useQuery<ConversationData>({
    queryKey: ['/api/conversations', userId, conversation?.id],
    enabled: !!conversation?.id && isOpen,
  });

  const suggestionMutation = useMutation({
    mutationFn: async () => {
      const messages = conversationData?.messages || [];
      const conversationContext = messages.map(m => m.content).join('\n');
      const latestMessage = messages[messages.length - 1]?.content || "";
      
      const response = await apiRequest('POST', '/api/response-suggestion', {
        conversationContext,
        partnerMessage: latestMessage,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAiSuggestion(data.suggestion);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI suggestion",
        variant: "destructive",
      });
    },
  });

  const emergencyHelpMutation = useMutation({
    mutationFn: async () => {
      const messages = conversationData?.messages || [];
      const conversationContext = messages.map(m => m.content).join('\n');
      
      const response = await apiRequest('POST', '/api/sms/emergency-help', {
        userId,
        conversationContext,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Emergency Help Sent!",
          description: "Check your phone for instant conversation rescue suggestions.",
        });
      } else {
        toast({
          title: "SMS Error",
          description: data.error || "Failed to send emergency help",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send emergency help",
        variant: "destructive",
      });
    },
  });

  if (!conversation) return null;

  const handleGetSuggestion = () => {
    suggestionMutation.mutate();
  };

  const handleEmergencyHelp = () => {
    emergencyHelpMutation.mutate();
  };

  const handleUseSuggestion = () => {
    // In a real app, this would integrate with the messaging platform
    toast({
      title: "Suggestion Copied",
      description: "The AI suggestion has been copied to your clipboard.",
    });
    navigator.clipboard.writeText(aiSuggestion);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <img 
              src={conversation.partnerImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.partnerName}`}
              alt={`${conversation.partnerName}'s profile`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                {conversation.partnerName}
              </DialogTitle>
              <p className="text-sm text-accent capitalize">
                {conversation.engagementLevel} Engagement
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <div className="flex h-[600px]">
          {/* Conversation Thread */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))
              ) : (
                conversationData?.messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs rounded-2xl px-4 py-2 ${
                      message.isFromUser 
                        ? 'bg-primary text-white rounded-tr-md' 
                        : 'bg-slate-100 text-slate-900 rounded-tl-md'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <span className={`text-xs ${
                        message.isFromUser ? 'text-white/70' : 'text-neutral'
                      }`}>
                        {message.timestamp ? formatDistanceToNow(new Date(message.timestamp), { addSuffix: true }) : 'Just now'}
                      </span>
                    </div>
                  </div>
                ))
              )}
              
              {(!conversationData?.messages || conversationData.messages.length === 0) && !isLoading && (
                <div className="text-center py-8">
                  <p className="text-neutral">No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>
            
            {/* AI Suggestion Bar */}
            <div className="border-t border-slate-200 p-4 bg-primary/5">
              <div className="flex items-center space-x-2 mb-2">
                <Bot className="text-primary h-4 w-4" />
                <span className="text-sm font-medium text-primary">AI Suggestion</span>
              </div>
              
              {aiSuggestion ? (
                <>
                  <p className="text-sm text-slate-700 mb-3">{aiSuggestion}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleUseSuggestion}>
                      Use This
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGetSuggestion}
                      disabled={suggestionMutation.isPending}
                    >
                      Get Another
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-700">
                    Get AI-powered suggestions for your next message.
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={handleGetSuggestion}
                      disabled={suggestionMutation.isPending}
                    >
                      {suggestionMutation.isPending ? 'Generating...' : 'Get Suggestion'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEmergencyHelp}
                      disabled={emergencyHelpMutation.isPending}
                    >
                      {emergencyHelpMutation.isPending ? 'Sending...' : 'Emergency Help'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Coaching Panel */}
          <div className="w-80 bg-slate-50 border-l border-slate-200 p-6 overflow-y-auto">
            <h3 className="font-semibold text-slate-900 mb-4">Coaching Insights</h3>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Conversation Health</h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    conversation.engagementLevel === 'high' ? 'bg-accent' :
                    conversation.engagementLevel === 'medium' ? 'bg-yellow-400' : 'bg-neutral'
                  }`}></div>
                  <span className={`text-sm font-medium capitalize ${
                    conversation.engagementLevel === 'high' ? 'text-accent' :
                    conversation.engagementLevel === 'medium' ? 'text-yellow-600' : 'text-neutral'
                  }`}>
                    {conversation.engagementLevel || 'Medium'}
                  </span>
                </div>
                <p className="text-xs text-neutral mt-1">
                  {conversation.engagementLevel === 'high' ? 'Great back-and-forth flow' :
                   conversation.engagementLevel === 'medium' ? 'Good conversation pace' :
                   'Could use more engagement'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Response Rate</h4>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {conversation.responseRate || 0}%
                </div>
                <p className="text-xs text-neutral">Average response rate</p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Next Steps</h4>
                <p className="text-xs text-neutral">
                  {conversation.engagementLevel === 'high' 
                    ? 'Consider suggesting a date or video call'
                    : 'Ask more engaging questions to boost interaction'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
