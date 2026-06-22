import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, code } = await request.json();

    if (!emailOrUsername || !code) {
      return apiError("Email/username and code are required", 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() },
        ],
        resetCode: code,
        resetCodeExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return apiError("Invalid or expired verification code", 400);
    }

    return apiSuccess({ message: "Code verified successfully.", userId: user.id });
  } catch (error) {
    return apiError("Failed to verify reset code", 500);
  }
}
