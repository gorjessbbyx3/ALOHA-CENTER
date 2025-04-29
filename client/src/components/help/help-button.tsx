import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpDialog } from "./help-dialog";

export function HelpButton() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-lg hover:shadow-xl"
        aria-label="Help"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
      <HelpDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
    </>
  );
}