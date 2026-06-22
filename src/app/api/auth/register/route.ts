import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import {
  hashPassword,
  createToken,
  setSessionCookie,
  getDashboardPath,
} from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-utils";

import { getSession } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1, "Phone number is required"),
  role: z.enum(["SUPERADMIN", "ADMIN", "CUSTOMER", "WORKER", "SUPPLIER"]),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  companyName: z.string().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  passportPhoto: z.string().optional(),
  faceImage: z.string().optional(),
  category: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || "Invalid input", 400);
    }

    const data = parsed.data;
    const session = await getSession();
    const isAdminCreated =
      data.role === "ADMIN" ||
      data.role === "SUPERADMIN" ||
      data.role === "SUPPLIER";

    // Check permissions for creation
    if (data.role === "ADMIN" || data.role === "SUPERADMIN") {
      if (!session || session.role !== "SUPERADMIN") {
        return apiError("Only Super Admins can register Admin accounts", 403);
      }
    }

    if (data.role === "SUPPLIER") {
      if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
        return apiError("Only Admins and Super Admins can register Supplier accounts", 403);
      }
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingEmail) {
      return apiError("Email already registered", 409);
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username.toLowerCase() },
    });

    if (existingUsername) {
      return apiError("Username already registered", 409);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        passwordHash,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        ...(data.role === "CUSTOMER" && {
          customerProfile: {
            create: {
              company: data.company,
              address: data.address,
              city: data.city,
              postcode: data.postcode,
            },
          },
        }),
        ...(data.role === "WORKER" && {
          workerProfile: {
            create: {
              bio: data.bio,
              skills: JSON.stringify(data.skills || []),
              status: "PENDING",
              passportPhoto: data.passportPhoto || null,
              faceImage: data.faceImage || null,
            },
          },
        }),
        ...(data.role === "SUPPLIER" && {
          supplierProfile: {
            create: {
              companyName: data.companyName || `${data.firstName} ${data.lastName}`,
              address: data.address,
              city: data.city,
              postcode: data.postcode,
              category: data.category || "Other Categories",
            },
          },
        }),
      },
    });

    if (isAdminCreated) {
      return apiSuccess(
        {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
        201
      );
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    await setSessionCookie(token);

    return apiSuccess(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        redirectTo: getDashboardPath(user.role),
      },
      201
    );
  } catch {
    return apiError("Registration failed", 500);
  }
}
