import { NextRequest } from "next/server";

import prisma from "@/lib/db";

import { requireAdmin, apiError, apiSuccess } from "@/lib/api-utils";

import { parseJsonArray } from "@/lib/utils";



export async function GET(request: NextRequest) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;



  const { searchParams } = new URL(request.url);

  const projectId = searchParams.get("projectId");



  const surveys = await prisma.survey.findMany({

    where: projectId ? { projectId } : undefined,

    include: {

      project: { select: { title: true, location: true } },

    },

    orderBy: { surveyDate: "desc" },

  });



  return apiSuccess(

    surveys.map((s) => ({ ...s, photos: parseJsonArray<string>(s.photos) }))

  );

}



export async function POST(request: NextRequest) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;



  try {

    const body = await request.json();

    const { projectId, surveyDate, notes, requirements, photos, conductedBy } = body;



    if (!projectId || !surveyDate) {

      return apiError("Project ID and survey date required");

    }



    const survey = await prisma.survey.create({

      data: {

        projectId,

        surveyDate: new Date(surveyDate),

        notes,

        requirements,

        photos: JSON.stringify(photos || []),

        conductedBy,

      },

    });



    await prisma.project.update({

      where: { id: projectId },

      data: { status: "SURVEY_COMPLETED" },

    });



    return apiSuccess({ ...survey, photos: parseJsonArray<string>(survey.photos) }, 201);

  } catch {

    return apiError("Failed to create survey", 500);

  }

}

