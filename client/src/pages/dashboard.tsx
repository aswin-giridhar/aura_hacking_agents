import { AuraInterface } from "@/components/aura-interface";

export default function Dashboard() {
  // In a real app, this would come from authentication
  const userId = 1;

  return <AuraInterface userId={userId} />;
}
