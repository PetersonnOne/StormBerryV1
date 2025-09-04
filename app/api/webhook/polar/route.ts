import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log("Received Polar webhook:", payload.type);
    // Handle the payload - this is a catch-all handler
  },
  
  // Specific event handlers
  onCheckoutCreated: async (payload) => {
    console.log("Checkout created:", payload.data.id);
    // Handle checkout creation
  },
  
  onCheckoutUpdated: async (payload) => {
    console.log("Checkout updated:", payload.data.id);
    // Handle checkout updates
  },
  
  onOrderCreated: async (payload) => {
    console.log("Order created:", payload.data.id);
    // Handle new order creation
  },
  
  onOrderPaid: async (payload) => {
    console.log("Order paid:", payload.data.id);
    // Handle successful payment
    // This is where you'd typically:
    // 1. Update user's subscription status in your database
    // 2. Grant access to premium features
    // 3. Send confirmation email
  },
  
  onSubscriptionCreated: async (payload) => {
    console.log("Subscription created:", payload.data.id);
    // Handle new subscription
  },
  
  onSubscriptionActive: async (payload) => {
    console.log("Subscription activated:", payload.data.id);
    // Handle subscription activation
    // Grant user access to premium features
  },
  
  onSubscriptionCanceled: async (payload) => {
    console.log("Subscription canceled:", payload.data.id);
    // Handle subscription cancellation
    // Revoke premium access or set end date
  },
  
  onSubscriptionRevoked: async (payload) => {
    console.log("Subscription revoked:", payload.data.id);
    // Handle subscription revocation
    // Immediately revoke access
  },
  
  onCustomerCreated: async (payload) => {
    console.log("Customer created:", payload.data.id);
    // Handle new customer creation
  },
  
  onBenefitGrantCreated: async (payload) => {
    console.log("Benefit grant created:", payload.data.id);
    // Handle benefit grants (e.g., premium features)
  },
  
  onBenefitGrantRevoked: async (payload) => {
    console.log("Benefit grant revoked:", payload.data.id);
    // Handle benefit revocation
  },
});