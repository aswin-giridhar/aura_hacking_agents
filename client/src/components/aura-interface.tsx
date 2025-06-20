import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Phone, Star, Brain } from "lucide-react";
import { WhatsAppChat } from "@/components/whatsapp-chat";
import type { Conversation } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface AuraInterfaceProps {
  userId: number;
}

export function AuraInterface({ userId }: AuraInterfaceProps) {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{id: string, type: 'user' | 'aura', message: string}>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations', userId],
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/aura-chat', {
        userId,
        message,
        conversations: conversations || []
      });
      return response.json();
    },
    onSuccess: (data) => {
      const newChatEntry = {
        id: Date.now().toString(),
        type: 'aura' as const,
        message: data.response
      };
      setChatHistory(prev => [...prev, newChatEntry]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get response from Aura",
        variant: "destructive",
      });
    },
  });

  const callRequestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/coach-call-request', {
        userId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Call Requested",
        description: "Our human relationship expert will contact you shortly to schedule a personalized coaching session.",
      });
    },
  });

  const getStageProgress = (stage: string) => {
    switch (stage) {
      case 'lust': return 33;
      case 'labor': return 66;
      case 'loyal': return 100;
      default: return 0;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lust': return 'bg-red-500';
      case 'labor': return 'bg-orange-500';
      case 'loyal': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active_lead' ? 'default' : 'secondary';
  };

  const getAdviceForProfile = (conversation: Conversation) => {
    const { relationshipStage, status, mbtiType, starSign } = conversation;
    
    if (status === 'dead_lead') {
      return {
        summary: `This connection has gone cold - no activity for ${formatDistanceToNow(new Date(conversation.lastActive!), { addSuffix: true })}.`,
        suggestion: "Consider sending a thoughtful re-engagement message or focus your energy on more active leads."
      };
    }

    if (relationshipStage === 'lust') {
      return {
        summary: `You're in the attraction phase with this ${starSign} ${mbtiType}. Building initial chemistry and interest.`,
        suggestion: "Focus on playful banter and creating emotional connection. Ask engaging questions about their passions."
      };
    }

    if (relationshipStage === 'labor') {
      return {
        summary: `Moving into the commitment phase. This ${mbtiType} personality type values consistency and deeper connection.`,
        suggestion: "It's time to show genuine interest in their life goals. Plan more meaningful dates and share your authentic self."
      };
    }

    return {
      summary: `You've reached the loyalty stage! This ${starSign} values long-term connection and stability.`,
      suggestion: "Focus on building future plans together and maintaining the emotional bond you've created."
    };
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      message: chatInput
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    
    if (chatInput.toLowerCase().includes('call') || chatInput.toLowerCase().includes('coach')) {
      callRequestMutation.mutate();
    } else {
      chatMutation.mutate(chatInput);
    }
    
    setChatInput("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-purple-600">Aura is analyzing your dating profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Heart className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Aura</h1>
                <p className="text-sm text-gray-600">Your AI-Powered Relationship Coach</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <WhatsAppChat />
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Dating Leads Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Current Dating Leads</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversations?.map((conversation) => {
              const advice = getAdviceForProfile(conversation);
              return (
                <Card key={conversation.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={conversation.partnerImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.partnerName}`}
                          alt={conversation.partnerName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{conversation.partnerName}</h3>
                          <Badge variant={getStatusBadgeVariant(conversation.status || 'active_lead')}>
                            {conversation.status === 'active_lead' ? 'Active Lead' : 'Dead Lead'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Relationship Stage Progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Stage</span>
                        <span className="font-medium capitalize">{conversation.relationshipStage}</span>
                      </div>
                      <Progress 
                        value={getStageProgress(conversation.relationshipStage || 'lust')} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Lust</span>
                        <span>Labor</span>
                        <span>Loyal</span>
                      </div>
                    </div>

                    {/* Personality Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <Star className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Star Sign</div>
                        <div className="font-medium text-sm">{conversation.starSign}</div>
                      </div>
                      <div className="text-center p-2 bg-pink-50 rounded-lg">
                        <Brain className="w-4 h-4 text-pink-600 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">MBTI</div>
                        <div className="font-medium text-sm">{conversation.mbtiType}</div>
                      </div>
                    </div>

                    {/* Advice Section */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Current Situation</h4>
                      <p className="text-xs text-gray-700 mb-2">{advice.summary}</p>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">Suggestion</h4>
                      <p className="text-xs text-gray-700">{advice.suggestion}</p>
                    </div>

                    {/* Last Message */}
                    {conversation.lastMessage && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Last: </span>
                        {conversation.lastMessage}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Chat Interface */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Chat with Aura</h3>
            </div>
            <p className="text-sm text-gray-600">
              Discuss any of these profiles, ask for specific advice, or request a call with a human coach.
            </p>
          </CardHeader>
          
          <CardContent>
            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      chat.type === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {chat.message}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="flex space-x-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="What would you like to talk about?"
                className="flex-1"
                disabled={chatMutation.isPending}
              />
              <Button 
                type="submit" 
                disabled={chatMutation.isPending || !chatInput.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {chatMutation.isPending ? 'Sending...' : 'Send'}
              </Button>
            </form>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setChatInput("How can I improve my conversation with Sarah?")}
              >
                Ask about Sarah
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setChatInput("What should I do about my dead leads?")}
              >
                Dead leads advice
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setChatInput("I'd like to schedule a call with a human coach")}
                className="text-purple-600 border-purple-600"
              >
                <Phone className="w-4 h-4 mr-1" />
                Request Coach Call
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}