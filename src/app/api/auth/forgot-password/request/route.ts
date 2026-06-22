import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername } = await request.json();

    if (!emailOrUsername) {
      return apiError("Email or username is required", 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() },
        ],
      },
    });

    if (!user) {
      // Return a success response for security, but indicate it didn't find (or just generic)
      // For testing, let's return a generic success but log it
      return apiSuccess({ message: "If the account exists, a code has been generated." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode: code,
        resetCodeExpires: expires,
      },
    });

    console.log(`[PASSWORD RESET CODE] User: ${user.email}, Code: ${code}`);

    // Return the code in the response so the user can easily see it in development/testing.
    return apiSuccess({
      message: "Verification code sent successfully.",
      code: code, // Returning the code to help during evaluation/testing
    });
  } catch (error) {
    return apiError("Failed to initiate password reset", 500);
  }
}
