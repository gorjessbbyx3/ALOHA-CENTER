import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Appointment, Patient, Service } from "@shared/schema";
import { AdminLayout } from "@/components/layout/admin-layout";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { AppointmentDetails } from "@/components/appointments/appointment-details";
import { AppointmentBook } from "@/components/appointments/appointment-book";

export default function Appointments() {
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
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
  
  return (
    <AdminLayout 
      title="Appointment Book" 
      subtitle="Schedule and manage appointments with drag-and-drop"
      onNewAppointment={() => setIsAppointmentFormOpen(true)}
      showExportBtn={false}
    >
      {/* Full-size Appointment Book with Meevo UI */}
      <div className="h-[calc(100vh-12rem)] bg-white rounded-md shadow overflow-hidden">
        <AppointmentBook />
      </div>
      
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
