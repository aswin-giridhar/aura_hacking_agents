import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, Calendar, LifeBuoy } from "lucide-react";

interface QuickActionsProps {
  onStartNewConversation: () => void;
  onAnalyzeConversations: () => void;
  onScheduleDate: () => void;
  onEmergencyHelp: () => void;
}

export function QuickActions({ 
  onStartNewConversation, 
  onAnalyzeConversations, 
  onScheduleDate, 
  onEmergencyHelp 
}: QuickActionsProps) {
  const actions = [
    {
      title: "Start New Chat",
      description: "Get conversation starters",
      icon: Plus,
      onClick: onStartNewConversation,
      bgColor: "bg-primary/5",
      borderColor: "border-primary/10",
      iconBg: "bg-primary",
      hoverColor: "hover:bg-primary/10",
    },
    {
      title: "Analyze Chats",
      description: "Get detailed insights",
      icon: BarChart3,
      onClick: onAnalyzeConversations,
      bgColor: "bg-accent/5",
      borderColor: "border-accent/10",
      iconBg: "bg-accent",
      hoverColor: "hover:bg-accent/10",
    },
    {
      title: "Plan Date",
      description: "AI-powered suggestions",
      icon: Calendar,
      onClick: onScheduleDate,
      bgColor: "bg-secondary/5",
      borderColor: "border-secondary/10",
      iconBg: "bg-secondary",
      hoverColor: "hover:bg-secondary/10",
    },
    {
      title: "Emergency Help",
      description: "Instant conversation rescue",
      icon: LifeBuoy,
      onClick: onEmergencyHelp,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconBg: "bg-yellow-400",
      hoverColor: "hover:bg-yellow-100",
    },
  ];

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`flex items-center space-x-3 p-4 ${action.bgColor} rounded-lg border ${action.borderColor} ${action.hoverColor} transition-colors h-auto justify-start`}
              onClick={action.onClick}
            >
              <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center`}>
                <action.icon className="text-white h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900">{action.title}</p>
                <p className="text-xs text-neutral">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
