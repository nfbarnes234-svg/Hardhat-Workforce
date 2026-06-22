import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, apiError, apiSuccess, ADMIN_ROLES } from "@/lib/api-utils";
import { parseJsonArray } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "CUSTOMER", "WORKER"]);
  if (auth instanceof Response) return auth;
  const { session } = auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const serviceType = searchParams.get("serviceType");

  const where: Record<string, unknown> = {};

  if (session.role === "CUSTOMER") {
    const customer = await prisma.customer.findUnique({
      where: { userId: session.userId },
    });
    if (!customer) return apiError("Customer profile not found", 404);
    where.customerId = customer.id;
  }

  if (session.role === "WORKER") {
    where.status = {
      in: ["OPEN_FOR_WORKERS", "WORKERS_ASSIGNED", "IN_PROGRESS"],
    };
  }

  if (status) where.status = status;
  if (serviceType) where.serviceType = serviceType;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { location: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      customer: {
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      },
      quotations: { orderBy: { createdAt: "desc" }, take: 1 },
      assignments: {
        include: {
          worker: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      },
      _count: { select: { surveys: true, messages: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(
    projects.map((p) => ({
      ...p,
      images: parseJsonArray<string>(p.images),
    }))
  );
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "CUSTOMER"]);
  if (auth instanceof Response) return auth;
  const { session } = auth;

  try {
    const body = await request.json();
    const { title, description, location, serviceType, contractPrice, images, customerId } = body;

    if (!title || !description || !location || !serviceType) {
      return apiError("Missing required fields");
    }

    let resolvedCustomerId = customerId;

    if (session.role === "CUSTOMER") {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.userId },
      });
      if (!customer) return apiError("Customer profile not found", 404);
      resolvedCustomerId = customer.id;
    }

    if (!resolvedCustomerId) {
      return apiError("Customer ID required");
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        location,
        serviceType,
        contractPrice: contractPrice ? parseFloat(contractPrice) : null,
        images: JSON.stringify(images || []),
        customerId: resolvedCustomerId,
        createdById: session.userId,
        status: session.role === "CUSTOMER" ? "REQUEST_SUBMITTED" : "UNDER_REVIEW",
      },
      include: {
        customer: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
      },
    });

    const admins = await prisma.user.findMany({ where: { role: { in: ADMIN_ROLES } } });
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: "PROJECT_UPDATE" as const,
        title: "New Service Request",
        message: `New project request: ${title}`,
        link: `/dashboard/admin/projects/${project.id}`,
      })),
    });

    return apiSuccess({ ...project, images: parseJsonArray<string>(project.images) }, 201);
  } catch {
    return apiError("Failed to create project", 500);
  }
}
