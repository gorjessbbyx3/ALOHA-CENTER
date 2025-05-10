
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Settings, ShoppingCart, FileText } from "lucide-react";

import { EnhancedReports } from "@/components/analytics/enhanced-reports";
import { AdminLayout } from "@/components/layout/admin-layout";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { PosTile } from "@/components/pos/pos-tile";
import { MenuTile } from "@/components/menu/menu-tile";
import { ManageTile } from "@/components/manage/manage-tile";
import { UpcomingAppointmentsTile } from "@/components/appointments/upcoming-appointments-tile";
import { AnalyticsTile } from "@/components/dashboard/analytics-tile";
import { StickyNotesTile } from "@/components/notes/sticky-notes-tile";
import { DateTimeTile } from "@/components/datetime/datetime-tile";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

export default function Dashboard() {
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  
  // Fetch dashboard stats
  const { data: stats = { 
    todayAppointments: 0, 
    newPatients: 0, 
    weeklyRevenue: 0, 
    booked: 0, 
    percentageBooked: 0, 
    servicesSale: 0, 
    hourAvailable: 0 
  }, isLoading } = useQuery({
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
            <Button 
              variant="secondary" 
              className="bg-white text-cyan-500 hover:bg-cyan-50"
              onClick={() => window.location.assign("/appointments")}
            >
              Open Book
            </Button>
          </div>
          
          <div className="bg-indigo-500 text-white rounded-md p-6 flex flex-col items-center justify-center min-h-[200px]">
            <Settings className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-bold mb-1">Management</h3>
            <p className="text-sm mb-4">Configure and manage clinic settings</p>
            <Button 
              variant="secondary" 
              className="bg-white text-indigo-500 hover:bg-indigo-50"
              onClick={() => document.getElementById('manage-dialog-trigger')?.click()}
            >
              Manage
            </Button>
            <div className="hidden">
              <ManageTile />
            </div>
          </div>
          
          {/* Second Row - POS and Menu */}
          <div className="bg-teal-500 text-white rounded-md p-6 flex flex-col items-center justify-center min-h-[200px]">
            <ShoppingCart className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-bold mb-1">Point of Sale</h3>
            <p className="text-sm mb-4">Process payments & sell products</p>
            <Button 
              variant="secondary" 
              className="bg-white text-teal-500 hover:bg-teal-50"
              onClick={() => document.getElementById('pos-dialog-trigger')?.click()}
            >
              Open POS
            </Button>
            <div className="hidden">
              <PosTile />
            </div>
          </div>
          
          <div className="bg-blue-500 text-white rounded-md p-6 flex flex-col items-center justify-center min-h-[200px]">
            <FileText className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-bold mb-1">Services Menu</h3>
            <p className="text-sm mb-4">View and manage service offerings</p>
            <Button 
              variant="secondary" 
              className="bg-white text-blue-500 hover:bg-blue-50"
              onClick={() => document.getElementById('menu-dialog-trigger')?.click()}
            >
              View Menu
            </Button>
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
        
        {/* Enhanced Reports Dialog */}
        <div className="mt-6 flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                View Enhanced Reports
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Enhanced Analytics & Reports</DialogTitle>
                <DialogDescription>
                  Comprehensive analytics and reports for your clinic's performance
                </DialogDescription>
              </DialogHeader>
              <EnhancedReports />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* New Appointment Form Dialog */}
      <AppointmentForm 
        open={isAppointmentFormOpen} 
        onOpenChange={setIsAppointmentFormOpen} 
      />

      {/* Hidden trigger elements for the dialogs */}
      <div className="hidden">
        <Button id="manage-dialog-trigger">Open Management</Button>
        <Button id="pos-dialog-trigger">Open POS</Button>
        <Button id="menu-dialog-trigger">Open Menu</Button>
      </div>
    </AdminLayout>
  );
}
