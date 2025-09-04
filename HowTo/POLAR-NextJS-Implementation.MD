
Polar Docs: https://docs.polar.sh/integrate/sdk/adapters/nextjs

1. Install Dependencies
pnpm add @polar-sh/nextjs

2. Add Environment Variables

# .env
POLAR_ACCESS_TOKEN=XXX
POLAR_SUCCESS_URL=https://my-app.com/success?checkout_id={CHECKOUT_ID}

3. Integrate the Checkout
import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl: process.env.POLAR_SUCCESS_URL
});