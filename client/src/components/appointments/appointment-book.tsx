import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ContextMenu } from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Check, 
  CreditCard, 
  Calendar, 
  Clock, 
  Plus,
  ArrowLeft,
  ArrowRight, 
  ChevronDown,
  UserPlus,
  Trash,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { Appointment, Patient } from "@shared/schema";
import { format, addDays } from "date-fns";

// Mock data for display purposes, would be replaced by API calls
const MOCK_HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
const MOCK_STAFF = [
  { id: 1, name: "Dr. Sarah", color: "bg-primary" },
  { id: 2, name: "Dr. Michael", color: "bg-secondary" },
  { id: 3, name: "Dr. Jessica", color: "bg-accent" },
];

interface TimeSlotProps {
  hour: number;
  staffId: number;
  date: Date;
  appointments: Appointment[];
  staffMember: {id: number; name: string; color: string};
  onAddAppointment: (time: string, staffId: number, date: Date) => void;
}

function TimeSlot({ hour, staffId, date, appointments, staffMember, onAddAppointment }: TimeSlotProps) {
  const time = `${hour}:00`;
  const formattedTime = format(new Date().setHours(hour, 0, 0, 0), 'h:mm a');

  // Filter appointments for this time slot
  const slotAppointments = appointments.filter(
    (apt) => apt.time.startsWith(`${hour}:`) && new Date(apt.date).toDateString() === date.toDateString()
  );

  return (
    <Droppable droppableId={`${staffId}-${hour}-${date.toISOString()}`}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="border border-gray-300 h-20 bg-gray-100 relative"
          onDoubleClick={() => onAddAppointment(time, staffId, date)}
        >
          {hour === 8 && (
            <div className="absolute -top-6 left-0 w-full text-center">
              <div className={`${staffMember.color} text-white px-2 py-1 text-xs font-medium`}>
                {staffMember.name}
              </div>
            </div>
          )}

          <div className="absolute -left-14 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
            {formattedTime}
          </div>

          {slotAppointments.map((appointment, index) => (
            <Draggable 
              key={appointment.id.toString()} 
              draggableId={appointment.id.toString()} 
              index={index}
            >
              {(provided) => (
                <ContextMenu
                  menuItems={[
                    { 
                      label: "Check In", 
                      icon: <Check size={16} />, 
                      onClick: () => console.log(`Check in appointment ${appointment.id}`) 
                    },
                    { 
                      label: "Process Payment", 
                      icon: <CreditCard size={16} />, 
                      onClick: () => console.log(`Process payment for ${appointment.id}`) 
                    },
                    { 
                      label: "Add Enhancement", 
                      icon: <Plus size={16} />, 
                      onClick: () => console.log(`Add enhancement to ${appointment.id}`) 
                    },
                    { 
                      label: "Reschedule", 
                      icon: <Calendar size={16} />, 
                      onClick: () => console.log(`Reschedule appointment ${appointment.id}`) 
                    },
                    { 
                      label: "Cancel Appointment", 
                      icon: <Trash size={16} />, 
                      onClick: () => console.log(`Cancel appointment ${appointment.id}`),
                      variant: "destructive" 
                    },
                  ]}
                >
                  {(openContextMenu) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onContextMenu={openContextMenu}
                      className={`${getAppointmentColorByStaff(staffId)} rounded p-1 mb-1 text-white text-xs flex flex-col`}
                    >
                      <div className="font-medium">{`${appointment.patientId ? `Patient #${appointment.patientId}` : 'New Patient'}`}</div>
                      <div className="text-white/80">{format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}</div>
                    </div>
                  )}
                </ContextMenu>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

function getAppointmentColorByStaff(staffId: number): string {
  const staff = MOCK_STAFF.find(s => s.id === staffId);
  return staff?.color || "bg-gray-500";
}

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function AppointmentBook() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleDays, setVisibleDays] = useState(5);
  const [dates, setDates] = useState<Date[]>([]);
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [newAppointmentData, setNewAppointmentData] = useState<{
    time: string;
    staffId: number;
    date: Date;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewType, setViewType] = useState<"day" | "week" | "month">("day");
  const [useCalendly, setUseCalendly] = useState(false);
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const calendlyRef = useRef<HTMLIFrameElement>(null);
  const [isRefreshingCalendly, setIsRefreshingCalendly] = useState(false);

  // Fetch appointments
  const { data: appointments = [], isLoading: loadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  // Fetch patients
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Calculate visible days based on view type
  useEffect(() => {
    let days = 1;
    if (viewType === "week") days = 7;
    if (viewType === "month") days = 30;
    setVisibleDays(days);
  }, [viewType]);

  // Generate array of dates to display
  useEffect(() => {
    const newDates = Array.from({ length: visibleDays }, (_, i) => 
      addDays(selectedDate, i)
    );
    setDates(newDates);
  }, [selectedDate, visibleDays]);

  // Handle navigation
  const handlePreviousDay = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (viewType === "day") {
        setSelectedDate(prev => addDays(prev, -1));
      } else if (viewType === "week") {
        setSelectedDate(prev => addDays(prev, -7));
      } else {
        setSelectedDate(prev => addDays(prev, -30));
      }
      setIsLoading(false);
    }, 300);
  };

  const handleNextDay = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (viewType === "day") {
        setSelectedDate(prev => addDays(prev, 1));
      } else if (viewType === "week") {
        setSelectedDate(prev => addDays(prev, 7));
      } else {
        setSelectedDate(prev => addDays(prev, 30));
      }
      setIsLoading(false);
    }, 300);
  };

  const handleViewTypeChange = (type: "day" | "week" | "month") => {
    setViewType(type);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Handle appointment addition
  const handleAddAppointment = (time: string, staffId: number, date: Date) => {
    if (useCalendly) {
      setIsCalendlyOpen(true);
    } else {
      setNewAppointmentData({ time, staffId, date });
      setIsAppointmentFormOpen(true);
    }
  };

  // Handle Calendly event received
  const handleCalendlyEvent = (e: MessageEvent) => {
    if (e.data.event && e.data.event.indexOf('calendly') === 0) {
      console.log("Calendly event received:", e.data);
      
      // Handle appointment scheduled
      if (e.data.event === 'calendly.event_scheduled') {
        // You would typically fetch the event details from Calendly's API
        // and then create an appointment in your system
        setIsCalendlyOpen(false);
        
        // Example of how you might create a local appointment based on Calendly data
        const calendlyData = e.data.payload;
        if (calendlyData) {
          // Connect to your appointment system here
          // This is a placeholder for where you'd create an appointment from Calendly data
          console.log("Creating appointment from Calendly data", calendlyData);
        }
      }
    }
  };

  // Add event listener for Calendly messages
  useEffect(() => {
    window.addEventListener('message', handleCalendlyEvent);
    return () => {
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, []);

  // Handle Calendly refresh
  const refreshCalendly = () => {
    setIsRefreshingCalendly(true);
    if (calendlyRef.current) {
      const src = calendlyRef.current.src;
      calendlyRef.current.src = '';
      setTimeout(() => {
        if (calendlyRef.current) {
          calendlyRef.current.src = src;
        }
        setIsRefreshingCalendly(false);
      }, 1000);
    } else {
      setIsRefreshingCalendly(false);
    }
  };

  // Handle drag end
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const [staffId, hour, dateString] = destination.droppableId.split('-');

    console.log(`Moved appointment ${draggableId} to staff ${staffId} at hour ${hour} on ${dateString}`);
    // Make API call to update appointment time/staff
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-sidebar-background text-white py-2 px-4 flex items-center space-x-4">
        <div className="text-lg font-medium">Appointment Book</div>

        <div className="flex items-center space-x-2 ml-4">
          <Switch 
            id="calendly-toggle" 
            checked={useCalendly} 
            onCheckedChange={setUseCalendly} 
          />
          <label htmlFor="calendly-toggle" className="text-sm">
            Use Calendly
          </label>
        </div>

        <div className="flex items-center space-x-1 ml-auto">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-transparent text-white border-white/20 hover:bg-white/10"
            onClick={handleToday}
          >
            <Calendar size={16} className="mr-1" />
            Today
          </Button>

          <Button 
            size="sm" 
            variant="outline" 
            className="bg-transparent text-white border-white/20 hover:bg-white/10" 
            onClick={handlePreviousDay}
            disabled={isLoading}
          >
            <ArrowLeft size={16} />
          </Button>

          <Button 
            size="sm" 
            variant="outline" 
            className="bg-transparent text-white border-white/20 hover:bg-white/10" 
            onClick={handleNextDay}
            disabled={isLoading}
          >
            <ArrowRight size={16} />
          </Button>

          <div className="text-sm font-medium px-2">
            {format(selectedDate, 'MMMM d, yyyy')}
            {isLoading && <span className="ml-2 animate-pulse">...</span>}
          </div>

          <Tabs value={viewType} className="inline-flex" onValueChange={(value) => handleViewTypeChange(value as "day" | "week" | "month")}>
            <TabsList className="bg-transparent border border-white/20">
              <TabsTrigger value="day" className="text-white data-[state=active]:bg-white/20">Day</TabsTrigger>
              <TabsTrigger value="week" className="text-white data-[state=active]:bg-white/20">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-white data-[state=active]:bg-white/20">Month</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button size="sm" variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10">
            <UserPlus size={16} className="mr-1" />
            Walk-In
          </Button>

          <Button 
            size="sm" 
            variant="default" 
            className="bg-primary hover:bg-primary/90"
            onClick={() => handleAddAppointment(`${new Date().getHours()}:00`, 1, new Date())}
          >
            <Plus size={16} className="mr-1" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="relative w-full">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-0">
          {loadingAppointments ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="relative pl-14"> {/* Add space for time labels */}
                  <div className="flex">
                    {/* Date Headers */}
                    {dates.map((date) => (
                      <div key={date.toISOString()} className="flex-1 text-center">
                        <div className="py-2 font-medium">
                          {format(date, 'E, MMM d')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col">
                    {MOCK_STAFF.map((staff) => (
                      <div key={staff.id} className="mb-6">
                        <div className="flex">
                          {dates.map((date) => (
                            <div key={`${staff.id}-${date.toISOString()}`} className="flex-1">
                              {MOCK_HOURS.map((hour) => (
                                <TimeSlot
                                  key={`${staff.id}-${hour}-${date.toISOString()}`}
                                  hour={hour}
                                  staffId={staff.id}
                                  date={date}
                                  appointments={appointments.filter(apt => apt.serviceId === staff.id)}
                                  staffMember={staff}
                                  onAddAppointment={handleAddAppointment}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DragDropContext>
            </div>
          )}
        </TabsContent>
          <TabsContent value="upcoming" className="mt-0">
            <div className="flex items-center justify-center h-64">
              <p>Upcoming appointments will appear here</p>
            </div>
          </TabsContent>
          <TabsContent value="past" className="mt-0">
            <div className="flex items-center justify-center h-64">
              <p>Past appointments will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Appointment Form */}
      {isAppointmentFormOpen && (
        <AppointmentForm 
          open={isAppointmentFormOpen} 
          onOpenChange={setIsAppointmentFormOpen}
          appointmentId={null}
          onSuccess={() => {
            setNewAppointmentData(null);
          }}
        />
      )}

      {/* Calendly Integration Dialog */}
      <Dialog open={isCalendlyOpen} onOpenChange={setIsCalendlyOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Schedule with Calendly</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={refreshCalendly}
                disabled={isRefreshingCalendly}
              >
                <RefreshCw size={16} className={isRefreshingCalendly ? "animate-spin" : ""} />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Book a time that works for you using our Calendly integration
            </DialogDescription>
          </DialogHeader>
          <div className="relative h-full w-full mt-4">
            <iframe
              ref={calendlyRef}
              src="https://calendly.com/your-account-here/30min"
              width="100%"
              height="100%"
              frameBorder="0"
              title="Schedule Appointment"
              className="rounded-md"
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}