
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home } from "lucide-react";

export const HomeButton = ({ className }: { className?: string }) => {
  const [location, setLocation] = useLocation();
  
  // Only show button if not on home page
  if (location === '/') return null;
  
  return (
    <Button
      variant="secondary"
      size="sm"
      className={className || "fixed bottom-4 right-4 z-50 shadow-lg"}
      onClick={() => setLocation("/")}
    >
      <Home className="h-4 w-4 mr-2" />
      Home
    </Button>
  );
};
