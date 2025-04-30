import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

// Initialize Stripe with the secret key from environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil' // Use the latest stable API version
});

// Create a payment intent (for one-time payments)
export async function createPaymentIntent(amount: number, currency: string = 'usd', metadata: Record<string, string> = {}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert dollars to cents for Stripe
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

// Create a checkout session (alternative for simpler checkout flows)
export async function createCheckoutSession(
  lineItems: Array<{price: string; quantity: number}>,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Retrieve payment intent details
export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
}

// Capture payment for auth-only payments
export async function capturePayment(paymentIntentId: string, amountToCapture?: number) {
  try {
    const captureOptions: Stripe.PaymentIntentCaptureParams = {};
    
    if (amountToCapture) {
      captureOptions.amount_to_capture = Math.round(amountToCapture * 100);
    }
    
    return await stripe.paymentIntents.capture(paymentIntentId, captureOptions);
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw error;
  }
}

// Create a refund
export async function createRefund(paymentIntentId: string, amount?: number) {
  try {
    const refundOptions: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };
    
    if (amount) {
      refundOptions.amount = Math.round(amount * 100);
    }
    
    return await stripe.refunds.create(refundOptions);
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
}