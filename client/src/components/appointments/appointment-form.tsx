import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Patient, Service, Appointment } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const appointmentFormSchema = z.object({
  patientId: z.string().min(1, { message: "Please select a patient" }),
  serviceId: z.string().min(1, { message: "Please select a service" }),
  date: z.string().min(1, { message: "Please select a date" }),
  time: z.string().min(1, { message: "Please select a time" }),
  notes: z.string().optional(),
  paymentMethod: z.enum(["insurance", "card", "cash"]),
  roomId: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId?: number | null;
  onSuccess?: () => void;
}

export function AppointmentForm({ 
  open, 
  onOpenChange, 
  appointmentId = null, 
  onSuccess 
}: AppointmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get services
  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    select: (data: Service[]) => data,
  });
  
  // Get patients
  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
    select: (data: Patient[]) => data,
  });
  
  // Get rooms
  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
    select: (data: any[]) => data,
  });
  
  // Get appointment data if in edit mode
  const { data: appointmentData, isLoading: isLoadingAppointment } = useQuery({
    queryKey: ["/api/appointments", appointmentId],
    enabled: !!appointmentId,
    throwOnError: false,
  });
  
  // Form definition
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: "",
      serviceId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "",
      notes: "",
      paymentMethod: "insurance",
      roomId: "",
    },
  });
  
  // Update form with appointment data when in edit mode
  useEffect(() => {
    if (appointmentId && appointmentData) {
      setIsEditMode(true);
      
      const dateStr = format(new Date(appointmentData.date), "yyyy-MM-dd");
      
      form.reset({
        patientId: appointmentData.patientId ? appointmentData.patientId.toString() : "",
        serviceId: appointmentData.serviceId ? appointmentData.serviceId.toString() : "",
        date: dateStr,
        time: appointmentData.time,
        notes: appointmentData.notes || "",
        paymentMethod: appointmentData.paymentMethod as "insurance" | "card" | "cash" || "insurance",
        roomId: appointmentData.roomId ? appointmentData.roomId.toString() : "",
      });
    } else {
      setIsEditMode(false);
      form.reset({
        patientId: "",
        serviceId: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "",
        notes: "",
        paymentMethod: "insurance",
        roomId: "",
      });
    }
  }, [appointmentId, appointmentData, form]);
  
  // Selected service for duration determination
  const selectedServiceId = form.watch("serviceId");
  const selectedService = services.find(service => service.id.toString() === selectedServiceId);
  
  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      const { patientId, serviceId, roomId, ...rest } = data;
      
      const appointmentData = {
        patientId: parseInt(patientId),
        serviceId: parseInt(serviceId),
        roomId: roomId ? parseInt(roomId) : null,
        duration: selectedService?.duration || 30, // Default to 30 minutes if no service selected
        status: "scheduled",
        ...rest,
      };
      
      const response = await apiRequest("POST", "/api/appointments", appointmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      onOpenChange(false);
      toast({
        title: "Appointment Scheduled",
        description: "The appointment has been successfully scheduled.",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was a problem scheduling the appointment. Please try again.",
        variant: "destructive",
      });
      console.error("Appointment creation error:", error);
    },
  });
  
  // Update appointment mutation
  const updateAppointment = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      if (!appointmentId) throw new Error("No appointment ID provided for update");
      
      const { patientId, serviceId, roomId, ...rest } = data;
      
      const appointmentData = {
        patientId: parseInt(patientId),
        serviceId: parseInt(serviceId),
        roomId: roomId ? parseInt(roomId) : null,
        duration: selectedService?.duration || 30,
        ...rest,
      };
      
      const response = await apiRequest("PATCH", `/api/appointments/${appointmentId}`, appointmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      onOpenChange(false);
      toast({
        title: "Appointment Updated",
        description: "The appointment has been successfully updated.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was a problem updating the appointment. Please try again.",
        variant: "destructive",
      });
      console.error("Appointment update error:", error);
    },
  });
  
  const onSubmit = (values: AppointmentFormValues) => {
    if (isEditMode) {
      updateAppointment.mutate(values);
    } else {
      createAppointment.mutate(values);
    }
  };
  
  // Available time slots (would be dynamic in a real app)
  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];
  
  const isSubmitting = createAppointment.isPending || updateAppointment.isPending;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Appointment" : "Schedule New Appointment"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the details for this appointment."
              : "Fill in the details below to schedule a new appointment."}
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingAppointment && isEditMode ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Patient Selection */}
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Service Type */}
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      // If changing from Private with Pet to another service, update the form
                      const selectedService = services.find(s => s.id.toString() === value);
                      if (selectedService && !selectedService.name.includes("with Pet")) {
                        // Switch to regular service without pet option
                      }
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name} ({service.duration} min) - ${service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Show pet checkbox only for private light therapy */}
              {selectedServiceId && 
                services.find(s => s.id.toString() === selectedServiceId)?.name.includes("Private Light Therapy") &&
                !services.find(s => s.id.toString() === selectedServiceId)?.name.includes("with Pet") && (
                <div className="flex items-center space-x-2 mt-2 p-2 border rounded bg-muted/20">
                  <Checkbox id="petOption" onCheckedChange={(checked) => {
                    if (checked) {
                      // Find the "with pet" service option and select it
                      const petService = services.find(s => s.name.includes("with Pet"));
                      if (petService) {
                        form.setValue("serviceId", petService.id.toString());
                      }
                    }
                  }} />
                  <Label htmlFor="petOption" className="text-sm font-medium">
                    Add pet option (+$20)
                  </Label>
                </div>
              )}
              
              {/* Room */}
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treatment Room</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No specific room</SelectItem>
                        {rooms.map((room: any) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any relevant notes about the appointment"
                        className="resize-none" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Payment Method */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="insurance" id="payment-insurance" />
                          <Label htmlFor="payment-insurance">Insurance</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="payment-card" />
                          <Label htmlFor="payment-card">Credit Card</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cash" id="payment-cash" />
                          <Label htmlFor="payment-cash">Cash (in-office)</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? (isEditMode ? "Updating..." : "Scheduling...") 
                    : (isEditMode ? "Update Appointment" : "Schedule Appointment")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
