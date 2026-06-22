import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const auth = await requireAuth(["SUPERADMIN"]);
  if (auth instanceof Response) return auth;

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(admins);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["SUPERADMIN"]);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const { email, username, password, firstName, lastName, phone } = body;

    if (!email || !username || !password || !firstName || !lastName || !phone) {
      return apiError("All fields are required");
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingEmail) return apiError("Email already registered", 409);

    const existingUsername = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    if (existingUsername) return apiError("Username already registered", 409);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash: await hashPassword(password),
        role: "ADMIN",
        firstName,
        lastName,
        phone,
      },
    });

    return apiSuccess(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      201
    );
  } catch {
    return apiError("Failed to create admin", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(["SUPERADMIN"]);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id) return apiError("Admin ID required");

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.role === "SUPERADMIN") {
      return apiError("Cannot modify this account", 403);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { ...(isActive !== undefined && { isActive }) },
    });

    return apiSuccess(updated);
  } catch {
    return apiError("Failed to update admin", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(["SUPERADMIN"]);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return apiError("Admin ID required");

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role === "SUPERADMIN") {
    return apiError("Cannot delete this account", 403);
  }

  await prisma.user.delete({ where: { id } });
  return apiSuccess({ message: "Admin deleted" });
}
