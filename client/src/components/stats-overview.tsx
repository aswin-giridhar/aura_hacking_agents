import { MessageCircle, TrendingUp, Lightbulb, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Stats } from "@shared/schema";

interface StatsOverviewProps {
  userId: number;
}

export function StatsOverview({ userId }: StatsOverviewProps) {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['/api/stats', userId],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm border border-slate-200">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statsData = [
    {
      title: "Active Conversations",
      value: stats.activeConversations,
      icon: MessageCircle,
      change: "+2.5%",
      changeLabel: "from last week",
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Response Rate",
      value: `${stats.responseRate}%`,
      icon: TrendingUp,
      change: "+12%",
      changeLabel: "improvement",
      bgColor: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      title: "Coaching Tips Sent",
      value: stats.coachingTipsSent,
      icon: Lightbulb,
      change: "+5",
      changeLabel: "this week",
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      title: "Success Score",
      value: (stats.successScore / 10).toFixed(1),
      icon: Star,
      change: "+0.3",
      changeLabel: "points",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} className="shadow-sm border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.iconColor} h-5 w-5`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-accent">↗ {stat.change}</span>
              <span className="text-neutral ml-1">{stat.changeLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
