import { NextRequest } from "next/server";

import prisma from "@/lib/db";

import { requireAuth, requireAdmin, apiError, apiSuccess } from "@/lib/api-utils";

import { hashPassword } from "@/lib/auth";

import { parseJsonArray } from "@/lib/utils";



export async function GET() {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "SUPPLIER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;



  const suppliers = await prisma.supplier.findMany({

    where: session.role === "SUPPLIER" ? { userId: session.userId } : undefined,

    include: {

      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, username: true, isActive: true } },

      _count: { select: { purchaseOrders: true, materials: true, products: true } },

    },

    orderBy: { createdAt: "desc" },

  });



  return apiSuccess(

    suppliers.map((s) => ({

      ...s,

      specialties: parseJsonArray<string>(s.specialties),

    }))

  );

}



export async function POST(request: NextRequest) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;



  try {

    const body = await request.json();

    const { email, username, password, firstName, lastName, phone, companyName, address, city, postcode, category } = body;



    if (!email || !username || !password || !firstName || !lastName || !phone || !companyName) {

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

        role: "SUPPLIER",

        firstName,

        lastName,

        phone,

        supplierProfile: {

          create: {

            companyName,

            address,

            city,

            postcode,

            category: category || "Other Categories",

          },

        },

      },

    });



    const supplier = await prisma.supplier.findUnique({

      where: { userId: user.id },

      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },

    });



    return apiSuccess(supplier, 201);

  } catch {

    return apiError("Failed to create supplier", 500);

  }

}



export async function PATCH(request: NextRequest) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;



  try {

    const body = await request.json();

    const { id, companyName, category, address, city, postcode } = body;

    if (!id) return apiError("Supplier ID required");



    const updated = await prisma.supplier.update({

      where: { id },

      data: {

        ...(companyName && { companyName }),

        ...(category && { category }),

        ...(address !== undefined && { address }),

        ...(city !== undefined && { city }),

        ...(postcode !== undefined && { postcode }),

      },

    });



    return apiSuccess(updated);

  } catch {

    return apiError("Failed to update supplier", 500);

  }

}



export async function DELETE(request: NextRequest) {

  const auth = await requireAdmin();

  if (auth instanceof Response) return auth;



  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");

  if (!id) return apiError("Supplier ID required");



  const supplier = await prisma.supplier.findUnique({ where: { id } });

  if (!supplier) return apiError("Supplier not found", 404);



  await prisma.user.delete({ where: { id: supplier.userId } });

  return apiSuccess({ message: "Supplier removed" });

}

