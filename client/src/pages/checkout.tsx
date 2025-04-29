import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Appointment, Patient, Service } from "@shared/schema";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckoutForm } from "@/components/payment/checkout-form";
import { useToast } from "@/hooks/use-toast";

// Check for Stripe public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_samplepublickey');

export default function Checkout() {
  const [appointmentId] = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Fetch appointment details
  const { data: appointment, isLoading: isAppointmentLoading } = useQuery({
    queryKey: [`/api/appointments/${appointmentId}`],
    enabled: !!appointmentId,
    select: (data: Appointment) => data,
  });
  
  // Fetch patient details
  const { data: patient, isLoading: isPatientLoading } = useQuery({
    queryKey: [`/api/patients/${appointment?.patientId}`],
    enabled: !!appointment?.patientId,
    select: (data: Patient) => data,
  });
  
  // Fetch service details
  const { data: services = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ["/api/services"],
    select: (data: Service[]) => data,
  });
  
  // Get service for this appointment
  const service = services.find(s => s.id === appointment?.serviceId);
  
  // Create payment intent
  useEffect(() => {
    if (appointment && patient && service) {
      const createPaymentIntent = async () => {
        try {
          const response = await apiRequest("POST", "/api/create-payment-intent", {
            amount: service.price,
            appointmentId: appointment.id,
            patientId: patient.id
          });
          
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } catch (error) {
          console.error("Error creating payment intent:", error);
          toast({
            title: "Payment Error",
            description: "There was an error setting up the payment. Please try again.",
            variant: "destructive",
          });
        }
      };
      
      createPaymentIntent();
    }
  }, [appointment, patient, service]);
  
  const handleSuccess = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      navigate("/appointments");
    }, 3000);
  };
  
  const isLoading = isAppointmentLoading || isPatientLoading || isServicesLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900">Loading payment information...</h2>
        </div>
      </div>
    );
  }
  
  if (!appointment || !patient || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Error</CardTitle>
            <CardDescription>
              We couldn't find the appointment or patient information. Please go back and try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/appointments")} className="w-full">
              Return to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">Payment Successful!</CardTitle>
            <CardDescription>
              Your payment has been processed successfully. You will be redirected to the appointments page shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/appointments")} className="w-full">
              Return to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Checkout</h1>
          <p className="text-gray-600">Complete your payment to confirm your appointment</p>
        </div>
        
        {clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <CheckoutForm
              appointment={appointment}
              patient={patient}
              service={service}
              onSuccess={handleSuccess}
            />
          </Elements>
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h2 className="text-lg font-medium text-gray-900">Setting up payment...</h2>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
