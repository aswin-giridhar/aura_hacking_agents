import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function FloatingWhatsApp() {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const sendWhatsAppMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/whatsapp/send', {
        to: '+1234567890', // Replace with your WhatsApp Business number
        message: 'Welcome to LoveCoach AI! 🌟\n\nI\'m your personal dating assistant powered by advanced AI. I can help you with:\n\n💬 Conversation starters\n📝 Profile optimization\n💡 Dating advice\n🚀 Confidence building\n\nJust send me a message and let\'s improve your dating game together!',
        userId: 1 // Current user ID
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "WhatsApp Connected!",
          description: "Check your WhatsApp for a welcome message from LoveCoach AI. You can now chat directly with our AI assistant.",
        });
      } else {
        toast({
          title: "Connection Error",
          description: data.error || "Failed to connect to WhatsApp",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    },
  });
  
  const handleWhatsAppClick = () => {
    sendWhatsAppMutation.mutate();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={sendWhatsAppMutation.isPending}
        className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
        size="lg"
      >
        <MessageCircle className={`h-6 w-6 ${sendWhatsAppMutation.isPending ? 'animate-pulse' : ''}`} />
        
        {/* Tooltip */}
        <div 
          className={`absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
          }`}
        >
          {sendWhatsAppMutation.isPending ? 'Connecting...' : 'Chat with AI dating coach'}
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
        </div>
      </Button>
      
      {/* Pulse animation ring */}
      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25"></div>
    </div>
  );
}