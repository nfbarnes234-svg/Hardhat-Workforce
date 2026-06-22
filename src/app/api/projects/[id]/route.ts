import { NextRequest } from "next/server";

import prisma from "@/lib/db";

import { requireAuth, requireAdmin, apiError, apiSuccess } from "@/lib/api-utils";

import { parseJsonArray } from "@/lib/utils";



type RouteParams = { params: Promise<{ id: string }> };



export async function GET(_request: NextRequest, { params }: RouteParams) {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "CUSTOMER", "WORKER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;

  const { id } = await params;



  const project = await prisma.project.findUnique({

    where: { id },

    include: {

      customer: {

        include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },

      },

      surveys: true,

      quotations: { orderBy: { createdAt: "desc" } },

      assignments: {

        include: {

          worker: {

            include: { user: { select: { firstName: true, lastName: true, email: true } } },

          },

        },

      },

      orders: {

        include: { supplier: { include: { user: { select: { firstName: true, lastName: true } } } } },

      },

      materials: true,

      satisfactionSurvey: true,

    },

  });



  if (!project) return apiError("Project not found", 404);



  if (session.role === "CUSTOMER") {

    const customer = await prisma.customer.findUnique({ where: { userId: session.userId } });

    if (customer?.id !== project.customerId) {

      return apiError("Forbidden", 403);

    }

  }



  return apiSuccess({

    ...project,

    images: parseJsonArray<string>(project.images),

    surveys: project.surveys.map((s) => ({

      ...s,

      photos: parseJsonArray<string>(s.photos),

    })),

  });

}



export async function PATCH(request: NextRequest, { params }: RouteParams) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;

  const { id } = await params;



  try {

    const body = await request.json();

    const { title, description, location, serviceType, status, contractPrice, images, startDate, endDate } = body;



    const project = await prisma.project.update({

      where: { id },

      data: {

        ...(title && { title }),

        ...(description && { description }),

        ...(location && { location }),

        ...(serviceType && { serviceType }),

        ...(status && { status }),

        ...(contractPrice !== undefined && { contractPrice: parseFloat(contractPrice) }),

        ...(images && { images: JSON.stringify(images) }),

        ...(startDate && { startDate: new Date(startDate) }),

        ...(endDate && { endDate: new Date(endDate) }),

        ...(status === "COMPLETED" && { completedAt: new Date() }),

      },

    });



    if (status) {

      const customer = await prisma.customer.findUnique({

        where: { id: project.customerId },

      });

      if (customer) {

        const isCompleted = status === "COMPLETED";

        await prisma.notification.create({

          data: {

            userId: customer.userId,

            type: "PROJECT_UPDATE",

            title: isCompleted ? "Project Completed" : "Project Status Updated",

            message: isCompleted

              ? `Your project "${project.title}" is complete. Please submit a satisfaction survey.`

              : `Your project "${project.title}" status changed to ${status.replace(/_/g, " ")}`,

            link: `/dashboard/customer/projects/${project.id}`,

          },

        });

      }

    }



    return apiSuccess({ ...project, images: parseJsonArray<string>(project.images) });

  } catch {

    return apiError("Failed to update project", 500);

  }

}



export async function DELETE(_request: NextRequest, { params }: RouteParams) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;

  const { id } = await params;



  await prisma.project.delete({ where: { id } });

  return apiSuccess({ message: "Project deleted" });

}

