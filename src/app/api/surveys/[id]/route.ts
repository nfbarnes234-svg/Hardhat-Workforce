import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin, apiError, apiSuccess } from "@/lib/api-utils";
import { parseJsonArray } from "@/lib/utils";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const { id } = await params;

  try {
    const body = await request.json();
    const { surveyDate, notes, requirements, photos, conductedBy } = body;

    const survey = await prisma.survey.update({
      where: { id },
      data: {
        ...(surveyDate && { surveyDate: new Date(surveyDate) }),
        ...(notes !== undefined && { notes }),
        ...(requirements !== undefined && { requirements }),
        ...(photos && { photos: JSON.stringify(photos) }),
        ...(conductedBy !== undefined && { conductedBy }),
      },
    });

    return apiSuccess({ ...survey, photos: parseJsonArray<string>(survey.photos) });
  } catch {
    return apiError("Failed to update survey", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const { id } = await params;

  await prisma.survey.delete({ where: { id } });
  return apiSuccess({ message: "Survey deleted" });
}
