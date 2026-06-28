import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-utils";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  email: z.string().email("Invalid email"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.errors[0]?.message || "Invalid input",
        400
      );
    }

    const { token, email, newPassword } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }],
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    // Verify reset token
    if (user.resetCode !== token) {
      return apiError("Invalid or expired reset token", 400);
    }

    if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
      return apiError("Reset token has expired", 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password and clear reset code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetCode: null,
        resetCodeExpires: null,
      },
    });

    return apiSuccess({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return apiError("Request failed", 500);
  }
}
