import { NextRequest } from "next/server";

import prisma from "@/lib/db";

import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";



export async function GET(request: NextRequest) {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "CUSTOMER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;



  const { searchParams } = new URL(request.url);

  const projectId = searchParams.get("projectId");

  const partnerId = searchParams.get("partnerId");



  let where: Record<string, unknown> = {

    OR: [{ senderId: session.userId }, { receiverId: session.userId }],

    ...(projectId && { projectId }),

  };



  if (partnerId) {

    where = {

      OR: [

        { senderId: session.userId, receiverId: partnerId },

        { senderId: partnerId, receiverId: session.userId },

      ],

      ...(projectId && { projectId }),

    };

  }



  const messages = await prisma.message.findMany({

    where,

    include: {

      sender: { select: { id: true, firstName: true, lastName: true, role: true } },

      receiver: { select: { id: true, firstName: true, lastName: true, role: true } },

      project: { select: { title: true } },

    },

    orderBy: { createdAt: "asc" },

    take: 200,

  });



  await prisma.message.updateMany({

    where: { receiverId: session.userId, isRead: false },

    data: { isRead: true },

  });



  return apiSuccess(messages);

}



export async function POST(request: NextRequest) {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "CUSTOMER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;



  try {

    const body = await request.json();

    const { receiverId, projectId, subject, content, attachmentUrl, attachmentName } = body;



    if (!receiverId || !content) {

      return apiError("Receiver and content required");

    }



    const message = await prisma.message.create({

      data: {

        senderId: session.userId,

        receiverId,

        projectId: projectId || null,

        subject,

        content,

        attachmentUrl,

        attachmentName,

      },

      include: {

        sender: { select: { firstName: true, lastName: true } },

        receiver: { select: { firstName: true, lastName: true } },

      },

    });



    const receiverRole =

      session.role === "ADMIN" || session.role === "SUPERADMIN" ? "customer" : "admin";



    await prisma.notification.create({

      data: {

        userId: receiverId,

        type: "MESSAGE",

        title: subject || "New Message",

        message: content.substring(0, 100),

        link: `/dashboard/${receiverRole}/messages`,

      },

    });



    return apiSuccess(message, 201);

  } catch {

    return apiError("Failed to send message", 500);

  }

}



export async function DELETE(request: NextRequest) {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN"]);

  if (auth instanceof Response) return auth;



  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");

  if (!id) return apiError("Message ID required");



  await prisma.message.delete({ where: { id } });

  return apiSuccess({ message: "Message deleted" });

}

