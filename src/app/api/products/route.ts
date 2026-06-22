import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, apiError, apiSuccess } from "@/lib/api-utils";
import { parseJsonArray } from "@/lib/utils";

export async function GET() {
  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "SUPPLIER"]);
  if (auth instanceof Response) return auth;
  const { session } = auth;

  const where =
    session.role === "SUPPLIER"
      ? { supplier: { userId: session.userId } }
      : {};

  const products = await prisma.product.findMany({
    where,
    include: {
      supplier: {
        select: {
          companyName: true,
          category: true,
          user: { select: { firstName: true, lastName: true, phone: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(
    products.map((p) => ({ ...p, images: parseJsonArray<string>(p.images) }))
  );
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["SUPPLIER"]);
  if (auth instanceof Response) return auth;
  const { session } = auth;

  try {
    const body = await request.json();
    const { name, description, price, images, phone } = body;

    if (!name || price === undefined) return apiError("Name and price required");

    const supplier = await prisma.supplier.findUnique({ where: { userId: session.userId } });
    if (!supplier) return apiError("Supplier profile not found", 404);

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        images: JSON.stringify(images || []),
        phone,
        supplierId: supplier.id,
      },
    });

    return apiSuccess({ ...product, images: parseJsonArray<string>(product.images) }, 201);
  } catch {
    return apiError("Failed to create product", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(["SUPPLIER", "ADMIN", "SUPERADMIN"]);
  if (auth instanceof Response) return auth;
  const { session } = auth;

  try {
    const body = await request.json();
    const { id, name, description, price, images, phone } = body;
    if (!id) return apiError("Product ID required");

    const product = await prisma.product.findUnique({
      where: { id },
      include: { supplier: true },
    });
    if (!product) return apiError("Product not found", 404);

    if (session.role === "SUPPLIER") {
      const supplier = await prisma.supplier.findUnique({ where: { userId: session.userId } });
      if (supplier?.id !== product.supplierId) return apiError("Forbidden", 403);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(images && { images: JSON.stringify(images) }),
        ...(phone !== undefined && { phone }),
      },
    });

    return apiSuccess({ ...updated, images: parseJsonArray<string>(updated.images) });
  } catch {
    return apiError("Failed to update product", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(["SUPPLIER", "ADMIN", "SUPERADMIN"]);
  if (auth instanceof Response) return auth;
  const { session } = auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return apiError("Product ID required");

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return apiError("Product not found", 404);

  if (session.role === "SUPPLIER") {
    const supplier = await prisma.supplier.findUnique({ where: { userId: session.userId } });
    if (supplier?.id !== product.supplierId) return apiError("Forbidden", 403);
  }

  await prisma.product.delete({ where: { id } });
  return apiSuccess({ message: "Product deleted" });
}
