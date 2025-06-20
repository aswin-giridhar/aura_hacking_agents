import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Smartphone, Check, X } from "lucide-react";

interface WhatsAppStatus {
  configured: boolean;
  phoneNumber: string | null;
}

export function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const { data: status } = useQuery<WhatsAppStatus>({
    queryKey: ['/api/whatsapp/status'],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ phoneNumber, message }: { phoneNumber: string; message: string }) => {
      const response = await apiRequest('POST', '/api/whatsapp/send', {
        phoneNumber,
        message,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Message Sent!",
          description: "Your message has been sent via WhatsApp. Aura will respond directly to your WhatsApp.",
        });
        setMessage("");
        setIsOpen(false);
      } else {
        toast({
          title: "Send Failed",
          description: data.error || "Failed to send WhatsApp message",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send WhatsApp message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !message.trim()) return;

    sendMessageMutation.mutate({ phoneNumber, message });
  };

  const isConfigured = status?.configured;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative p-2 text-neutral hover:text-slate-900"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="ml-2 hidden md:inline">WhatsApp</span>
          {isConfigured ? (
            <Check className="absolute -top-1 -right-1 w-3 h-3 text-green-500" />
          ) : (
            <X className="absolute -top-1 -right-1 w-3 h-3 text-red-500" />
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            <span>WhatsApp with Aura</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!isConfigured && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                WhatsApp integration is not fully configured. Please check your Twilio and Mistral API settings.
              </p>
            </div>
          )}
          
          {status?.phoneNumber && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Twilio WhatsApp Number:</span>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {status.phoneNumber}
                </Badge>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Enter your WhatsApp phone number below</li>
              <li>2. Send a message to start chatting with Aura</li>
              <li>3. Aura will respond directly to your WhatsApp</li>
              <li>4. Continue the conversation in WhatsApp</li>
            </ol>
          </div>
          
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Your WhatsApp Number
              </label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., +1 for US)
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Message to Aura
              </label>
              <Input
                placeholder="Hi Aura, I need dating advice..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={sendMessageMutation.isPending || !isConfigured}
            >
              <Send className="w-4 h-4 mr-2" />
              {sendMessageMutation.isPending ? 'Sending...' : 'Send to WhatsApp'}
            </Button>
          </form>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Messages are powered by Mistral AI</p>
            <p>• Aura will provide dating and relationship advice</p>
            <p>• Your phone number is only used for this conversation</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}