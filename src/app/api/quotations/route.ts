import { NextRequest } from "next/server";

import prisma from "@/lib/db";

import { requireAuth, requireAdmin, apiError, apiSuccess } from "@/lib/api-utils";



export async function GET(request: NextRequest) {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "CUSTOMER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;



  const { searchParams } = new URL(request.url);

  const projectId = searchParams.get("projectId");



  let where: Record<string, unknown> = projectId ? { projectId } : {};



  if (session.role === "CUSTOMER") {

    const customer = await prisma.customer.findUnique({ where: { userId: session.userId } });

    if (!customer) return apiError("Customer profile not found", 404);

    where = {

      ...where,

      project: { customerId: customer.id },

    };

  }



  const quotations = await prisma.quotation.findMany({

    where,

    include: {

      project: {

        select: { title: true, customerId: true, customer: { select: { userId: true } } },

      },

    },

    orderBy: { createdAt: "desc" },

  });



  return apiSuccess(quotations);

}



export async function POST(request: NextRequest) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;



  try {

    const body = await request.json();

    const { projectId, laborCost, materialCost, otherCosts, notes, validUntil } = body;



    if (!projectId) return apiError("Project ID required");



    const totalAmount =

      (parseFloat(laborCost) || 0) +

      (parseFloat(materialCost) || 0) +

      (parseFloat(otherCosts) || 0);



    const quotation = await prisma.quotation.create({

      data: {

        projectId,

        laborCost: parseFloat(laborCost) || 0,

        materialCost: parseFloat(materialCost) || 0,

        otherCosts: parseFloat(otherCosts) || 0,

        totalAmount,

        notes,

        validUntil: validUntil ? new Date(validUntil) : null,

        status: "DRAFT",

      },

    });



    return apiSuccess(quotation, 201);

  } catch {

    return apiError("Failed to create quotation", 500);

  }

}



export async function PATCH(request: NextRequest) {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "CUSTOMER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;



  try {

    const body = await request.json();

    const { id, status } = body;



    if (!id || !status) return apiError("Quotation ID and status required");



    const quotation = await prisma.quotation.findUnique({

      where: { id },

      include: { project: { include: { customer: true } } },

    });



    if (!quotation) return apiError("Quotation not found", 404);



    if (session.role === "CUSTOMER") {

      const customer = await prisma.customer.findUnique({ where: { userId: session.userId } });

      if (customer?.id !== quotation.project.customerId) {

        return apiError("Forbidden", 403);

      }

      if (!["APPROVED", "REJECTED"].includes(status)) {

        return apiError("Customers can only approve or reject quotations");

      }

    }



    const updated = await prisma.quotation.update({

      where: { id },

      data: {

        status,

        ...(status === "SENT" && { sentAt: new Date() }),

        ...(status === "APPROVED" || status === "REJECTED"

          ? { respondedAt: new Date() }

          : {}),

      },

    });



    if (status === "SENT") {

      await prisma.project.update({

        where: { id: quotation.projectId },

        data: { status: "QUOTATION_SENT" },

      });

      await prisma.notification.create({

        data: {

          userId: quotation.project.customer.userId,

          type: "QUOTATION",

          title: "New Quotation Received",

          message: `Quotation for "${quotation.project.title}" is ready for review`,

          link: `/dashboard/customer/projects/${quotation.projectId}`,

        },

      });

    }



    if (status === "APPROVED") {

      await prisma.project.update({

        where: { id: quotation.projectId },

        data: { status: "OPEN_FOR_WORKERS", contractPrice: updated.totalAmount },

      });

    }



    if (status === "REJECTED") {

      await prisma.project.update({

        where: { id: quotation.projectId },

        data: { status: "ARCHIVED" },

      });

      await prisma.notification.create({

        data: {

          userId: quotation.project.customer.userId,

          type: "PROJECT_UPDATE",

          title: "Project Archived",

          message: `Your project "${quotation.project.title}" has been archived after quotation rejection.`,

          link: `/dashboard/customer/projects/${quotation.projectId}`,

        },

      });

    }



    return apiSuccess(updated);

  } catch {

    return apiError("Failed to update quotation", 500);

  }

}



export async function DELETE(request: NextRequest) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;



  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");

  if (!id) return apiError("Quotation ID required");



  await prisma.quotation.delete({ where: { id } });

  return apiSuccess({ message: "Quotation deleted" });

}

