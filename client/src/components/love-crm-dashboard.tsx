import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Flame, Snowflake, AlertTriangle, CheckCircle, ArrowRight, Clock, Skull } from "lucide-react";
import type { Conversation } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface LoveCRMDashboardProps {
  userId: number;
  onLeadSelect: (lead: Conversation) => void;
}

export function LoveCRMDashboard({ userId, onLeadSelect }: LoveCRMDashboardProps) {
  const { data: leads, isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations', userId],
  });

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'lust': return <Flame className="w-4 h-4 text-red-500" />;
      case 'labor': return <Heart className="w-4 h-4 text-orange-500" />;
      case 'loyal': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dead': return <Skull className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lust': return 'bg-red-50 border-red-200 text-red-700';
      case 'labor': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'loyal': return 'bg-green-50 border-green-200 text-green-700';
      case 'dead': return 'bg-gray-50 border-gray-200 text-gray-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getTemperatureIcon = (temp: string) => {
    switch (temp) {
      case 'hot': return <Flame className="w-3 h-3 text-red-500" />;
      case 'warm': return <Heart className="w-3 h-3 text-orange-500" />;
      case 'lukewarm': return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'cold': return <Snowflake className="w-3 h-3 text-blue-500" />;
      case 'confused': return <AlertTriangle className="w-3 h-3 text-purple-500" />;
      default: return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTemperatureColor = (temp: string) => {
    switch (temp) {
      case 'hot': return 'text-red-600 bg-red-50';
      case 'warm': return 'text-orange-600 bg-orange-50';
      case 'lukewarm': return 'text-yellow-600 bg-yellow-50';
      case 'cold': return 'text-blue-600 bg-blue-50';
      case 'confused': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const groupLeadsByStage = (leads: Conversation[]) => {
    return {
      lust: leads.filter(lead => lead.status === 'lust'),
      labor: leads.filter(lead => lead.status === 'labor'),
      loyal: leads.filter(lead => lead.status === 'loyal'),
      dead: leads.filter(lead => lead.status === 'dead'),
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stageCounts = groupLeadsByStage(leads || []);
  const stages = [
    { name: 'Lust', key: 'lust', leads: stageCounts.lust, color: 'text-red-600' },
    { name: 'Labor', key: 'labor', leads: stageCounts.labor, color: 'text-orange-600' },
    { name: 'Loyal', key: 'loyal', leads: stageCounts.loyal, color: 'text-green-600' },
    { name: 'DEAD', key: 'dead', leads: stageCounts.dead, color: 'text-gray-600' },
  ];

  const LeadCard = ({ lead }: { lead: Conversation }) => (
    <Card 
      key={lead.id} 
      className="cursor-pointer hover:shadow-md transition-shadow mb-3"
      onClick={() => onLeadSelect(lead)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={lead.partnerImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.partnerName}`}
              alt={lead.partnerName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h4 className="font-medium text-sm">{lead.partnerName}</h4>
              <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${getTemperatureColor(lead.emotionalTemperature || 'neutral')}`}>
                {getTemperatureIcon(lead.emotionalTemperature || 'neutral')}
                <span className="capitalize">{lead.emotionalTemperature}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-2">
        {/* Recent Interaction */}
        <div className="text-xs text-gray-600">
          <span className="font-medium">Last: </span>
          {lead.lastMessage && lead.lastMessage.length > 40 
            ? `${lead.lastMessage.substring(0, 40)}...` 
            : lead.lastMessage || 'No messages'}
        </div>
        
        <div className="text-xs text-gray-500">
          {lead.lastActive ? formatDistanceToNow(new Date(lead.lastActive), { addSuffix: true }) : 'No activity'}
        </div>

        {/* Flags */}
        <div className="space-y-1">
          {lead.greenFlags && lead.greenFlags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lead.greenFlags.slice(0, 2).map((flag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {flag}
                </Badge>
              ))}
            </div>
          )}
          
          {lead.redFlags && lead.redFlags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lead.redFlags.slice(0, 2).map((flag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {flag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* AI Suggested Next Step */}
        {lead.aiSuggestedNextStep && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
            <div className="text-xs font-medium text-purple-900 mb-1">AI Suggestion:</div>
            <div className="text-xs text-purple-700">
              {lead.aiSuggestedNextStep.length > 80 
                ? `${lead.aiSuggestedNextStep.substring(0, 80)}...` 
                : lead.aiSuggestedNextStep}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Love CRM Pipeline</h2>
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => (
            <div key={stage.key} className="flex items-center">
              <div className="text-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStageColor(stage.key)}`}>
                  {getStageIcon(stage.key)}
                </div>
                <h3 className={`font-semibold mt-2 ${stage.color}`}>{stage.name}</h3>
                <p className="text-sm text-gray-600">{stage.leads.length} leads</p>
              </div>
              {index < stages.length - 1 && (
                <ArrowRight className="w-6 h-6 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stages.map((stage) => (
          <div key={stage.key} className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${getStageColor(stage.key)}`}>
              <div className="flex items-center space-x-2 mb-2">
                {getStageIcon(stage.key)}
                <h3 className="font-semibold">{stage.name}</h3>
                <Badge variant="secondary">{stage.leads.length}</Badge>
              </div>
              
              {stage.leads.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No leads in this stage</p>
              ) : (
                <div className="space-y-3">
                  {stage.leads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Stats */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="font-semibold text-gray-900 mb-4">Pipeline Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stageCounts.lust.length}</div>
            <div className="text-sm text-gray-600">New Prospects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stageCounts.labor.length}</div>
            <div className="text-sm text-gray-600">Building Connection</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stageCounts.loyal.length}</div>
            <div className="text-sm text-gray-600">Committed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stageCounts.dead.length}</div>
            <div className="text-sm text-gray-600">Archived</div>
          </div>
        </div>
      </div>
    </div>
  );
}