import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { AppointmentList } from "@/components/dashboard/appointment-list";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { PosTile } from "@/components/pos/pos-tile";
import { MenuTile } from "@/components/menu/menu-tile";
import { ManageTile } from "@/components/manage/manage-tile";
import { UpcomingAppointmentsTile } from "@/components/appointments/upcoming-appointments-tile";
import { AnalyticsTile } from "@/components/dashboard/analytics-tile";
import { StickyNotesTile } from "@/components/notes/sticky-notes-tile";
import { DateTimeTile } from "@/components/datetime/datetime-tile";
import { Clock } from "lucide-react";

export default function Dashboard() {
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  
  // Fetch dashboard stats
  const { data: stats = { todayAppointments: 0, newPatients: 0, weeklyRevenue: 0, booked: 0, percentageBooked: 0, servicesSale: 0, hourAvailable: 0 }, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });
  
  const handleExport = () => {
    alert("Export functionality would generate a CSV or PDF report in a production environment");
  };
  
  return (
    <AdminLayout 
      title="Aloha Healing Center" 
      subtitle="Welcome to your Admin dashboard"
      onNewAppointment={() => setIsAppointmentFormOpen(true)}
      onExport={handleExport}
    >
      {/* Dashboard Cards Grid */}
      <div className="py-2">
        <h2 className="text-gray-500 mb-4">Welcome to your Admin dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* First Row */}
          <DashboardCard
            title="Appointment Book"
            value=""
            icon={<Clock size={48}/>}
            className="bg-primary col-span-1 md:col-span-1 h-44 md:h-48"
            iconPosition="top"
            onClick={() => window.location.href = "/appointments"}
          />
          
          <ManageTile />
          
          {/* POS Tile - takes up 2 columns in md/lg screens */}
          <PosTile />
          
          <MenuTile />
          
          {/* Second Row - Upcoming Appointments */}
          <UpcomingAppointmentsTile />
          
          {/* Analytics Tile */}
          <AnalyticsTile />
          
          {/* Third Row */}
          <StickyNotesTile />
          
          {/* Date & Time Tile */}
          <DateTimeTile />
        </div>
      </div>
      
      {/* New Appointment Form Dialog */}
      <AppointmentForm 
        open={isAppointmentFormOpen} 
        onOpenChange={setIsAppointmentFormOpen} 
      />
    </AdminLayout>
  );
}
