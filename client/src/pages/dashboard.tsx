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
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Row - 2 large tiles */}
          <div className="bg-cyan-500 text-white rounded-md p-6 flex flex-col items-center justify-center min-h-[200px]">
            <Clock size={64} className="mb-4" />
            <h3 className="text-xl font-bold mb-1">Appointment Book</h3>
            <p className="text-sm mb-4">Schedule and manage appointments</p>
            <button 
              className="bg-white text-cyan-500 px-4 py-2 rounded-md hover:bg-cyan-50 transition-colors"
              onClick={() => window.location.assign("/appointments")}
            >
              Open Book
            </button>
          </div>
          
          <div className="bg-indigo-500 text-white rounded-md p-6 flex flex-col items-center justify-center min-h-[200px]">
            <svg className="h-16 w-16 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <h3 className="text-xl font-bold mb-1">Management</h3>
            <p className="text-sm mb-4">Configure and manage clinic settings</p>
            <button 
              className="bg-white text-indigo-500 px-4 py-2 rounded-md hover:bg-indigo-50 transition-colors"
              onClick={() => document.getElementById('manage-dialog-trigger')?.click()}
            >
              Manage
            </button>
            <div className="hidden">
              <ManageTile />
            </div>
          </div>
          
          {/* Second Row - POS and Menu */}
          <div className="bg-teal-500 text-white rounded-md p-6 flex flex-col items-center justify-center min-h-[200px]">
            <svg className="h-16 w-16 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h3 className="text-xl font-bold mb-1">Point of Sale</h3>
            <p className="text-sm mb-4">Process payments & sell products</p>
            <button 
              className="bg-white text-teal-500 px-4 py-2 rounded-md hover:bg-teal-50 transition-colors"
              onClick={() => document.getElementById('pos-dialog-trigger')?.click()}
            >
              Open POS
            </button>
            <div className="hidden">
              <PosTile />
            </div>
          </div>
          
          <div className="bg-blue-500 text-white rounded-md p-6 flex flex-col items-center justify-center min-h-[200px]">
            <svg className="h-16 w-16 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h3 className="text-xl font-bold mb-1">Services Menu</h3>
            <p className="text-sm mb-4">View and manage service offerings</p>
            <button 
              className="bg-white text-blue-500 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
              onClick={() => document.getElementById('menu-dialog-trigger')?.click()}
            >
              View Menu
            </button>
            <div className="hidden">
              <MenuTile />
            </div>
          </div>
          
          {/* Bottom Row */}
          <div className="col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UpcomingAppointmentsTile />
              <AnalyticsTile />
              <StickyNotesTile />
              <DateTimeTile />
            </div>
          </div>
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
