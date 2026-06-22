import prisma from "@/lib/db";
import { requireAdmin, apiSuccess } from "@/lib/api-utils";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const customers = await prisma.customer.findMany({
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, isActive: true } },
      _count: { select: { projects: true } },
      projects: {
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(customers.map((c) => ({ ...c, userId: c.user.id })));
}
