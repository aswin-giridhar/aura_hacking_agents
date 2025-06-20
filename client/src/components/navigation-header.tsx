import { Heart, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NavigationHeader() {
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <Heart className="text-white h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-slate-900">LoveCoach AI</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#dashboard" className="text-primary font-medium">Dashboard</a>
            <a href="#conversations" className="text-neutral hover:text-slate-900">Conversations</a>
            <a href="#insights" className="text-neutral hover:text-slate-900">Insights</a>
            <a href="#settings" className="text-neutral hover:text-slate-900">Settings</a>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2 text-neutral hover:text-slate-900 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full text-xs text-white flex items-center justify-center">3</span>
            </Button>
            <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
