import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, isSameMonth } from "date-fns";
import { Appointment, Patient, Service } from "@shared/schema";
import { AdminLayout } from "@/components/layout/admin-layout";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { AppointmentDetails } from "@/components/appointments/appointment-details";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function Appointments() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Fetch appointments
  const { data: appointments = [], isLoading: isAppointmentsLoading } = useQuery({
    queryKey: ["/api/appointments"],
    select: (data: Appointment[]) => data,
  });
  
  // Fetch patients to join with appointments
  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
    select: (data: Patient[]) => data,
  });
  
  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    select: (data: Service[]) => data,
  });
  
  // Get day-specific appointments
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return isSameDay(aptDate, date);
    });
  };
  
  // Get patient name from patient ID
  const getPatientName = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : "Unknown Patient";
  };
  
  // Get service name from service ID
  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : "Unknown Service";
  };
  
  // Calendar generation
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };
  
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleViewAppointment = (id: number) => {
    setSelectedAppointmentId(id);
    setIsDetailsOpen(true);
  };
  
  return (
    <AdminLayout 
      title="Appointments" 
      subtitle="Manage appointments and scheduling"
      onNewAppointment={() => setIsAppointmentFormOpen(true)}
    >
      {/* Calendar Header */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between px-6">
          <CardTitle>Appointment Calendar</CardTitle>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="sr-only">Previous month</span>
            </Button>
            <span className="text-base font-medium">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="sr-only">Next month</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
              Today
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500">{day}</div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Previous Month Days (to fill the first row) */}
            {Array.from({ length: firstDayOfMonth.getDay() }).map((_, i) => {
              const prevMonthDay = new Date(
                firstDayOfMonth.getFullYear(),
                firstDayOfMonth.getMonth(),
                -i
              );
              return (
                <div 
                  key={`prev-${i}`}
                  className="calendar-day border rounded-md p-1 bg-gray-50 min-h-[100px]"
                >
                  <div className="text-right text-sm text-gray-400 mb-1">
                    {prevMonthDay.getDate()}
                  </div>
                </div>
              );
            }).reverse()}
            
            {/* Current Month Days */}
            {daysInMonth.map((day) => {
              const dayAppointments = getAppointmentsForDate(day);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "calendar-day border rounded-md p-1 min-h-[100px] cursor-pointer",
                    isToday(day) ? "bg-blue-50" : "",
                    isSameDay(day, selectedDate) ? "ring-2 ring-primary-600" : ""
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  <div className={cn(
                    "text-right text-sm mb-1",
                    isToday(day) ? "font-bold text-primary-600" : ""
                  )}>
                    {day.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayAppointments.length > 0 ? (
                      dayAppointments.slice(0, 3).map((apt) => (
                        <div 
                          key={apt.id}
                          className="text-xs bg-primary-100 text-primary-800 rounded px-1 py-0.5 truncate cursor-pointer"
                          onClick={() => handleViewAppointment(apt.id)}
                        >
                          {apt.time} - {getPatientName(apt.patientId)}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400">No appointments</div>
                    )}
                    
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Next Month Days (to fill the last row) */}
            {Array.from({ length: 6 - lastDayOfMonth.getDay() }).map((_, i) => {
              const nextMonthDay = new Date(
                lastDayOfMonth.getFullYear(),
                lastDayOfMonth.getMonth(),
                lastDayOfMonth.getDate() + i + 1
              );
              return (
                <div 
                  key={`next-${i}`}
                  className="calendar-day border rounded-md p-1 bg-gray-50 min-h-[100px]"
                >
                  <div className="text-right text-sm text-gray-400 mb-1">
                    {nextMonthDay.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Day's Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-6">
          <CardTitle>Appointments for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          {isAppointmentsLoading ? (
            <div className="text-center py-4">Loading appointments...</div>
          ) : (
            <>
              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No appointments scheduled for this date.
                </div>
              ) : (
                <div className="space-y-4">
                  {getAppointmentsForDate(selectedDate).map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="p-4 border rounded-md hover:bg-gray-50 appointment-item"
                      onClick={() => handleViewAppointment(appointment.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="font-medium">{getPatientName(appointment.patientId)}</p>
                            <p className="text-sm text-gray-500">{appointment.time} - {getServiceName(appointment.serviceId)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge 
                            className={cn(
                              appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'canceled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            )}
                            variant="outline"
                          >
                            {appointment.status === 'scheduled' ? 'Confirmed' :
                             appointment.status === 'completed' ? 'Completed' :
                             appointment.status === 'canceled' ? 'Canceled' :
                             'Pending'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewAppointment(appointment.id);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Appointment Form */}
      <AppointmentForm 
        open={isAppointmentFormOpen} 
        onOpenChange={setIsAppointmentFormOpen} 
      />
      
      {/* Appointment Details */}
      {selectedAppointmentId && (
        <AppointmentDetails
          appointmentId={selectedAppointmentId}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      )}
    </AdminLayout>
  );
}
