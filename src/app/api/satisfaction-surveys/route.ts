import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, requireAdmin, apiError, apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const published = searchParams.get("published");

  if (published === "true") {
    const surveys = await prisma.satisfactionSurvey.findMany({
      where: { published: true },
      include: {
        project: {
          include: {
            customer: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(
      surveys.map((s) => ({
        name: `${s.project.customer.user.firstName} ${s.project.customer.user.lastName}`,
        role: s.project.customer.company || "Customer",
        text: s.feedback,
        rating: s.rating,
      }))
    );
  }

  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const surveys = await prisma.satisfactionSurvey.findMany({
    include: {
      project: {
        select: { title: true, customer: { include: { user: { select: { firstName: true, lastName: true } } } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(surveys);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["CUSTOMER"]);
  if (auth instanceof Response) return auth;
  const { session } = auth;

  try {
    const body = await request.json();
    const { projectId, rating, feedback } = body;

    if (!projectId || !rating || !feedback) {
      return apiError("Project ID, rating, and feedback required");
    }

    const customer = await prisma.customer.findUnique({ where: { userId: session.userId } });
    if (!customer) return apiError("Customer profile not found", 404);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.customerId !== customer.id) {
      return apiError("Forbidden", 403);
    }
    if (project.status !== "COMPLETED") {
      return apiError("Survey only available for completed projects");
    }

    const existing = await prisma.satisfactionSurvey.findUnique({ where: { projectId } });
    if (existing) return apiError("Survey already submitted for this project", 409);

    const survey = await prisma.satisfactionSurvey.create({
      data: { projectId, rating: parseInt(rating), feedback },
    });

    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
    });
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: "SYSTEM" as const,
        title: "New Satisfaction Survey",
        message: `Customer submitted feedback for "${project.title}"`,
        link: "/dashboard/admin/testimonials",
      })),
    });

    return apiSuccess(survey, 201);
  } catch {
    return apiError("Failed to submit survey", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const { id, published } = body;

    if (!id || published === undefined) {
      return apiError("Survey ID and published status required");
    }

    const updated = await prisma.satisfactionSurvey.update({
      where: { id },
      data: { published: Boolean(published) },
    });

    return apiSuccess(updated);
  } catch {
    return apiError("Failed to update survey", 500);
  }
}
