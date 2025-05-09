
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function IntakeForm() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    // Section 1: Basic Information
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    emailAddress: "",
    emergencyContact: "",
    
    // Section 2: General Health History
    underPhysicianCare: false,
    chronicConditions: "",
    isPregnant: "no",
    hasMedicalDevices: false,
    hasSeizures: false,
    takingMedications: false,
    medicationsList: "",
    
    // Section 3: Wellness Goals
    reasonForVisit: "",
    priorExperience: false,
    concerns: "",
    hearAboutUs: "",
    
    // Section 4: Pets
    hasPet: false,
    petName: "",
    petSpecies: "",
    petAge: "",
    petUnderVetCare: "no",
    petHasSeizures: "no",
    petWellnessGoals: "",
    
    // Section 5: Consent and Agreement
    notMedicalCare: false,
    consentToServices: false,
    releaseFromLiability: false,
    permissionForTestimonial: false
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };
  
  // Handle select/radio changes
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Submit form mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/api/appointments/${appointmentId}/intake-form`, {
        formData,
        status: "completed",
        timestamp: new Date().toISOString()
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Intake Form Submitted",
        description: "Thank you for completing the intake form.",
      });
      navigate(`/appointments`);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit the intake form",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate();
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
          <CardTitle className="text-2xl">Aloha Light Center - Client Intake Form</CardTitle>
          <CardDescription className="text-white/80">
            Please complete this form for your light therapy session
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-6">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Section 1: Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
                  <Input 
                    id="dateOfBirth" 
                    name="dateOfBirth" 
                    type="date" 
                    value={formData.dateOfBirth} 
                    onChange={handleChange} 
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    value={formData.phoneNumber} 
                    onChange={handleChange} 
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailAddress">Email Address <span className="text-red-500">*</span></Label>
                  <Input 
                    id="emailAddress" 
                    name="emailAddress" 
                    type="email" 
                    value={formData.emailAddress} 
                    onChange={handleChange} 
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Name & Number <span className="text-red-500">*</span></Label>
                  <Input 
                    id="emergencyContact" 
                    name="emergencyContact" 
                    value={formData.emergencyContact} 
                    onChange={handleChange} 
                    required
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Section 2: General Health History */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Section 2: General Health History</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="underPhysicianCare" 
                    checked={formData.underPhysicianCare} 
                    onCheckedChange={(checked) => handleCheckboxChange("underPhysicianCare", checked as boolean)} 
                  />
                  <Label htmlFor="underPhysicianCare" className="leading-tight">
                    Are you currently under the care of a physician?
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chronicConditions">Do you have any chronic conditions? (e.g., autoimmune, neurological, cardiovascular)</Label>
                  <Textarea 
                    id="chronicConditions" 
                    name="chronicConditions" 
                    value={formData.chronicConditions} 
                    onChange={handleChange} 
                    placeholder="If yes, please specify"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Are you currently pregnant or breastfeeding?</Label>
                  <RadioGroup 
                    value={formData.isPregnant} 
                    onValueChange={(value) => handleSelectChange("isPregnant", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="pregnant-yes" />
                      <Label htmlFor="pregnant-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="pregnant-no" />
                      <Label htmlFor="pregnant-no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="na" id="pregnant-na" />
                      <Label htmlFor="pregnant-na">Not Applicable</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="hasMedicalDevices" 
                    checked={formData.hasMedicalDevices} 
                    onCheckedChange={(checked) => handleCheckboxChange("hasMedicalDevices", checked as boolean)} 
                  />
                  <Label htmlFor="hasMedicalDevices" className="leading-tight">
                    Do you have a pacemaker, implants, or sensitive medical devices?
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="hasSeizures" 
                    checked={formData.hasSeizures} 
                    onCheckedChange={(checked) => handleCheckboxChange("hasSeizures", checked as boolean)} 
                  />
                  <Label htmlFor="hasSeizures" className="leading-tight">
                    Do you experience seizures or epilepsy?
                  </Label>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="takingMedications" 
                      checked={formData.takingMedications} 
                      onCheckedChange={(checked) => {
                        handleCheckboxChange("takingMedications", checked as boolean);
                        if (!checked) setFormData(prev => ({ ...prev, medicationsList: "" }));
                      }} 
                    />
                    <Label htmlFor="takingMedications" className="leading-tight">
                      Are you currently taking medications?
                    </Label>
                  </div>
                  
                  {formData.takingMedications && (
                    <div className="pl-6">
                      <Textarea 
                        id="medicationsList" 
                        name="medicationsList" 
                        value={formData.medicationsList} 
                        onChange={handleChange} 
                        placeholder="Please list your medications (optional)"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Section 3: Wellness Goals */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Section 3: Wellness Goals</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reasonForVisit">What brings you to Aloha Light Center? <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="reasonForVisit" 
                    name="reasonForVisit" 
                    value={formData.reasonForVisit} 
                    onChange={handleChange} 
                    required
                  />
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="priorExperience" 
                    checked={formData.priorExperience} 
                    onCheckedChange={(checked) => handleCheckboxChange("priorExperience", checked as boolean)} 
                  />
                  <Label htmlFor="priorExperience" className="leading-tight">
                    Have you experienced light, energy, or frequency-based sessions before?
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="concerns">What physical or emotional concerns are you hoping to support?</Label>
                  <Textarea 
                    id="concerns" 
                    name="concerns" 
                    value={formData.concerns} 
                    onChange={handleChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hearAboutUs">How did you hear about us?</Label>
                  <Select 
                    value={formData.hearAboutUs} 
                    onValueChange={(value) => handleSelectChange("hearAboutUs", value)}
                  >
                    <SelectTrigger id="hearAboutUs">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friend">Friend or Family</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="search">Internet Search</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Section 4: Pets */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Section 4: Pets (if applicable)</h3>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="hasPet" 
                  checked={formData.hasPet} 
                  onCheckedChange={(checked) => {
                    handleCheckboxChange("hasPet", checked as boolean);
                    if (!checked) {
                      setFormData(prev => ({
                        ...prev, 
                        petName: "", 
                        petSpecies: "", 
                        petAge: "",
                        petUnderVetCare: "no",
                        petHasSeizures: "no",
                        petWellnessGoals: ""
                      }));
                    }
                  }} 
                />
                <Label htmlFor="hasPet" className="leading-tight">
                  I am bringing a pet to my private light therapy session
                </Label>
              </div>
              
              {formData.hasPet && (
                <div className="pl-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="petName">Pet's Name</Label>
                      <Input 
                        id="petName" 
                        name="petName" 
                        value={formData.petName} 
                        onChange={handleChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="petSpecies">Species</Label>
                      <Input 
                        id="petSpecies" 
                        name="petSpecies" 
                        value={formData.petSpecies} 
                        onChange={handleChange} 
                        placeholder="Dog, Cat, etc."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="petAge">Age</Label>
                      <Input 
                        id="petAge" 
                        name="petAge" 
                        value={formData.petAge} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Is your pet under veterinary care?</Label>
                    <RadioGroup 
                      value={formData.petUnderVetCare} 
                      onValueChange={(value) => handleSelectChange("petUnderVetCare", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="pet-vet-yes" />
                        <Label htmlFor="pet-vet-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="pet-vet-no" />
                        <Label htmlFor="pet-vet-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Does your pet have a history of seizures or trauma?</Label>
                    <RadioGroup 
                      value={formData.petHasSeizures} 
                      onValueChange={(value) => handleSelectChange("petHasSeizures", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="pet-seizures-yes" />
                        <Label htmlFor="pet-seizures-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="pet-seizures-no" />
                        <Label htmlFor="pet-seizures-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="petWellnessGoals">What are your goals for your pet's well-being?</Label>
                    <Textarea 
                      id="petWellnessGoals" 
                      name="petWellnessGoals" 
                      value={formData.petWellnessGoals} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Section 5: Consent and Agreement */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Section 5: Consent and Agreement</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="notMedicalCare" 
                    checked={formData.notMedicalCare} 
                    onCheckedChange={(checked) => handleCheckboxChange("notMedicalCare", checked as boolean)} 
                    required
                  />
                  <Label htmlFor="notMedicalCare" className="leading-tight">
                    I understand that light sessions are not a replacement for medical care. <span className="text-red-500">*</span>
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="consentToServices" 
                    checked={formData.consentToServices} 
                    onCheckedChange={(checked) => handleCheckboxChange("consentToServices", checked as boolean)} 
                    required
                  />
                  <Label htmlFor="consentToServices" className="leading-tight">
                    I consent to receive non-invasive, light-based wellness services. <span className="text-red-500">*</span>
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="releaseFromLiability" 
                    checked={formData.releaseFromLiability} 
                    onCheckedChange={(checked) => handleCheckboxChange("releaseFromLiability", checked as boolean)} 
                    required
                  />
                  <Label htmlFor="releaseFromLiability" className="leading-tight">
                    I release Aloha Light Center and its staff from liability related to my session. <span className="text-red-500">*</span>
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="permissionForTestimonial" 
                    checked={formData.permissionForTestimonial} 
                    onCheckedChange={(checked) => handleCheckboxChange("permissionForTestimonial", checked as boolean)} 
                  />
                  <Label htmlFor="permissionForTestimonial" className="leading-tight">
                    I give permission for Aloha Light Center to use anonymized feedback or testimonial excerpts.
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6 pb-8 px-6 border-t bg-muted/20">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Submitting..." : "Submit Intake Form"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
