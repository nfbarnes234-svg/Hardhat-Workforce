"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard, Card, CardHeader, CardBody, StatusBadge, EmptyState } from "@/components/ui";
import { StatusPieChart, ServiceBarChart } from "@/components/charts";
import { FolderKanban, Users, UserCheck, TrendingUp, Archive } from "lucide-react";
import { formatDate, PROJECT_STATUS_LABELS } from "@/lib/utils";

export default function AdminDashboard() {
  const [data, setData] = useState<{
    stats: Record<string, number> & { archivedProjects?: number };
    recentProjects: Array<{ id: string; title: string; status: string; createdAt: string; customer: { user: { firstName: string; lastName: string } } }>;
    projectsByStatus: Array<{ status: string; count: number }>;
    projectsByService: Array<{ service: string; count: number }>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" /></div>;
  }

  const statusChartData = data.projectsByStatus.map((s) => ({
    name: PROJECT_STATUS_LABELS[s.status]?.split(" ")[0] || s.status,
    value: s.count,
  }));

  const serviceChartData = data.projectsByService.map((s) => ({
    name: s.service,
    value: s.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-gray-900">Admin Dashboard</h1>
        <p className="text-brand-gray-500 text-sm mt-1">Overview of all operations and projects</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Projects" value={data.stats.totalProjects} icon={<FolderKanban className="w-6 h-6" />} color="orange" />
        <StatCard title="Active Projects" value={data.stats.activeProjects} icon={<TrendingUp className="w-6 h-6" />} color="blue" />
        <StatCard title="Completed" value={data.stats.completedProjects} icon={<FolderKanban className="w-6 h-6" />} color="green" />
        <StatCard title="Archived" value={data.stats.archivedProjects || 0} icon={<Archive className="w-6 h-6" />} color="black" />
        <StatCard title="Pending Workers" value={data.stats.pendingWorkers} icon={<UserCheck className="w-6 h-6" />} color="orange" />
        <StatCard title="Customers" value={data.stats.totalCustomers} icon={<Users className="w-6 h-6" />} color="black" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Projects by Status" />
          <CardBody><StatusPieChart data={statusChartData} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Projects by Service" />
          <CardBody><ServiceBarChart data={serviceChartData} /></CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Projects" action={<Link href="/dashboard/admin/projects" className="text-sm text-brand-orange hover:underline">View All</Link>} />
        <CardBody className="p-0">
          {data.recentProjects.length === 0 ? (
            <EmptyState title="No projects yet" description="Projects will appear here once customers submit requests." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-gray-200 bg-brand-gray-50">
                    <th className="text-left px-6 py-3 font-medium text-brand-gray-600">Project</th>
                    <th className="text-left px-6 py-3 font-medium text-brand-gray-600">Customer</th>
                    <th className="text-left px-6 py-3 font-medium text-brand-gray-600">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-brand-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentProjects.map((p) => (
                    <tr key={p.id} className="border-b border-brand-gray-100 hover:bg-brand-gray-50">
                      <td className="px-6 py-3">
                        <Link href={`/dashboard/admin/projects/${p.id}`} className="font-medium text-brand-gray-900 hover:text-brand-orange">{p.title}</Link>
                      </td>
                      <td className="px-6 py-3 text-brand-gray-600">{p.customer.user.firstName} {p.customer.user.lastName}</td>
                      <td className="px-6 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-6 py-3 text-brand-gray-500">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
