import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@shared/schema";
import { formatTime } from "@/lib/dates";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuTrigger 
} from "@/components/ui/context-menu";
import { PlusCircle, Pencil, XCircle, Check, CalendarClock, DollarSign, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { IntakeFormModal } from "./intake-form-modal";

// Extended appointment type for UI display with derived fields
interface ExtendedAppointment extends Appointment {
  patientName?: string;
  serviceName?: string;
}

interface RoomAppointmentsProps {
  roomId: number;
  onNewAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
}

export function RoomAppointments({ roomId, onNewAppointment, onEditAppointment }: RoomAppointmentsProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isIntakeFormModalOpen, setIsIntakeFormModalOpen] = useState(false);
  const [checkedInAppointmentId, setCheckedInAppointmentId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading, error, refetch } = useQuery<ExtendedAppointment[]>({
    queryKey: ['/api/appointments', { roomId, date: format(selectedDate, 'yyyy-MM-dd') }],
    enabled: !!roomId,
    throwOnError: false,
  });

  useEffect(() => {
    if (roomId) {
      refetch();
    }
  }, [roomId, refetch]);

  const checkInMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      // Replace with your actual check-in API call
      const response = await fetch(`/api/appointments/${appointmentId}/checkin`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Check-in failed');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the appointments query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error checking in patient",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle check-in
  const handleCheckIn = (appointment: Appointment) => {
    checkInMutation.mutate(appointment.id, {
      onSuccess: () => {
        // After successful check-in, show intake form prompt
        setCheckedInAppointmentId(appointment.id);
        setIsIntakeFormModalOpen(true);
      }
    });
  };

  const handleCheckout = (appointment: ExtendedAppointment) => {
    toast({
      title: "Patient checked out",
      description: `${appointment.patientName || 'Patient'} has been checked out.`
    });
  };

  const handleCancel = (appointment: ExtendedAppointment) => {
    toast({
      title: "Appointment cancelled",
      description: `The appointment has been cancelled.`
    });
  };

  const handlePayment = (appointment: ExtendedAppointment) => {
    toast({
      title: "Processing payment",
      description: `Opening payment screen for ${appointment.patientName || 'patient'}.`
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive p-4">
        Error loading appointments. Please try again later.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="border rounded-md p-2"
          />
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>
              {format(selectedDate, 'MMMM d, yyyy')}
            </CardDescription>
          </div>
          <Button onClick={onNewAppointment}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center p-6 border border-dashed rounded-md">
              <CalendarClock className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">No appointments scheduled for this day</p>
              <Button variant="secondary" onClick={onNewAppointment}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Schedule an appointment
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {appointments
                  .sort((a: ExtendedAppointment, b: ExtendedAppointment) => a.time.localeCompare(b.time))
                  .map((appointment: ExtendedAppointment) => (
                    <ContextMenu key={appointment.id}>
                      <ContextMenuTrigger asChild>
                        <Card className={`
                          ${appointment.status === 'canceled' ? 'bg-muted opacity-70' : ''}
                          ${appointment.status === 'checked-in' ? 'border-primary' : ''}
                          cursor-context-menu hover:shadow-md transition-shadow
                        `}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium">
                                  {appointment.patientName || 'Patient name not available'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatTime(appointment.time)} - {appointment.duration} min
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {appointment.status === 'scheduled' && (
                                  <Badge>Scheduled</Badge>
                                )}
                                {appointment.status === 'checked-in' && (
                                  <Badge variant="default">Checked In</Badge>
                                )}
                                {appointment.status === 'complete' && (
                                  <Badge variant="outline">Complete</Badge>
                                )}
                                {appointment.status === 'canceled' && (
                                  <Badge variant="destructive">Canceled</Badge>
                                )}
                                {appointment.paymentStatus === 'paid' && (
                                  <Badge variant="secondary">Paid</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-sm mt-2">
                              <p>{appointment.serviceName || 'No service specified'}</p>
                              {appointment.notes && (
                                <p className="text-muted-foreground mt-1">{appointment.notes}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => onEditAppointment(appointment)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Appointment
                        </ContextMenuItem>

                        {appointment.status === 'scheduled' && (
                          <ContextMenuItem onClick={() => handleCheckIn(appointment)}>
                            <LogIn className="mr-2 h-4 w-4" />
                            Check In
                          </ContextMenuItem>
                        )}

                        {appointment.status === 'checked-in' && (
                          <ContextMenuItem onClick={() => handleCheckout(appointment)}>
                            <Check className="mr-2 h-4 w-4" />
                            Check Out
                          </ContextMenuItem>
                        )}

                        {appointment.status !== 'canceled' && (
                          <ContextMenuItem onClick={() => handleCancel(appointment)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Appointment
                          </ContextMenuItem>
                        )}

                        {appointment.paymentStatus !== 'paid' && appointment.status !== 'canceled' && (
                          <ContextMenuItem onClick={() => handlePayment(appointment)}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Process Payment
                          </ContextMenuItem>
                        )}
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
       <IntakeFormModal
        isOpen={isIntakeFormModalOpen}
        onClose={() => {
          setIsIntakeFormModalOpen(false);
          setCheckedInAppointmentId(null);
        }}
        appointmentId={checkedInAppointmentId}
      />
    </div>
  );
}