import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, code, newPassword } = await request.json();

    if (!emailOrUsername || !code || !newPassword) {
      return apiError("Email/username, code, and new password are required", 400);
    }

    if (newPassword.length < 6) {
      return apiError("Password must be at least 6 characters long", 400);
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
      return apiError("Invalid request or code expired", 400);
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetCode: null,
        resetCodeExpires: null,
      },
    });

    return apiSuccess({ message: "Password has been reset successfully." });
  } catch (error) {
    return apiError("Failed to reset password", 500);
  }
}
