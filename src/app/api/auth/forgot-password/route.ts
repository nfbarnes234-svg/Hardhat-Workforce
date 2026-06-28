import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { sendEmail, generatePasswordResetEmailHTML } from "@/lib/email-service";
import { sendSMS, generateSMSResetCode, generateSMSMessage } from "@/lib/sms-service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
  method: z.enum(["email", "sms"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Invalid email or method", 400);
    }

    const { email, method } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }],
      },
    });

    if (!user) {
      // Don't reveal if user exists
      return apiSuccess({ message: "If an account exists, a reset link will be sent" });
    }

    // Generate reset token
    const resetCode = generateSMSResetCode();
    const resetCodeExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset code in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode,
        resetCodeExpires,
      },
    });

    if (method === "email") {
      // Send email reset link
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetCode}&email=${encodeURIComponent(email)}`;
      const emailHTML = generatePasswordResetEmailHTML(resetLink, user.firstName);

      const emailSent = await sendEmail({
        to: user.email,
        subject: "Password Reset Request - Hardhat Workforce",
        html: emailHTML,
        text: `Click here to reset your password: ${resetLink}`,
      });

      if (!emailSent) {
        return apiError("Failed to send reset email", 500);
      }

      return apiSuccess({
        message: "Password reset email sent",
        method: "email",
      });
    } else if (method === "sms") {
      // Validate phone number exists
      if (!user.phone) {
        return apiError("No phone number on file", 400);
      }

      // Send SMS reset code
      const smsMessage = generateSMSMessage(resetCode);
      const smsSent = await sendSMS({
        phoneNumber: user.phone,
        message: smsMessage,
      });

      if (!smsSent) {
        return apiError("Failed to send reset code", 500);
      }

      return apiSuccess({
        message: "Password reset code sent via SMS",
        method: "sms",
      });
    }

    return apiError("Invalid reset method", 400);
  } catch (error) {
    console.error("Forgot password error:", error);
    return apiError("Request failed", 500);
  }
}
