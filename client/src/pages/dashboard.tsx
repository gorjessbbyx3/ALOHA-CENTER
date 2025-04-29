import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { MeevoCard } from "@/components/dashboard/meevo-card";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { AppointmentList } from "@/components/dashboard/appointment-list";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Clock, Users, Package2 } from "lucide-react";

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
      title="Service Provider" 
      subtitle="Overview of your clinic's performance and schedule"
      onNewAppointment={() => setIsAppointmentFormOpen(true)}
      onExport={handleExport}
    >
      {/* Meevo Dashboard Cards Grid */}
      <div className="py-2">
        <h2 className="text-gray-500 mb-4">Service Provider</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* First Row */}
          <MeevoCard
            title="Appointment Book"
            value=""
            icon={<Clock size={48}/>}
            className="bg-primary col-span-1 md:col-span-1 h-44 md:h-48"
            iconPosition="top"
            onClick={() => window.location.href = "/appointments"}
          />
          
          <MeevoCard
            title="My Requested Appts"
            value="3"
            className="bg-secondary col-span-1 h-44 md:h-48"
            valueSize="large"
          />
          
          <MeevoCard
            title="My Service Avg Time Today"
            value="2"
            className="bg-secondary col-span-1 h-44 md:h-48"
            valueSize="large"
          />
          
          <MeevoCard
            title="Gross Service Sales Today"
            value="$850"
            className="bg-primary col-span-1 h-44 md:h-48"
            valueSize="large"
          />
          
          {/* Second Row */}
          <MeevoCard
            title="My Booked Appointments Today"
            value="5"
            className="bg-primary col-span-1 h-36"
            valueSize="large"
          />
          
          <MeevoCard
            title="My Percentage Booked"
            value="60%"
            className="bg-accent col-span-1 h-36"
            valueSize="large"
          />
          
          <div className="bg-gray-800 rounded-lg col-span-1 flex items-center justify-center h-36">
            <div className="text-white text-center">
              <div className="rounded-full bg-white/10 w-16 h-16 mx-auto flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <MeevoCard
            title="Gross Service Sales This Week"
            value="$2,500"
            className="bg-primary col-span-1 h-36"
            valueSize="large"
          />
          
          <MeevoCard
            title="My Hours Available To Book Today"
            value="1.5"
            className="bg-primary col-span-1 h-36"
            valueSize="large"
          />
          
          {/* Third Row */}
          <MeevoCard
            title="Time Clock"
            value=""
            icon={<Clock size={40}/>}
            className="bg-accent col-span-1 md:col-span-1 h-36"
            iconPosition="left"
          />
          
          <MeevoCard
            title="Employee Supply Usage"
            value=""
            icon={<Package2 size={40}/>}
            className="bg-primary col-span-1 md:col-span-1 h-36"
            iconPosition="left"
          />
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
