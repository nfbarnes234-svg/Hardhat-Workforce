import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { session } = auth;

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: session.userId, isRead: false },
  });

  return apiSuccess({ notifications, unreadCount });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { session } = auth;

  const body = await request.json();
  const { id, markAllRead } = body;

  if (markAllRead) {
    await prisma.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    });
    return apiSuccess({ message: "All notifications marked as read" });
  }

  if (!id) return apiError("Notification ID required");

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return apiSuccess({ message: "Notification marked as read" });
}
