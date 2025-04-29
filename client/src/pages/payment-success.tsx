import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from 'wouter';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check the status of the payment
    const query = new URLSearchParams(window.location.search);
    const paymentIntent = query.get('payment_intent');
    const paymentIntentClientSecret = query.get('payment_intent_client_secret');
    const redirectStatus = query.get('redirect_status');

    setPaymentIntentId(paymentIntent);

    if (redirectStatus === 'succeeded' && paymentIntent && paymentIntentClientSecret) {
      // Record the payment in our system
      apiRequest('POST', '/api/record-payment', {
        paymentIntentId: paymentIntent,
        status: 'completed'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to record payment');
          }
          return response.json();
        })
        .then(() => {
          setStatus('success');
        })
        .catch(error => {
          console.error('Error recording payment:', error);
          toast({
            title: 'Payment Recorded',
            description: 'Payment was successful, but we had trouble updating our records. Please contact support.',
            variant: 'destructive',
          });
          setStatus('error');
        });
    } else if (redirectStatus === 'failed') {
      setStatus('error');
    } else {
      // Unexpected state
      setStatus('error');
    }
  }, [toast]);

  if (status === 'loading') {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Processing payment</CardTitle>
            <CardDescription>
              Please wait while we confirm your payment...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Verifying transaction</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Payment Unsuccessful
            </CardTitle>
            <CardDescription>
              We encountered an issue with your payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Your payment could not be processed. Please try again or contact support if the problem persists.</p>
            <p className="text-sm text-muted-foreground">
              {paymentIntentId && (
                <span className="block mt-2">Payment Reference: {paymentIntentId}</span>
              )}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={() => window.history.back()} 
              className="w-full"
              variant="outline"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => setLocation('/dashboard')}
              className="w-full"
            >
              Return to Dashboard
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
          <CardTitle className="flex items-center text-green-600">
            <Check className="mr-2 h-5 w-5" />
            Payment Successful
          </CardTitle>
          <CardDescription>
            Thank you for your payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Your payment has been processed successfully.</p>
          <p className="text-sm text-muted-foreground">
            {paymentIntentId && (
              <span className="block mt-2">Payment Reference: {paymentIntentId}</span>
            )}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => setLocation('/dashboard')}
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}