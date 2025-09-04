# Polar Payment Gateway Integration

This document outlines the complete Polar payment gateway integration for Storm Berry V1, including setup, configuration, and usage.

## Overview

Polar is integrated to handle Pro tier subscriptions with the following features:
- Secure checkout flow
- Customer portal for subscription management
- Webhook handling for real-time payment events
- Sandbox and production environment support

## Setup

### 1. Install Dependencies

The required dependencies are already installed:
```bash
pnpm install @polar-sh/nextjs zod
```

### 2. Environment Variables

Configure the following environment variables in your `.env.local` file:

```env
# Polar Access Token (from your Polar dashboard)
POLAR_ACCESS_TOKEN="your-polar-access-token"

# Success URL (where users are redirected after successful payment)
POLAR_SUCCESS_URL="http://localhost:3000/billing/success?checkout_id={CHECKOUT_ID}"

# Webhook Secret (for webhook verification)
POLAR_WEBHOOK_SECRET="your-webhook-secret"

# Product IDs (from your Polar dashboard)
NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID="your-pro-monthly-product-id"
NEXT_PUBLIC_POLAR_PRO_YEARLY_PRODUCT_ID="your-pro-yearly-product-id"
```

### 3. Polar Dashboard Configuration

1. Create a Polar account at [polar.sh](https://polar.sh)
2. Set up your organization and products
3. Configure webhook endpoints:
   - Webhook URL: `https://yourdomain.com/api/webhook/polar`
   - Events: Select all relevant events (checkout, order, subscription events)
4. Copy your access token and webhook secret

## API Routes

### Checkout Route (`/api/billing/checkout`)

Handles payment checkout redirections with support for:
- Product selection via query parameters
- Customer information (email, name, external ID)
- Metadata for tracking
- Sandbox/production environment switching
- Dark theme enforcement

**Usage:**
```typescript
const checkoutUrl = generateCheckoutUrl({
  products: POLAR_PRODUCTS.PRO_MONTHLY,
  customerEmail: user.email,
  customerName: user.name,
  customerExternalId: user.id,
  metadata: { source: 'settings_page' }
});
```

### Customer Portal Route (`/api/billing/portal`)

Provides access to customer subscription management:
- View active subscriptions
- Download invoices
- Update payment methods
- Cancel subscriptions

**Usage:**
```typescript
const portalUrl = generateCustomerPortalUrl();
window.open(portalUrl, '_blank');
```

### Webhook Route (`/api/webhook/polar`)

Handles real-time payment events with specific handlers for:
- `onCheckoutCreated` - Checkout session started
- `onCheckoutUpdated` - Checkout session updated
- `onOrderCreated` - Order created
- `onOrderPaid` - Payment successful
- `onSubscriptionCreated` - New subscription
- `onSubscriptionActive` - Subscription activated
- `onSubscriptionCanceled` - Subscription canceled
- `onSubscriptionRevoked` - Subscription revoked
- And more...

## Utility Functions

### `generateCheckoutUrl(params)`

Creates a properly formatted checkout URL with query parameters.

**Parameters:**
- `products` (required) - Polar product ID
- `customerId` (optional) - Existing Polar customer ID
- `customerExternalId` (optional) - Your internal user ID
- `customerEmail` (optional) - Customer email
- `customerName` (optional) - Customer name
- `metadata` (optional) - Additional tracking data

### `generateCustomerPortalUrl()`

Creates a customer portal URL for subscription management.

## Product Configuration

Products are configured in `lib/polar.ts`:

```typescript
export const POLAR_PRODUCTS = {
  PRO_MONTHLY: process.env.NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID,
  PRO_YEARLY: process.env.NEXT_PUBLIC_POLAR_PRO_YEARLY_PRODUCT_ID,
};

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    gptCalls: 5,
    ossCalls: 10,
    features: ['Basic AI access', 'Community support'],
  },
  PRO: {
    name: 'Pro',
    price: 29,
    gptCalls: 50,
    ossCalls: 50,
    features: [
      '50 GPT-5 calls per day',
      '50 OSS AI calls per day',
      'Priority support',
      'Advanced AI models access',
      'Enhanced productivity features',
    ],
  },
};
```

## User Flow

1. **Upgrade Request**: User clicks "Upgrade to Pro" in settings
2. **Checkout**: Redirected to Polar checkout with pre-filled information
3. **Payment**: User completes payment on Polar's secure checkout
4. **Webhook**: Polar sends webhook to `/api/webhook/polar`
5. **Success**: User redirected to `/billing/success` page
6. **Activation**: Subscription activated based on webhook events

## Security Features

- **Webhook Verification**: All webhooks are verified using the webhook secret
- **Environment Isolation**: Sandbox mode for testing, production for live payments
- **User Authentication**: Integration with Clerk for user identification
- **Secure Redirects**: Proper URL validation and HTTPS enforcement

## Testing

### Sandbox Mode

The integration is configured for sandbox testing by default:
```typescript
server: "sandbox" // Change to "production" for live environment
```

### Test Flow

1. Use sandbox credentials in environment variables
2. Create test products in Polar sandbox
3. Test checkout flow with test payment methods
4. Verify webhook delivery in Polar dashboard
5. Check success page and user activation

## Production Deployment

### Checklist

- [ ] Update `server` parameter to `"production"` in API routes
- [ ] Configure production environment variables
- [ ] Set up production webhook endpoints
- [ ] Test with real payment methods
- [ ] Monitor webhook delivery and error handling
- [ ] Set up proper error logging and monitoring

### Environment Variables for Production

```env
POLAR_ACCESS_TOKEN="prod_your-production-access-token"
POLAR_SUCCESS_URL="https://yourdomain.com/billing/success?checkout_id={CHECKOUT_ID}"
POLAR_WEBHOOK_SECRET="your-production-webhook-secret"
NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID="prod_monthly_product_id"
NEXT_PUBLIC_POLAR_PRO_YEARLY_PRODUCT_ID="prod_yearly_product_id"
```

## Error Handling

The integration includes comprehensive error handling:
- Webhook verification failures
- Payment processing errors
- User authentication issues
- Network connectivity problems
- Invalid product configurations

## Monitoring

Monitor the following metrics:
- Successful checkout completions
- Webhook delivery success rates
- Payment failure rates
- Subscription activation times
- Customer portal usage

## Support

For issues with the Polar integration:
1. Check Polar dashboard for webhook delivery logs
2. Verify environment variable configuration
3. Test in sandbox mode first
4. Review webhook payload structure
5. Contact Polar support for payment-specific issues

## Additional Resources

- [Polar Documentation](https://docs.polar.sh/)
- [Polar Next.js Adapter](https://docs.polar.sh/integrate/sdk/adapters/nextjs)
- [Webhook Events Reference](https://docs.polar.sh/api/webhooks)
- [Product Configuration Guide](https://docs.polar.sh/products)