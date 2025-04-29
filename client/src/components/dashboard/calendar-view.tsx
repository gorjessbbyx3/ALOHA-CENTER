import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  appointments: number;
  appointmentStatus?: "available" | "limited" | "booked";
  onClick: () => void;
}

function CalendarDay({ 
  date, 
  isCurrentMonth, 
  isToday: isTodayDay, 
  isSelected, 
  appointments,
  appointmentStatus,
  onClick 
}: CalendarDayProps) {
  let statusBg = "bg-primary-100 text-primary-800";
  let statusText = `${appointments} slots`;
  
  if (appointmentStatus === "limited") {
    statusBg = "bg-secondary-100 text-secondary-800";
  } else if (appointmentStatus === "booked") {
    statusBg = "bg-red-100 text-red-800";
    statusText = "Fully booked";
  }
  
  return (
    <div 
      className={cn(
        "calendar-day border rounded-md p-1 cursor-pointer transition-colors duration-200",
        isCurrentMonth ? "" : "bg-gray-50",
        isSelected ? "ring-2 ring-primary-600" : "",
        "hover:border-primary-300"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "text-right text-sm mb-1",
        isTodayDay ? "font-bold text-primary-600" : "",
        !isCurrentMonth ? "text-gray-400" : ""
      )}>
        {date.getDate()}
      </div>
      
      {isCurrentMonth && appointments > 0 && (
        <div className={cn("text-xs rounded px-1 py-0.5 mb-1", statusBg)}>
          {statusText}
        </div>
      )}
    </div>
  );
}

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  
  // Query appointments from API
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/appointments"],
    select: (data: Appointment[]) => data,
  });
  
  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    if (!appointments || appointments.length === 0) return 0;
    
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.date), date)
    ).length;
  };
  
  // Get appointment status for a date
  const getAppointmentStatus = (date: Date): "available" | "limited" | "booked" => {
    const count = getAppointmentsForDate(date);
    if (count === 0) return "available";
    if (count < 5) return "available";
    if (count < 8) return "limited";
    return "booked";
  };
  
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  
  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center justify-between">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">Monthly Calendar</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="sr-only">Previous month</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="sr-only">Next month</span>
          </Button>
          
          <span className="ml-2 px-3 py-1.5 text-sm font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">{day}</div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        {isLoading ? (
          <div className="grid grid-cols-7 gap-2 min-h-[400px] place-items-center">
            <div className="col-span-7">Loading calendar data...</div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* Previous Month Days */}
            {Array.from({ length: firstDayOfMonth.getDay() }).map((_, index) => {
              const prevMonthDay = new Date(
                firstDayOfMonth.getFullYear(),
                firstDayOfMonth.getMonth(),
                -index
              );
              return (
                <CalendarDay
                  key={`prev-${index}`}
                  date={prevMonthDay}
                  isCurrentMonth={false}
                  isToday={false}
                  isSelected={false}
                  appointments={0}
                  onClick={() => {}}
                />
              );
            }).reverse()}
            
            {/* Current Month Days */}
            {daysInMonth.map((day) => {
              const appointmentsCount = getAppointmentsForDate(day);
              return (
                <CalendarDay
                  key={day.toISOString()}
                  date={day}
                  isCurrentMonth={true}
                  isToday={isToday(day)}
                  isSelected={isSameDay(day, selectedDate)}
                  appointments={appointmentsCount}
                  appointmentStatus={getAppointmentStatus(day)}
                  onClick={() => setSelectedDate(day)}
                />
              );
            })}
            
            {/* Next Month Days */}
            {Array.from({ length: 6 - lastDayOfMonth.getDay() }).map((_, index) => {
              const nextMonthDay = new Date(
                lastDayOfMonth.getFullYear(),
                lastDayOfMonth.getMonth(),
                lastDayOfMonth.getDate() + index + 1
              );
              return (
                <CalendarDay
                  key={`next-${index}`}
                  date={nextMonthDay}
                  isCurrentMonth={false}
                  isToday={false}
                  isSelected={false}
                  appointments={0}
                  onClick={() => {}}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
