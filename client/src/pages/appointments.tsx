import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@shared/schema";
import { AdminLayout } from "@/components/layout/admin-layout";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { AppointmentDetails } from "@/components/appointments/appointment-details";
import { AppointmentBook } from "@/components/appointments/appointment-book";
import { RoomSelector } from "@/components/appointments/room-selector";
import { RoomAppointments } from "@/components/appointments/room-appointments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LightTherapyInfo } from "@/components/manage/light-therapy-info";
import { Service } from "@shared/schema";

export default function Appointments() {
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>();
  const [viewMode, setViewMode] = useState<"calendar" | "rooms">("calendar");

  // Fetch appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
    select: (data: Appointment[]) => data,
  });

  // Handle view appointment details
  const handleViewAppointment = (id: number) => {
    setSelectedAppointmentId(id);
    setIsDetailsOpen(true);
  };

  // Handle edit appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointmentId(appointment.id);
    setIsAppointmentFormOpen(true);
  };

  return (
    <AdminLayout 
      title="Appointment Book" 
      subtitle="Schedule and manage appointments with drag-and-drop or Calendly"
      onNewAppointment={() => setIsAppointmentFormOpen(true)}
      showExportBtn={false}
      actionButton={
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open('https://calendly.com/your-account-here', '_blank')}
        >
          <ExternalLink size={16} className="mr-2" />
          Open Calendly Dashboard
        </Button>
      }
    >
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "calendar" | "rooms")} className="mb-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="rooms">Room View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-0">
          {/* Full-size Appointment Book with Meevo UI */}
          <div className="h-[calc(100vh-16rem)] bg-white rounded-md shadow overflow-hidden">
            <AppointmentBook />
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="mt-0">
          <RoomSelector 
            onRoomSelected={setSelectedRoomId}
            selectedRoomId={selectedRoomId}
          />

          {selectedRoomId && (
            <RoomAppointments
              roomId={selectedRoomId}
              onNewAppointment={() => setIsAppointmentFormOpen(true)}
              onEditAppointment={handleEditAppointment}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Appointment Form */}
      <AppointmentForm 
        open={isAppointmentFormOpen} 
        onOpenChange={setIsAppointmentFormOpen} 
        appointmentId={selectedAppointmentId}
        onSuccess={() => {
          setSelectedAppointmentId(null);
        }}
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