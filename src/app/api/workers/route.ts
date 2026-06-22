import { NextRequest } from "next/server";

import prisma from "@/lib/db";

import { requireAuth, requireAdmin, apiError, apiSuccess } from "@/lib/api-utils";

import { hashPassword } from "@/lib/auth";

import { parseJsonArray } from "@/lib/utils";



export async function GET(request: NextRequest) {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "WORKER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;



  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");

  const search = searchParams.get("search");



  const where: Record<string, unknown> = {};

  if (session.role === "WORKER") {

    where.userId = session.userId;

  }

  if (status) where.status = status;

  if (search) {

    where.user = {

      OR: [

        { firstName: { contains: search } },

        { lastName: { contains: search } },

        { email: { contains: search } },

      ],

    };

  }



  const workers = await prisma.worker.findMany({

    where,

    include: {

      user: {

        select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, username: true, isActive: true },

      },

      assignments: {

        include: { project: { select: { title: true, status: true } } },

      },

    },

    orderBy: { createdAt: "desc" },

  });



  return apiSuccess(

    workers.map((w) => ({

      ...w,

      skills: parseJsonArray<string>(w.skills),

      certifications: parseJsonArray<string>(w.certifications),

    }))

  );

}



export async function POST(request: NextRequest) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;



  try {

    const body = await request.json();

    const { email, username, password, firstName, lastName, phone, bio, skills } = body;



    if (!email || !username || !password || !firstName || !lastName || !phone) {

      return apiError("All required fields must be provided");

    }



    const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (existingEmail) return apiError("Email already registered", 409);



    const existingUsername = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });

    if (existingUsername) return apiError("Username already registered", 409);



    const user = await prisma.user.create({

      data: {

        email: email.toLowerCase(),

        username: username.toLowerCase(),

        passwordHash: await hashPassword(password),

        role: "WORKER",

        firstName,

        lastName,

        phone,

        workerProfile: {

          create: {

            bio,

            skills: JSON.stringify(skills || []),

            status: "APPROVED",

          },

        },

      },

    });



    const worker = await prisma.worker.findUnique({

      where: { userId: user.id },

      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },

    });



    return apiSuccess(worker, 201);

  } catch {

    return apiError("Failed to create worker", 500);

  }

}



export async function PATCH(request: NextRequest) {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "WORKER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;



  try {

    const body = await request.json();

    const { id, status, bio, skills, experience, hourlyRate, availability } = body;



    if (session.role === "WORKER") {

      const worker = await prisma.worker.findUnique({ where: { userId: session.userId } });

      if (!worker || worker.id !== id) return apiError("Forbidden", 403);



      const updated = await prisma.worker.update({

        where: { id },

        data: {

          ...(bio !== undefined && { bio }),

          ...(skills && { skills: JSON.stringify(skills) }),

          ...(experience !== undefined && { experience: parseInt(experience) }),

          ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),

          ...(availability && { availability }),

        },

        include: { user: { select: { firstName: true, lastName: true, email: true } } },

      });



      return apiSuccess({

        ...updated,

        skills: parseJsonArray<string>(updated.skills),

      });

    }



    if (!id || !status) return apiError("Worker ID and status required");



    const updated = await prisma.worker.update({

      where: { id },

      data: { status },

      include: { user: true },

    });



    await prisma.notification.create({

      data: {

        userId: updated.userId,

        type: "SYSTEM",

        title: status === "APPROVED" ? "Account Approved" : "Account Status Updated",

        message:

          status === "APPROVED"

            ? "Your worker account has been approved. You can now view and accept projects."

            : `Your account status has been updated to ${status}`,

        link: "/dashboard/worker",

      },

    });



    return apiSuccess(updated);

  } catch {

    return apiError("Failed to update worker", 500);

  }

}



export async function DELETE(request: NextRequest) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;



  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");

  if (!id) return apiError("Worker ID required");



  const worker = await prisma.worker.findUnique({ where: { id } });

  if (!worker) return apiError("Worker not found", 404);



  await prisma.user.delete({ where: { id: worker.userId } });

  return apiSuccess({ message: "Worker removed" });

}

