import { NextRequest } from "next/server";

import prisma from "@/lib/db";

import { requireAuth, requireAdmin, apiError, apiSuccess } from "@/lib/api-utils";

import { parseJsonArray, generateOrderNumber } from "@/lib/utils";



export async function GET(request: NextRequest) {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "SUPPLIER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;



  try {

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");

    const projectId = searchParams.get("projectId");



    const where: Record<string, unknown> = {};

    if (status) where.status = status;

    if (projectId) where.projectId = projectId;



    if (session.role === "SUPPLIER") {

      const supplier = await prisma.supplier.findUnique({ where: { userId: session.userId } });

      if (!supplier) return apiError("Supplier profile not found", 404);

      where.supplierId = supplier.id;

    }



    const orders = await prisma.purchaseOrder.findMany({

      where,

      include: {

        project: { select: { title: true, location: true } },

        supplier: {

          select: {

            companyName: true,

            user: { select: { firstName: true, lastName: true } },

          },

        },

      },

      orderBy: { createdAt: "desc" },

    });



    return apiSuccess(

      orders.map((o) => ({

        ...o,

        items: parseJsonArray(o.items),

        receiptItems: o.receiptItems ? parseJsonArray(o.receiptItems) : null,

      }))

    );

  } catch {

    return apiError("Failed to load purchase orders", 500);

  }

}



export async function POST(request: NextRequest) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;



  try {

    const body = await request.json();

    const { projectId, supplierId, items, totalAmount, notes, deliveryDate } = body;



    if (!projectId || !supplierId || !items || !Array.isArray(items) || items.length === 0) {

      return apiError("Project ID, supplier ID, and at least one item required");

    }



    const computedTotal = items.reduce(

      (sum: number, item: { quantity: number; unitPrice: number }) =>

        sum + (parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.unitPrice)) || 0),

      0

    );



    const order = await prisma.purchaseOrder.create({

      data: {

        orderNumber: generateOrderNumber(),

        projectId,

        supplierId,

        items: JSON.stringify(items),

        totalAmount: totalAmount ? parseFloat(totalAmount) : computedTotal,

        notes,

        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,

        status: "DRAFT",

      },

    });



    return apiSuccess({ ...order, items: parseJsonArray(order.items) }, 201);

  } catch {

    return apiError("Failed to create purchase order", 500);

  }

}



export async function PATCH(request: NextRequest) {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "SUPPLIER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;



  try {

    const body = await request.json();

    const { id, status, deliveryDate, receiptItems } = body;



    if (!id) return apiError("Order ID required");



    const order = await prisma.purchaseOrder.findUnique({ where: { id } });

    if (!order) return apiError("Order not found", 404);



    if (session.role === "SUPPLIER") {

      const supplier = await prisma.supplier.findUnique({ where: { userId: session.userId } });

      if (order.supplierId !== supplier?.id) return apiError("Forbidden", 403);



      if (receiptItems) {

        const updated = await prisma.purchaseOrder.update({

          where: { id },

          data: {

            receiptItems: JSON.stringify(receiptItems),

            receiptSubmitted: true,

          },

        });



        const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPERADMIN"] } } });

        await prisma.notification.createMany({

          data: admins.map((admin) => ({

            userId: admin.id,

            type: "ORDER" as const,

            title: "Receipt Submitted",

            message: `Supplier submitted receipt for order ${order.orderNumber}`,

            link: "/dashboard/admin/orders",

          })),

        });



        return apiSuccess({ ...updated, items: parseJsonArray(updated.items), receiptItems: parseJsonArray(updated.receiptItems!) });

      }



      if (!status) return apiError("Status required");

    } else if (!status && receiptItems === undefined) {

      return apiError("Status or receipt verification required");

    }



    const updateData: Record<string, unknown> = {};

    if (status) updateData.status = status;

    if (deliveryDate) updateData.deliveryDate = new Date(deliveryDate);

    if (status === "DELIVERED") updateData.deliveredAt = new Date();



    if (session.role !== "SUPPLIER" && body.receiptVerified !== undefined) {

      updateData.receiptVerified = Boolean(body.receiptVerified);

    }



    const updated = await prisma.purchaseOrder.update({

      where: { id },

      data: updateData,

    });



    if (status === "SENT") {

      const supplier = await prisma.supplier.findUnique({ where: { id: updated.supplierId } });

      if (supplier) {

        await prisma.notification.create({

          data: {

            userId: supplier.userId,

            type: "ORDER",

            title: "New Purchase Order",

            message: `Purchase order ${updated.orderNumber} received`,

            link: "/dashboard/supplier/orders",

          },

        });

      }

    }



    if (status === "DELIVERED") {

      await prisma.project.update({

        where: { id: updated.projectId },

        data: { status: "MATERIALS_ORDERED" },

      });

    }



    return apiSuccess({

      ...updated,

      items: parseJsonArray(updated.items),

      receiptItems: updated.receiptItems ? parseJsonArray(updated.receiptItems) : null,

    });

  } catch {

    return apiError("Failed to update purchase order", 500);

  }

}



export async function DELETE(request: NextRequest) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;



  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");

  if (!id) return apiError("Order ID required");



  await prisma.purchaseOrder.delete({ where: { id } });

  return apiSuccess({ message: "Order deleted" });

}

