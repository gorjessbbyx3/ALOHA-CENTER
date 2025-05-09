
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw, CalendarClock, Link2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export function CalendlyIntegration() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [calendlyUrl, setCalendlyUrl] = useState("https://calendly.com/aloha-healing-center");
  
  // Mutation for syncing Calendly events
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/calendly/sync");
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Calendly Sync Complete",
        description: data.message || "Successfully synced Calendly events",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Calendly Sync Failed",
        description: error.response?.data?.message || "Failed to sync Calendly events",
        variant: "destructive",
      });
    }
  });

  const handleSyncCalendly = () => {
    syncMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Calendly Integration
        </CardTitle>
        <CardDescription>
          Connect with Calendly to allow clients to book appointments online
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="calendly-enabled">Enable Calendly Integration</Label>
              <p className="text-xs text-muted-foreground">Allow appointments to be booked via Calendly</p>
            </div>
            <Switch 
              id="calendly-enabled" 
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="calendly-url">Calendly URL</Label>
            <div className="flex gap-2">
              <Input 
                id="calendly-url"
                value={calendlyUrl}
                onChange={(e) => setCalendlyUrl(e.target.value)}
                placeholder="https://calendly.com/your-account"
                disabled={!isEnabled}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(calendlyUrl, "_blank")}
                disabled={!isEnabled}
              >
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Your Calendly scheduling page URL</p>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleSyncCalendly} 
              disabled={!isEnabled || syncMutation.isPending}
              className="w-full"
            >
              {syncMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sync Calendly Events
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Manually sync appointments from Calendly to your system
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t px-6 pt-4">
        <div className="text-xs text-muted-foreground">
          Last synced: {syncMutation.isSuccess ? "Just now" : "Never"}
        </div>
        <Button variant="outline" size="sm" onClick={() => window.open("https://calendly.com/app/admin", "_blank")}>
          Open Calendly Admin
        </Button>
      </CardFooter>
    </Card>
  );
}
