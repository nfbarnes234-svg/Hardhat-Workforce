import prisma from "@/lib/db";
import { requireAuth, apiSuccess } from "@/lib/api-utils";
import { ADMIN_ROLES } from "@/lib/api-utils";

export async function GET() {
  const auth = await requireAuth(["CUSTOMER"]);
  if (auth instanceof Response) return auth;

  const admin = await prisma.user.findFirst({
    where: { role: { in: ADMIN_ROLES } },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  return apiSuccess(admin || {});
}
