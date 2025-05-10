import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Extract the payment_intent parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get('payment_intent');
    const redirectStatus = urlParams.get('redirect_status');

    if (!paymentIntentId) {
      setError('Payment information not found');
      setIsLoading(false);
      return;
    }

    const processPayment = async () => {
      try {
        const res = await apiRequest('POST', '/api/record-payment', {
          paymentIntentId,
          status: redirectStatus || 'completed'
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to record payment');
        }
        
        const data = await res.json();
        
        // Success!
        setIsSuccess(true);
        toast({
          title: 'Payment Recorded',
          description: 'Your payment has been successfully processed',
        });
      } catch (err: any) {
        console.error('Payment recording error:', err);
        setError(err.message || 'Failed to record payment');
        toast({
          title: 'Payment Error',
          description: err.message || 'There was a problem recording your payment',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    processPayment();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
          <p className="text-muted-foreground">Please wait while we process your payment...</p>
        </div>
      </div>
    );
  }

  import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "../components/ui/card";
import { AlertCircle } from "lucide-react";

if (error) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Payment Failed</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              The payment was processed by Stripe, but we encountered an issue recording it in our system.
              Please contact customer support for assistance.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={() => setLocation('/payments')} variant="outline">
              View All Payments
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="border-green-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <CardTitle>Payment Successful!</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p>Your payment has been successfully processed and recorded.</p>
          <p className="mt-4 text-sm text-muted-foreground">
            A receipt has been sent to your email address on file.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={() => setLocation('/payments')}>
            Return to Payments
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}