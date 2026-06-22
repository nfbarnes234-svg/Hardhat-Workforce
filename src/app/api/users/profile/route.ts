import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { session } = auth;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      avatar: true,
      createdAt: true,
      customerProfile: true,
      workerProfile: true,
      supplierProfile: true,
    },
  });

  if (!user) return apiError("User not found", 404);
  return apiSuccess(user);
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { session } = auth;

  try {
    const body = await request.json();
    const { firstName, lastName, phone, username, password, currentPassword } = body;

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return apiError("User not found", 404);

    if (username && username.toLowerCase() !== user.username) {
      const existing = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
      });
      if (existing) return apiError("Username already taken", 409);
    }

    let passwordHash = user.passwordHash;
    if (password) {
      if (!currentPassword) return apiError("Current password required");
      const { verifyPassword } = await import("@/lib/auth");
      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) return apiError("Current password is incorrect", 400);
      passwordHash = await hashPassword(password);
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(username && { username: username.toLowerCase() }),
        ...(password && { passwordHash }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    return apiSuccess(updated);
  } catch {
    return apiError("Failed to update profile", 500);
  }
}
