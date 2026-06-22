import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import {
  createToken,
  setSessionCookie,
  verifyPassword,
  getDashboardPath,
} from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-utils";

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(["SUPERADMIN", "ADMIN", "CUSTOMER", "WORKER", "SUPPLIER"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Invalid credentials", 400);
    }

    const { email, password, role } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: email.toLowerCase() },
        ],
      },
    });

    const roleMatches =
      role === "ADMIN"
        ? user?.role === "ADMIN" || user?.role === "SUPERADMIN"
        : user?.role === role;

    if (!user || !roleMatches) {
      return apiError("Invalid email/username or password", 401);
    }

    if (!user.isActive) {
      return apiError("Account is deactivated", 403);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return apiError("Invalid email/username or password", 401);
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    await setSessionCookie(token);

    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      redirectTo: getDashboardPath(user.role),
    });
  } catch {
    return apiError("Login failed", 500);
  }
}
