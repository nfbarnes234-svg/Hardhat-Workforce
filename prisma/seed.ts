import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing satisfaction surveys, products, projects, messages, etc.
  await prisma.satisfactionSurvey.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.projectAssignment.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.survey.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.worker.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Super Admin
  const superAdminPassword = await hashPassword("admin123");
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@hardhatworkforce.com",
      username: "superadmin",
      passwordHash: superAdminPassword,
      role: "SUPERADMIN",
      firstName: "Super",
      lastName: "Admin",
      phone: "+233 53 892 5316",
    },
  });

  // 2. Demo Customer (staff admin removed — Super Admin manages admins)
  const customerPassword = await hashPassword("customer123");
  const customerUser = await prisma.user.create({
    data: {
      email: "customer@example.com",
      username: "customer",
      passwordHash: customerPassword,
      role: "CUSTOMER",
      firstName: "John",
      lastName: "Smith",
      phone: "+233 24 123 4567",
      customerProfile: {
        create: {
          company: "Smith Properties Ltd",
          address: "42 Construction Lane",
          city: "Accra",
          postcode: "GA-123-4567",
        },
      },
    },
    include: { customerProfile: true },
  });

  // 4. Worker
  const workerPassword = await hashPassword("worker123");
  const workerUser = await prisma.user.create({
    data: {
      email: "worker@example.com",
      username: "worker",
      passwordHash: workerPassword,
      role: "WORKER",
      firstName: "Mike",
      lastName: "Johnson",
      phone: "+233 27 123 4567",
      workerProfile: {
        create: {
          bio: "Experienced painter and tiler with 10+ years in construction.",
          skills: JSON.stringify(["Painting", "Tiling", "Drywall"]),
          experience: 10,
          hourlyRate: 150, // 150 GHS/hr
          status: "APPROVED",
          availability: "available",
          passportPhoto: "/uploads/placeholder_passport.jpg",
          faceImage: "/uploads/placeholder_face.jpg",
        },
      },
    },
    include: { workerProfile: true },
  });

  // 5. Supplier
  const supplierPassword = await hashPassword("supplier123");
  const supplierUser = await prisma.user.create({
    data: {
      email: "supplier@example.com",
      username: "supplier",
      passwordHash: supplierPassword,
      role: "SUPPLIER",
      firstName: "Sarah",
      lastName: "Williams",
      phone: "+233 28 123 4567",
      supplierProfile: {
        create: {
          companyName: "BuildMart Supplies Ltd",
          address: "15 Industrial Estate",
          city: "Tema",
          postcode: "GT-123-4567",
          specialties: JSON.stringify(["Paint Suppliers", "Building Materials"]),
          rating: 4.8,
          category: "Building Materials",
        },
      },
    },
    include: { supplierProfile: true },
  });

  // Seed some products for the Supplier
  if (supplierUser.supplierProfile) {
    await prisma.product.createMany({
      data: [
        {
          name: "Portland Cement (50kg)",
          description: "High quality cement for strong foundations and concrete blocks.",
          price: 95.0, // 95 GHS
          supplierId: supplierUser.supplierProfile.id,
          phone: "+233 28 123 4567",
        },
        {
          name: "Premium Paint - Matte White (20L)",
          description: "Washable matte finish paint for interior and exterior walls.",
          price: 450.0, // 450 GHS
          supplierId: supplierUser.supplierProfile.id,
          phone: "+233 28 123 4567",
        },
        {
          name: "Ceramic Floor Tiles - Pack of 10 (40x40cm)",
          description: "Durable non-slip floor tiles suitable for kitchens and bathrooms.",
          price: 180.0, // 180 GHS
          supplierId: supplierUser.supplierProfile.id,
          phone: "+233 28 123 4567",
        },
      ],
    });
  }

  // Seed a sample project, surveys, quotations, and satisfaction surveys
  if (customerUser.customerProfile) {
    const project = await prisma.project.create({
      data: {
        title: "Office Renovation - Floor 3",
        description: "Complete renovation of third floor office space including painting, new flooring, and electrical updates.",
        location: "42 Construction Lane, Accra",
        serviceType: "Painting",
        status: "COMPLETED",
        contractPrice: 15000,
        images: JSON.stringify([]),
        customerId: customerUser.customerProfile.id,
        createdById: superAdmin.id,
      },
    });

    await prisma.survey.create({
      data: {
        projectId: project.id,
        surveyDate: new Date(),
        notes: "Initial site survey completed. Walls need preparation before painting.",
        requirements: "Low-VOC paint, commercial grade flooring",
        photos: JSON.stringify([]),
        conductedBy: "Admin Team",
      },
    });

    await prisma.quotation.create({
      data: {
        projectId: project.id,
        laborCost: 8000,
        materialCost: 6500,
        otherCosts: 500,
        totalAmount: 15000,
        status: "APPROVED",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: "Price includes all materials and 2-year warranty on workmanship.",
      },
    });

    // Create a satisfaction survey for testimonial
    await prisma.satisfactionSurvey.create({
      data: {
        projectId: project.id,
        rating: 5,
        feedback: "Hardhat Workforce transformed our office renovation. Professional, on-time, and within budget. Highly recommended!",
        published: true,
      },
    });

    // Seed another ongoing project
    const activeProject = await prisma.project.create({
      data: {
        title: "Kitchen Tiling Project",
        description: "Modern kitchen tiling for wall and floor.",
        location: "Dodowa, Accra",
        serviceType: "Tiling",
        status: "UNDER_REVIEW",
        customerId: customerUser.customerProfile.id,
      },
    });
  }

  console.log("Seed completed!");
  console.log("\nDemo accounts:");
  console.log("  Super Admin: admin@hardhatworkforce.com / admin123");
  console.log("  Customer:    customer@example.com / customer123");
  console.log("  Worker:      worker@example.com / worker123");
  console.log("  Supplier:    supplier@example.com / supplier123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
