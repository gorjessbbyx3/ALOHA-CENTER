import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Appointment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IntakeFormModalProps {
  appointmentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function IntakeFormModal({ appointmentId, open, onOpenChange, onComplete }: IntakeFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get appointment details
  const { data: appointment } = useQuery({
    queryKey: [`/api/appointments/${appointmentId}`],
    enabled: !!appointmentId && open,
    select: (data: Appointment) => data,
  });

  // Mark intake form as completed
  const completeIntakeForm = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/appointments/${appointmentId}/intake-form`, { 
        status: "completed",
        timestamp: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/${appointmentId}`] });
      toast({
        title: "Intake Form Completed",
        description: "The intake form has been marked as completed",
      });
      onComplete();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was a problem updating the intake form status",
        variant: "destructive",
      });
    },
  });

  // Mark intake form as skipped
  const skipIntakeForm = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/appointments/${appointmentId}/intake-form`, { 
        status: "skipped",
        timestamp: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/${appointmentId}`] });
      toast({
        title: "Intake Form Skipped",
        description: "The intake form has been marked for later completion",
      });
      onComplete();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was a problem updating the intake form status",
        variant: "destructive",
      });
    },
  });

  const openIntakeForm = () => {
    // In a real implementation, you would likely redirect to the intake form
    // or open it in a new tab/window
    window.open(`/intake-form/${appointmentId}`, '_blank');
    completeIntakeForm.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Patient Intake Form</DialogTitle>
          <DialogDescription>
            Would you like the patient to complete the intake form now or skip for later?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          <p>
            Patient: <span className="font-medium">{appointment?.patientName || "Unknown"}</span>
          </p>

          <p className="text-sm text-muted-foreground">
            The intake form collects important health information, treatment consent, and payment details.
          </p>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button 
            variant="outline" 
            onClick={() => skipIntakeForm.mutate()}
            disabled={skipIntakeForm.isPending}
          >
            {skipIntakeForm.isPending ? "Processing..." : "Skip for Later"}
          </Button>

          <Button 
            variant="default"
            onClick={openIntakeForm}
            disabled={completeIntakeForm.isPending}
          >
            {completeIntakeForm.isPending ? "Processing..." : "Complete Intake Form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}