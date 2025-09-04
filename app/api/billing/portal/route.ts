import { CustomerPortal } from "@polar-sh/nextjs";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getCustomerId: async (req: NextRequest) => {
    // Get the authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Return the Clerk user ID as the customer ID
    // In a production app, you might want to map this to a Polar customer ID
    return userId;
  },
  server: "sandbox", // Use sandbox for testing - change to 'production' for live environment
});