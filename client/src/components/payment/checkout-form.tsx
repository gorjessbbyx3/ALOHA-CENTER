import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Appointment, Patient, Service } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface CheckoutFormProps {
  appointment: Appointment;
  patient: Patient;
  service: Service;
  onSuccess: () => void;
}

export function CheckoutForm({
  appointment,
  patient,
  service,
  onSuccess
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(service?.price || 0);

  // Format date for display
  const formattedDate = appointment?.date 
    ? format(new Date(appointment.date), 'MMMM d, yyyy')
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: "if_required"
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      // Record payment in our system
      try {
        await apiRequest("POST", "/api/payments", {
          appointmentId: appointment.id,
          patientId: patient.id,
          amount: paymentAmount,
          paymentMethod: "card",
          status: "completed",
          transactionId: new Date().getTime().toString() // Normally this would come from Stripe
        });

        toast({
          title: "Payment Successful",
          description: "Thank you for your payment!"
        });
        
        setIsProcessing(false);
        onSuccess();
      } catch (recordError) {
        toast({
          title: "Payment recorded, but confirmation failed",
          description: "Your payment was successful, but we couldn't update our records. Please contact support.",
          variant: "destructive"
        });
        setIsProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Appointment Summary</CardTitle>
          <CardDescription>Please review your appointment details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Patient</p>
              <p className="text-sm font-medium text-gray-900">{patient?.name}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Service</p>
              <p className="text-sm font-medium text-gray-900">{service?.name}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Time</p>
              <p className="text-sm font-medium text-gray-900">{appointment?.time}</p>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Total Amount</p>
              <p className="text-lg font-bold text-primary-600">${Number(paymentAmount).toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Enter your card information to complete payment</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isProcessing || !stripe || !elements}
            className="mt-4"
          >
            {isProcessing ? "Processing..." : `Pay $${Number(paymentAmount).toFixed(2)}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
