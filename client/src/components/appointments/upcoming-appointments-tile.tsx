import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  CalendarClock, 
  Clock, 
  User, 
  FileText, 
  ChevronRight,
  CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/dates";
import { Appointment } from "@shared/schema";

export const UpcomingAppointmentsTile = () => {
  // Get upcoming appointments, sorted by date and time
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    select: (data) => {
      // Filter to future appointments only (today and beyond) and sort by date/time
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      
      return data
        .filter(appt => {
          const apptDate = new Date(appt.date);
          return apptDate >= now && appt.status !== 'canceled';
        })
        .sort((a, b) => {
          // Sort by date, then by time
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }
          
          return a.time.localeCompare(b.time);
        })
        .slice(0, 3); // Get only the first 3 upcoming appointments
    }
  });

  const getInitials = (name: string) => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelativeDay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);
    
    if (appointmentDate.getTime() === today.getTime()) return 'Today';
    if (appointmentDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    return format(date, 'EEE, MMM d');
  };

  return (
    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg col-span-1 md:col-span-2 h-44 md:h-48 overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center">
            <CalendarClock className="mr-2 h-5 w-5 text-white" />
            <h3 className="text-xl font-semibold text-white">Upcoming Appointments</h3>
          </div>
          
          <Button 
            variant="secondary" 
            className="bg-white/20 hover:bg-white/30 text-white"
            size="sm"
            onClick={() => window.location.href = '/appointments'}
          >
            View All
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden bg-white/10 backdrop-blur-sm p-0.5">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/90">
              <CalendarDays className="h-8 w-8 mb-2" />
              <p>No upcoming appointments</p>
              <Button 
                size="sm" 
                className="mt-2 bg-white/20 hover:bg-white/30 text-white"
                onClick={() => window.location.href = '/appointments'}
              >
                Schedule Appointment
              </Button>
            </div>
          ) : (
            <div className="flex flex-col h-full divide-y divide-white/20">
              {appointments.map((appointment, index) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center p-2 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0 mr-2">
                    <Avatar className="h-10 w-10 bg-white/20 text-white">
                      <AvatarFallback>
                        {appointment.patientId ? getInitials('Patient') : 'NA'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="text-white font-medium truncate">
                        {appointment.patientId ? 'Patient' : 'No patient'}
                      </span>
                      <Badge className="ml-2 bg-white/30 text-white hover:bg-white/40 text-xs">
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="text-white/80 text-sm flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {getRelativeDay(new Date(appointment.date))}, {formatTime(appointment.time)}
                    </div>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-white/70" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};