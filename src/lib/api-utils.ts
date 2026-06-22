import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "./auth";
import type { UserRole } from "@prisma/client";

export const ADMIN_ROLES: UserRole[] = ["ADMIN", "SUPERADMIN"];

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export async function requireAuth(
  allowedRoles?: UserRole[]
): Promise<{ session: SessionPayload } | NextResponse> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { session };
}

export async function requireAdmin(): Promise<{ session: SessionPayload } | NextResponse> {
  return requireAuth(ADMIN_ROLES);
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
