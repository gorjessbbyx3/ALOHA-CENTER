import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Appointment, Patient, Service } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppointmentDetailsProps {
  appointmentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDetails({ appointmentId, open, onOpenChange }: AppointmentDetailsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get appointment details
  const { data: appointment, isLoading: isAppointmentLoading } = useQuery({
    queryKey: [`/api/appointments/${appointmentId}`],
    enabled: !!appointmentId && open,
    select: (data: Appointment) => data,
  });
  
  // Get patient details
  const { data: patient, isLoading: isPatientLoading } = useQuery({
    queryKey: [`/api/patients/${appointment?.patientId}`],
    enabled: !!appointment?.patientId,
    select: (data: Patient) => data,
  });
  
  // Get service details
  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    select: (data: Service[]) => data,
  });
  
  // Get service for this appointment
  const service = services.find(s => s.id === appointment?.serviceId);
  
  // Cancel appointment mutation
  const cancelAppointment = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/appointments/${appointmentId}/cancel`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/${appointmentId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      onOpenChange(false);
      toast({
        title: "Appointment Canceled",
        description: "The appointment has been successfully canceled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was a problem canceling the appointment. Please try again.",
        variant: "destructive",
      });
      console.error("Appointment cancellation error:", error);
    },
  });
  
  const isLoading = isAppointmentLoading || isPatientLoading;
  
  // Status badge color based on appointment status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            View and manage appointment information
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-6 text-center">Loading appointment details...</div>
        ) : !appointment ? (
          <div className="py-6 text-center">Appointment not found</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Patient</p>
                <p className="text-sm font-medium text-gray-900">{patient?.name}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Patient ID</p>
                <p className="text-sm font-medium text-gray-900">{patient?.patientId}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Service</p>
                <p className="text-sm font-medium text-gray-900">{service?.name || 'N/A'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="text-sm font-medium text-gray-900">{appointment.duration} minutes</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(appointment.date), 'MMMM d, yyyy')}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(`2000-01-01T${appointment.time}`), 'h:mm a')}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div>{getStatusBadge(appointment.status)}</div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Payment</p>
                <p className="text-sm font-medium text-gray-900">
                  {appointment.paymentStatus === 'paid' 
                    ? `Paid (${appointment.paymentAmount ? `$${Number(appointment.paymentAmount).toFixed(2)}` : ''})` 
                    : 'Pending'}
                </p>
              </div>
              
              {appointment.notes && (
                <div className="col-span-2 space-y-1">
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-sm text-gray-900">{appointment.notes}</p>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              
              {appointment.status !== 'canceled' && (
                <Button 
                  variant="secondary"
                  onClick={() => window.open(`/api/appointments/${appointmentId}/pdf`, '_blank')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Print Confirmation
                </Button>
              )}
              
              {appointment.status !== 'canceled' && appointment.paymentStatus !== 'paid' && (
                <Link href={`/checkout/${appointmentId}`}>
                  <Button variant="default">
                    Process Payment
                  </Button>
                </Link>
              )}
              
              {appointment.status !== 'canceled' && (
                <Button 
                  variant="destructive" 
                  onClick={() => cancelAppointment.mutate()}
                  disabled={cancelAppointment.isPending}
                >
                  {cancelAppointment.isPending ? "Canceling..." : "Cancel Appointment"}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
