import { NextRequest } from "next/server";

import prisma from "@/lib/db";

import { requireAuth, requireAdmin, apiError, apiSuccess } from "@/lib/api-utils";



export async function GET(request: NextRequest) {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "WORKER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;



  const { searchParams } = new URL(request.url);

  const projectId = searchParams.get("projectId");



  const where: Record<string, unknown> = {};

  if (projectId) where.projectId = projectId;



  if (session.role === "WORKER") {

    const worker = await prisma.worker.findUnique({ where: { userId: session.userId } });

    if (!worker) return apiError("Worker profile not found", 404);

    where.workerId = worker.id;

  }



  const assignments = await prisma.projectAssignment.findMany({

    where,

    include: {

      project: {

        select: { title: true, location: true, status: true, serviceType: true, contractPrice: true },

      },

      worker: {

        include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },

      },

    },

    orderBy: { createdAt: "desc" },

  });



  return apiSuccess(assignments);

}



export async function POST(request: NextRequest) {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "WORKER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;



  try {

    const body = await request.json();

    const { projectId, workerId } = body;



    if (!projectId) return apiError("Project ID required");



    if (session.role === "WORKER") {

      const worker = await prisma.worker.findUnique({ where: { userId: session.userId } });

      if (!worker) return apiError("Worker profile not found", 404);

      if (worker.status !== "APPROVED") return apiError("Your account must be approved to apply", 403);



      const project = await prisma.project.findUnique({ where: { id: projectId } });

      if (!project || project.status !== "OPEN_FOR_WORKERS") {

        return apiError("This project is not open for applications", 400);

      }



      const existing = await prisma.projectAssignment.findUnique({

        where: { projectId_workerId: { projectId, workerId: worker.id } },

      });

      if (existing) return apiError("You have already applied for this project", 409);



      const assignment = await prisma.projectAssignment.create({

        data: { projectId, workerId: worker.id, status: "PENDING" },

        include: { worker: { include: { user: true } }, project: true },

      });



      const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPERADMIN"] } } });

      await prisma.notification.createMany({

        data: admins.map((admin) => ({

          userId: admin.id,

          type: "ASSIGNMENT" as const,

          title: "New Worker Application",

          message: `${assignment.worker.user.firstName} applied for "${assignment.project.title}"`,

          link: `/dashboard/admin/projects/${projectId}`,

        })),

      });



      return apiSuccess(assignment, 201);

    }



    if (!workerId) return apiError("Worker ID required");



    const assignment = await prisma.projectAssignment.create({

      data: { projectId, workerId, status: "PENDING" },

      include: {

        worker: { include: { user: true } },

        project: true,

      },

    });



    await prisma.notification.create({

      data: {

        userId: assignment.worker.userId,

        type: "ASSIGNMENT",

        title: "New Project Assignment",

        message: `You've been assigned to project: ${assignment.project.title}`,

        link: "/dashboard/worker/assignments",

      },

    });



    return apiSuccess(assignment, 201);

  } catch {

    return apiError("Failed to create assignment", 500);

  }

}



export async function PATCH(request: NextRequest) {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "WORKER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;



  try {

    const body = await request.json();

    const { id, status, progress, notes } = body;



    if (!id) return apiError("Assignment ID required");



    const assignment = await prisma.projectAssignment.findUnique({

      where: { id },

      include: { worker: true, project: true },

    });



    if (!assignment) return apiError("Assignment not found", 404);



    if (session.role === "WORKER") {

      const worker = await prisma.worker.findUnique({ where: { userId: session.userId } });

      if (worker?.id !== assignment.workerId) return apiError("Forbidden", 403);

      if (status && !["ACCEPTED", "REJECTED", "IN_PROGRESS", "COMPLETED"].includes(status)) {

        return apiError("Invalid status update");

      }

    }



    const updated = await prisma.projectAssignment.update({

      where: { id },

      data: {

        ...(status && { status, respondedAt: new Date() }),

        ...(progress !== undefined && { progress: parseInt(progress) }),

        ...(notes !== undefined && { notes }),

        ...(status === "COMPLETED" && { completedAt: new Date() }),

      },

    });



    if (status === "ASSIGNED" || status === "ACCEPTED") {

      await prisma.project.update({

        where: { id: assignment.projectId },

        data: { status: "WORKERS_ASSIGNED" },

      });

      await prisma.notification.create({

        data: {

          userId: assignment.worker.userId,

          type: "ASSIGNMENT",

          title: status === "ASSIGNED" ? "Application Approved" : "Assignment Accepted",

          message: `You are now assigned to "${assignment.project.title}"`,

          link: "/dashboard/worker/assignments",

        },

      });

    }



    if (status === "REJECTED" && session.role !== "WORKER") {

      await prisma.notification.create({

        data: {

          userId: assignment.worker.userId,

          type: "ASSIGNMENT",

          title: "Application Not Approved",

          message: `Your application for "${assignment.project.title}" was not approved.`,

          link: "/dashboard/worker/jobs",

        },

      });

    }



    if (status === "IN_PROGRESS") {

      await prisma.project.update({

        where: { id: assignment.projectId },

        data: { status: "IN_PROGRESS" },

      });

    }



    if (status === "COMPLETED") {

      await prisma.project.update({

        where: { id: assignment.projectId },

        data: { status: "COMPLETED", completedAt: new Date() },

      });



      const customer = await prisma.customer.findUnique({

        where: { id: assignment.project.customerId },

      });

      if (customer) {

        await prisma.notification.create({

          data: {

            userId: customer.userId,

            type: "PROJECT_UPDATE",

            title: "Project Completed",

            message: `Your project "${assignment.project.title}" is complete. Please submit a satisfaction survey.`,

            link: `/dashboard/customer/projects/${assignment.projectId}`,

          },

        });

      }

    }



    return apiSuccess(updated);

  } catch {

    return apiError("Failed to update assignment", 500);

  }

}



export async function DELETE(request: NextRequest) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;



  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");

  if (!id) return apiError("Assignment ID required");



  await prisma.projectAssignment.delete({ where: { id } });

  return apiSuccess({ message: "Assignment removed" });

}

