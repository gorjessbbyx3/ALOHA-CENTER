import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Appointment, Patient } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface AppointmentItemProps {
  appointment: Appointment;
  patient?: Patient;
  onViewDetails: () => void;
  onCancel: () => void;
}

function AppointmentItem({ appointment, patient, onViewDetails, onCancel }: AppointmentItemProps) {
  const statusMap = {
    'scheduled': { bgColor: 'bg-success-100', textColor: 'text-success-800', label: 'Confirmed' },
    'completed': { bgColor: 'bg-blue-100', textColor: 'text-blue-800', label: 'Completed' },
    'canceled': { bgColor: 'bg-red-100', textColor: 'text-red-800', label: 'Canceled' },
    'pending': { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', label: 'Pending' },
  };
  
  const status = statusMap[appointment.status as keyof typeof statusMap] || statusMap.pending;
  
  return (
    <li className="p-4 hover:bg-gray-50 appointment-item">
      <div className="flex">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">{patient?.name || 'Unknown Patient'}</p>
            <div>
              <Badge 
                className={cn(status.bgColor, status.textColor)}
                variant="outline"
              >
                {status.label}
              </Badge>
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {appointment.time} - {/* Calculate end time based on appointment.duration */}
            {format(new Date(`2000-01-01T${appointment.time}`).getTime() + appointment.duration * 60000, 'h:mm a')}
          </div>
          <div className="mt-2 flex">
            <button 
              onClick={onViewDetails}
              className="inline-flex items-center text-xs text-primary-600 hover:text-primary-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              View Details
            </button>
            <button 
              onClick={onCancel}
              className="ml-4 inline-flex items-center text-xs text-red-600 hover:text-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export function AppointmentList({ title = "Today's Appointments" }: { title?: string }) {
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [cancelingAppointment, setCancelingAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();
  
  // Query appointments
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/appointments"],
    select: (data: Appointment[]) => data,
  });
  
  // Query patients to join with appointments
  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
    select: (data: Patient[]) => data,
  });
  
  // Get patient data for an appointment
  const getPatientForAppointment = (appointment: Appointment) => {
    return patients.find(p => p.id === appointment.patientId);
  };
  
  // Handle cancel appointment
  const handleCancelAppointment = async () => {
    if (!cancelingAppointment) return;
    
    try {
      const response = await fetch(`/api/appointments/${cancelingAppointment.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast({
          title: "Appointment Canceled",
          description: "The appointment has been successfully canceled.",
        });
        setCancelingAppointment(null);
      } else {
        throw new Error("Failed to cancel appointment");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem canceling the appointment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto" style={{ maxHeight: "400px" }}>
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No appointments scheduled</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <AppointmentItem
                key={appointment.id}
                appointment={appointment}
                patient={getPatientForAppointment(appointment)}
                onViewDetails={() => setViewingAppointment(appointment)}
                onCancel={() => setCancelingAppointment(appointment)}
              />
            ))}
          </ul>
        )}
      </CardContent>
      
      {/* Appointment Details Dialog */}
      {viewingAppointment && (
        <Dialog open={!!viewingAppointment} onOpenChange={() => setViewingAppointment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                Appointment #{viewingAppointment.id} information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient</p>
                  <p className="text-sm text-gray-900">{getPatientForAppointment(viewingAppointment)?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date & Time</p>
                  <p className="text-sm text-gray-900">
                    {format(new Date(viewingAppointment.date), 'MMM dd, yyyy')} at {viewingAppointment.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="text-sm text-gray-900">{viewingAppointment.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-sm text-gray-900">{viewingAppointment.status}</p>
                </div>
                {viewingAppointment.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-sm text-gray-900">{viewingAppointment.notes}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <p className="text-sm text-gray-900">
                    {viewingAppointment.paymentStatus === 'paid' 
                      ? `Paid (${viewingAppointment.paymentAmount ? `$${Number(viewingAppointment.paymentAmount).toFixed(2)}` : ''})` 
                      : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingAppointment(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Cancel Confirmation Dialog */}
      {cancelingAppointment && (
        <Dialog open={!!cancelingAppointment} onOpenChange={() => setCancelingAppointment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelingAppointment(null)}>
                Keep Appointment
              </Button>
              <Button variant="destructive" onClick={handleCancelAppointment}>
                Cancel Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
