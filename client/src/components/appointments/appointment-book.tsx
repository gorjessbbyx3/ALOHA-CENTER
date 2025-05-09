import { useState, useEffect } from "react";
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
  Trash
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

export function AppointmentBook() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleDays, setVisibleDays] = useState(5);
  const [dates, setDates] = useState<Date[]>([]);

  // Fetch appointments
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  // Fetch patients
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Generate array of dates to display
  useEffect(() => {
    const newDates = Array.from({ length: visibleDays }, (_, i) => 
      addDays(selectedDate, i)
    );
    setDates(newDates);
  }, [selectedDate, visibleDays]);

  // Handle navigation
  const handlePreviousDay = () => {
    setSelectedDate(prev => addDays(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  // Handle appointment addition
  const handleAddAppointment = (time: string, staffId: number, date: Date) => {
    console.log(`Add appointment at ${time} for staff ${staffId} on ${date.toDateString()}`);
    // Open appointment form dialog with this data pre-filled
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

        <div className="flex items-center space-x-1 ml-auto">
          <Button size="sm" variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10">
            <Calendar size={16} className="mr-1" />
            Today
          </Button>

          <Button size="sm" variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10" onClick={handlePreviousDay}>
            <ArrowLeft size={16} />
          </Button>

          <Button size="sm" variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10" onClick={handleNextDay}>
            <ArrowRight size={16} />
          </Button>

          <div className="text-sm font-medium px-2">
            {format(selectedDate, 'MMMM d, yyyy')}
          </div>

          <Button size="sm" variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10">
            <Clock size={16} className="mr-1" />
            Day View
            <ChevronDown size={14} className="ml-1" />
          </Button>

          <Button size="sm" variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10">
            <UserPlus size={16} className="mr-1" />
            Walk-In
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}