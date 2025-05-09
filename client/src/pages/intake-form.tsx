
import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Appointment, Patient } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function IntakeForm() {
  const [, params] = useRoute("/intake-form/:id");
  const appointmentId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isViewMode, setIsViewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    // Personal information
    name: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    
    // Medical information
    medicalConditions: "",
    medications: "",
    allergies: "",
    
    // Consent
    consentTreatment: false,
    consentPrivacy: false,
    consentPhoto: false,
    
    // Payment
    paymentMethod: "card",
  });
  
  // Check if we're in view mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setIsViewMode(urlParams.get("view") === "true");
  }, []);
  
  // Get appointment details
  const { data: appointment, isLoading: appointmentLoading } = useQuery({
    queryKey: [`/api/appointments/${appointmentId}`],
    enabled: !!appointmentId,
    select: (data: Appointment) => data,
  });
  
  // Get patient details
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: appointment ? [`/api/patients/${appointment.patientId}`] : [],
    enabled: !!appointment?.patientId,
    select: (data: Patient) => data,
  });
  
  // Pre-fill form with patient data
  useEffect(() => {
    if (patient) {
      setFormData(prev => ({
        ...prev,
        name: patient.name || "",
        dob: patient.dateOfBirth || "",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
      }));
    }
  }, [patient]);
  
  // Submit form mutation
  const submitForm = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/appointments/${appointmentId}/intake-form`, {
        status: "completed",
        timestamp: new Date().toISOString(),
        formData
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/${appointmentId}`] });
      toast({
        title: "Form Submitted",
        description: "Your intake form has been successfully submitted.",
      });
      // In a real implementation, you might redirect or close the window
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem submitting your form. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm.mutate();
  };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Loading state
  if (appointmentLoading || patientLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="text-2xl">Patient Intake Form</CardTitle>
          <CardDescription className="text-white opacity-90">
            {isViewMode 
              ? "Review the patient's intake form information" 
              : "Please complete all sections of this form"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="medical">Medical History</TabsTrigger>
                <TabsTrigger value="consent">Consent Forms</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
              </TabsList>
              
              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange}
                      readOnly={isViewMode}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input 
                      id="dob" 
                      name="dob" 
                      type="date" 
                      value={formData.dob}
                      onChange={handleInputChange}
                      readOnly={isViewMode}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      readOnly={isViewMode}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      readOnly={isViewMode}
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea 
                      id="address" 
                      name="address" 
                      value={formData.address}
                      onChange={handleInputChange}
                      readOnly={isViewMode}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                    <Input 
                      id="emergencyContact" 
                      name="emergencyContact" 
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      readOnly={isViewMode}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input 
                      id="emergencyPhone" 
                      name="emergencyPhone" 
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      readOnly={isViewMode}
                    />
                  </div>
                </div>
                
                {!isViewMode && (
                  <div className="flex justify-end mt-4">
                    <Button type="button" onClick={() => setActiveTab("medical")}>
                      Next: Medical History
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Medical History Tab */}
              <TabsContent value="medical" className="space-y-4">
                <h3 className="text-lg font-medium">Medical History</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicalConditions">
                      Do you have any medical conditions we should be aware of?
                    </Label>
                    <Textarea 
                      id="medicalConditions" 
                      name="medicalConditions" 
                      value={formData.medicalConditions}
                      onChange={handleInputChange}
                      readOnly={isViewMode}
                      placeholder="List any medical conditions, injuries, or diagnoses"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="medications">
                      Are you currently taking any medications?
                    </Label>
                    <Textarea 
                      id="medications" 
                      name="medications" 
                      value={formData.medications}
                      onChange={handleInputChange}
                      readOnly={isViewMode}
                      placeholder="List all current medications and supplements"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="allergies">
                      Do you have any allergies?
                    </Label>
                    <Textarea 
                      id="allergies" 
                      name="allergies" 
                      value={formData.allergies}
                      onChange={handleInputChange}
                      readOnly={isViewMode}
                      placeholder="List any allergies to medications, foods, or materials"
                    />
                  </div>
                </div>
                
                {!isViewMode && (
                  <div className="flex justify-between mt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("personal")}
                    >
                      Back
                    </Button>
                    <Button type="button" onClick={() => setActiveTab("consent")}>
                      Next: Consent Forms
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Consent Forms Tab */}
              <TabsContent value="consent" className="space-y-4">
                <h3 className="text-lg font-medium">Consent Forms</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="consentTreatment" 
                      checked={formData.consentTreatment}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("consentTreatment", checked as boolean)
                      }
                      disabled={isViewMode}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="consentTreatment">
                        I consent to receive treatment
                      </Label>
                      <p className="text-sm text-gray-500">
                        I authorize the staff to administer the therapeutic services I have requested.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="consentPrivacy" 
                      checked={formData.consentPrivacy}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("consentPrivacy", checked as boolean)
                      }
                      disabled={isViewMode}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="consentPrivacy">
                        I acknowledge the privacy policy
                      </Label>
                      <p className="text-sm text-gray-500">
                        I have been provided with a copy of the privacy policy and understand how my information will be used.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="consentPhoto" 
                      checked={formData.consentPhoto}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("consentPhoto", checked as boolean)
                      }
                      disabled={isViewMode}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="consentPhoto">
                        I consent to photography (optional)
                      </Label>
                      <p className="text-sm text-gray-500">
                        I authorize the clinic to take and use photographs for clinical documentation and marketing purposes.
                      </p>
                    </div>
                  </div>
                </div>
                
                {!isViewMode && (
                  <div className="flex justify-between mt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("medical")}
                    >
                      Back
                    </Button>
                    <Button type="button" onClick={() => setActiveTab("payment")}>
                      Next: Payment Information
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Payment Tab */}
              <TabsContent value="payment" className="space-y-4">
                <h3 className="text-lg font-medium">Payment Information</h3>
                
                <p className="text-sm text-gray-500 mb-4">
                  Please select your preferred payment method. Your payment information will be securely stored.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Payment options would be added here */}
                  <p>Payment processing will be handled at checkout.</p>
                </div>
                
                {!isViewMode && (
                  <div className="flex justify-between mt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("consent")}
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={submitForm.isPending}>
                      {submitForm.isPending ? "Submitting..." : "Submit Intake Form"}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          {isViewMode ? (
            <div className="w-full flex justify-end">
              <Button variant="outline" onClick={() => window.close()}>
                Close
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Thank you for taking the time to complete this form. All information is kept confidential.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
