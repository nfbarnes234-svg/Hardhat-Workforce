import prisma from "@/lib/db";

import { requireAuth, apiSuccess } from "@/lib/api-utils";

import { isAdminRole } from "@/lib/api-utils";



export async function GET() {

  const auth = await requireAuth(["ADMIN", "SUPERADMIN", "CUSTOMER", "WORKER", "SUPPLIER"]);

  if (auth instanceof Response) return auth;

  const { session } = auth;



  if (isAdminRole(session.role)) {

    const [

      totalProjects,

      activeProjects,

      completedProjects,

      archivedProjects,

      pendingWorkers,

      totalCustomers,

      totalSuppliers,

      recentProjects,

      projectsByStatus,

      projectsByService,

    ] = await Promise.all([

      prisma.project.count(),

      prisma.project.count({

        where: { status: { in: ["IN_PROGRESS", "WORKERS_ASSIGNED", "OPEN_FOR_WORKERS"] } },

      }),

      prisma.project.count({ where: { status: "COMPLETED" } }),

      prisma.project.count({ where: { status: "ARCHIVED" } }),

      prisma.worker.count({ where: { status: "PENDING" } }),

      prisma.customer.count(),

      prisma.supplier.count(),

      prisma.project.findMany({

        take: 5,

        orderBy: { createdAt: "desc" },

        include: { customer: { include: { user: { select: { firstName: true, lastName: true } } } } },

      }),

      prisma.project.groupBy({ by: ["status"], _count: { status: true } }),

      prisma.project.groupBy({ by: ["serviceType"], _count: { serviceType: true } }),

    ]);



    return apiSuccess({

      stats: {

        totalProjects,

        activeProjects,

        completedProjects,

        archivedProjects,

        pendingWorkers,

        totalCustomers,

        totalSuppliers,

      },

      recentProjects,

      projectsByStatus: projectsByStatus.map((s) => ({

        status: s.status,

        count: s._count.status,

      })),

      projectsByService: projectsByService.map((s) => ({

        service: s.serviceType,

        count: s._count.serviceType,

      })),

    });

  }



  if (session.role === "CUSTOMER") {

    const customer = await prisma.customer.findUnique({ where: { userId: session.userId } });

    if (!customer) return apiSuccess({ stats: {}, projects: [] });



    const [totalProjects, activeProjects, completedProjects, projects] = await Promise.all([

      prisma.project.count({ where: { customerId: customer.id } }),

      prisma.project.count({

        where: {

          customerId: customer.id,

          status: { in: ["IN_PROGRESS", "WORKERS_ASSIGNED", "OPEN_FOR_WORKERS"] },

        },

      }),

      prisma.project.count({ where: { customerId: customer.id, status: "COMPLETED" } }),

      prisma.project.findMany({

        where: { customerId: customer.id },

        orderBy: { createdAt: "desc" },

        take: 10,

        include: { quotations: { orderBy: { createdAt: "desc" }, take: 1 } },

      }),

    ]);



    return apiSuccess({

      stats: { totalProjects, activeProjects, completedProjects },

      projects,

    });

  }



  if (session.role === "WORKER") {

    const worker = await prisma.worker.findUnique({ where: { userId: session.userId } });

    if (!worker) return apiSuccess({ stats: {}, assignments: [] });



    const [totalAssignments, activeAssignments, completedAssignments, assignments] =

      await Promise.all([

        prisma.projectAssignment.count({ where: { workerId: worker.id } }),

        prisma.projectAssignment.count({

          where: { workerId: worker.id, status: { in: ["ASSIGNED", "IN_PROGRESS", "ACCEPTED"] } },

        }),

        prisma.projectAssignment.count({

          where: { workerId: worker.id, status: "COMPLETED" },

        }),

        prisma.projectAssignment.findMany({

          where: { workerId: worker.id },

          include: { project: true },

          orderBy: { createdAt: "desc" },

          take: 10,

        }),

      ]);



    const availableProjects = await prisma.project.count({

      where: { status: "OPEN_FOR_WORKERS" },

    });



    return apiSuccess({

      stats: { totalAssignments, activeAssignments, completedAssignments, availableProjects },

      assignments,

      workerStatus: worker.status,

    });

  }



  if (session.role === "SUPPLIER") {

    const supplier = await prisma.supplier.findUnique({ where: { userId: session.userId } });

    if (!supplier) return apiSuccess({ stats: {}, orders: [] });



    const [totalOrders, pendingOrders, deliveredOrders, orders] = await Promise.all([

      prisma.purchaseOrder.count({ where: { supplierId: supplier.id } }),

      prisma.purchaseOrder.count({

        where: { supplierId: supplier.id, status: { in: ["SENT", "CONFIRMED"] } },

      }),

      prisma.purchaseOrder.count({

        where: { supplierId: supplier.id, status: "DELIVERED" },

      }),

      prisma.purchaseOrder.findMany({

        where: { supplierId: supplier.id },

        include: { project: { select: { title: true } } },

        orderBy: { createdAt: "desc" },

        take: 10,

      }),

    ]);



    return apiSuccess({

      stats: { totalOrders, pendingOrders, deliveredOrders },

      orders,

    });

  }



  return apiSuccess({});

}

