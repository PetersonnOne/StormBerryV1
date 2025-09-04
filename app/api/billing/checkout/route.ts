import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: process.env.POLAR_SUCCESS_URL!,
  server: "sandbox", // Use sandbox for testing - change to 'production' for live environment
  theme: "dark" // Enforces dark theme - omit for system-preferred theme
});