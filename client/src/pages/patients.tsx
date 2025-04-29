import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Patient, Appointment } from "@shared/schema";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Form schema for new patient
const patientFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number is required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  address: z.string(),
  insuranceProvider: z.string(),
  insuranceNumber: z.string(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch patients
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients"],
    select: (data: Patient[]) => data,
  });
  
  // Fetch appointments for patient details
  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
    select: (data: Appointment[]) => data,
  });
  
  // Set up form
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      insuranceProvider: "",
      insuranceNumber: "",
    },
  });
  
  // Filter patients based on search query
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get selected patient details
  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  
  // Get patient's appointments
  const patientAppointments = selectedPatientId
    ? appointments.filter(a => a.patientId === selectedPatientId)
    : [];
  
  const handleOpenPatientDetails = (id: number) => {
    setSelectedPatientId(id);
  };
  
  const handleClosePatientDetails = () => {
    setSelectedPatientId(null);
  };
  
  const onSubmit = (values: PatientFormValues) => {
    // In a real app, we would submit to API
    toast({
      title: "Form submitted",
      description: "New patient would be created in a production environment",
    });
    setIsPatientFormOpen(false);
    form.reset();
  };
  
  return (
    <AdminLayout 
      title="Patients" 
      subtitle="Manage patient records and information"
      onNewAppointment={() => setIsPatientFormOpen(true)}
      showExportBtn={false}
    >
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            type="search"
            placeholder="Search patients..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsPatientFormOpen(true)}>Add New Patient</Button>
      </div>
      
      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {searchQuery ? "No patients match your search" : "No patients found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium text-gray-500">ID</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500">Name</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500">Email</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500">Phone</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500">Last Visit</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-500">{patient.patientId}</td>
                      <td className="py-3 px-4 font-medium">{patient.name}</td>
                      <td className="py-3 px-4 text-sm">{patient.email}</td>
                      <td className="py-3 px-4 text-sm">{patient.phone || "—"}</td>
                      <td className="py-3 px-4 text-sm">
                        {patient.lastVisit ? format(new Date(patient.lastVisit), "MMM d, yyyy") : "No visits"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          className={cn(
                            patient.status === 'active' ? 'bg-green-100 text-green-800' :
                            patient.status === 'follow-up' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          )}
                          variant="outline"
                        >
                          {patient.status === 'active' ? 'Active' : 
                           patient.status === 'follow-up' ? 'Follow-up' : 
                           patient.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenPatientDetails(patient.id)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Patient Details Dialog */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={handleClosePatientDetails}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{selectedPatient.name}</DialogTitle>
              <DialogDescription>
                Patient ID: {selectedPatient.patientId}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Patient Info</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedPatient.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{selectedPatient.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p className="text-sm text-gray-900">
                      {selectedPatient.dateOfBirth ? format(new Date(selectedPatient.dateOfBirth), "MMMM d, yyyy") : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm text-gray-900">{selectedPatient.status}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">{selectedPatient.address || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Insurance Provider</p>
                    <p className="text-sm text-gray-900">{selectedPatient.insuranceProvider || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Insurance Number</p>
                    <p className="text-sm text-gray-900">{selectedPatient.insuranceNumber || "Not provided"}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="appointments" className="space-y-4 py-4">
                {patientAppointments.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No appointments found for this patient</div>
                ) : (
                  <div className="space-y-4">
                    {patientAppointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-md p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">
                              {format(new Date(appointment.date), "MMM d, yyyy")} at {appointment.time}
                            </p>
                            <p className="text-sm text-gray-500">Duration: {appointment.duration} minutes</p>
                          </div>
                          <Badge 
                            className={cn(
                              appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'canceled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            )}
                            variant="outline"
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        {appointment.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">Notes:</p>
                            <p className="text-sm">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-4 py-4">
                <div className="text-center py-4 text-gray-500">Billing information would be displayed here</div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleClosePatientDetails}>Close</Button>
              <Button>Edit Patient</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* New Patient Form Dialog */}
      <Dialog open={isPatientFormOpen} onOpenChange={setIsPatientFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient's information to create a new record
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="patient@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, State, Zip" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="insuranceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="Insurance Company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="insuranceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Insurance ID Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsPatientFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Patient</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
