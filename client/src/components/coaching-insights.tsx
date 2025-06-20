import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, TrendingUp, Heart, CheckCircle, RotateCw, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { CoachingTip, Workflow } from "@shared/schema";

interface CoachingInsightsProps {
  userId: number;
}

export function CoachingInsights({ userId }: CoachingInsightsProps) {
  const { data: tips, isLoading: tipsLoading } = useQuery<CoachingTip[]>({
    queryKey: ['/api/coaching-tips', userId],
  });

  const { data: workflows, isLoading: workflowsLoading } = useQuery<Workflow[]>({
    queryKey: ['/api/workflows', userId],
  });

  const getIconForTipType = (type: string) => {
    switch (type) {
      case 'conversation_starter': return Bot;
      case 'response_pattern': return TrendingUp;
      case 'date_suggestion': return Heart;
      default: return Bot;
    }
  };

  const getColorForTipType = (type: string) => {
    switch (type) {
      case 'conversation_starter': return 'bg-primary/5 border-primary/10';
      case 'response_pattern': return 'bg-accent/5 border-accent/10';
      case 'date_suggestion': return 'bg-secondary/5 border-secondary/10';
      default: return 'bg-primary/5 border-primary/10';
    }
  };

  const getIconColorForTipType = (type: string) => {
    switch (type) {
      case 'conversation_starter': return 'bg-primary text-white';
      case 'response_pattern': return 'bg-accent text-white';
      case 'date_suggestion': return 'bg-secondary text-white';
      default: return 'bg-primary text-white';
    }
  };

  const getWorkflowIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'running': return RotateCw;
      case 'queued': return Clock;
      default: return Clock;
    }
  };

  const getWorkflowIconColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-accent';
      case 'running': return 'text-primary animate-spin';
      case 'queued': return 'text-neutral';
      default: return 'text-neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Coaching Panel */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">AI Coaching Insights</h2>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {tipsLoading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))
          ) : (
            tips?.slice(0, 3).map((tip) => {
              const Icon = getIconForTipType(tip.type);
              return (
                <div key={tip.id} className={`rounded-lg p-4 border ${getColorForTipType(tip.type)}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 ${getIconColorForTipType(tip.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 mb-1">{tip.title}</h3>
                      <p className="text-sm text-neutral">{tip.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {(!tips || tips.length === 0) && !tipsLoading && (
            <div className="text-center py-4">
              <p className="text-neutral text-sm">No coaching tips available yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS Integration Status */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">SMS Coaching</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="text-xs text-accent font-medium">Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">Daily Tips</span>
                <span className="text-xs text-neutral">Enabled</span>
              </div>
              <p className="text-sm text-neutral">Receive personalized dating advice via SMS every morning at 9 AM</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">Response Reminders</span>
                <span className="text-xs text-neutral">Enabled</span>
              </div>
              <p className="text-sm text-neutral">Get gentle nudges when someone hasn't heard back from you</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">Emergency Rescue</span>
                <span className="text-xs text-accent font-medium">2 uses this week</span>
              </div>
              <p className="text-sm text-neutral">Text "HELP" for instant conversation rescue suggestions</p>
            </div>
          </div>

          <Button className="w-full mt-4 bg-primary text-white hover:bg-primary/90">
            Configure SMS Settings
          </Button>
        </CardContent>
      </Card>

      {/* Langflow Workflow Status */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Workflow Engine</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-xs text-accent font-medium">Processing</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {workflowsLoading ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))
            ) : (
              workflows?.map((workflow) => {
                const Icon = getWorkflowIcon(workflow.status);
                return (
                  <div key={workflow.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-4 w-4 ${getWorkflowIconColor(workflow.status)}`} />
                      <span className="text-sm text-slate-900">{workflow.name}</span>
                    </div>
                    <span className={`text-xs capitalize ${
                      workflow.status === 'completed' ? 'text-neutral' :
                      workflow.status === 'running' ? 'text-primary' : 'text-neutral'
                    }`}>
                      {workflow.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral">Last Updated:</span>
              <span className="text-slate-900 font-medium">2 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
