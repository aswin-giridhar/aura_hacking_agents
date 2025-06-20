import { useState } from "react";
import { LoveCRMDashboard } from "@/components/love-crm-dashboard";
import { ConversationModal } from "@/components/conversation-modal";
import { WhatsAppChat } from "@/components/whatsapp-chat";
import { Heart } from "lucide-react";
import type { Conversation } from "@shared/schema";

export default function LoveCRM() {
  const [selectedLead, setSelectedLead] = useState<Conversation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // In a real app, this would come from authentication
  const userId = 1;

  const handleLeadSelect = (lead: Conversation) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Heart className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Love CRM</h1>
                <p className="text-sm text-gray-600">Your Dating Pipeline Dashboard</p>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <LoveCRMDashboard userId={userId} onLeadSelect={handleLeadSelect} />
      </div>

      {/* Lead Detail Modal */}
      <ConversationModal
        conversation={selectedLead}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        userId={userId}
      />
    </div>
  );
}