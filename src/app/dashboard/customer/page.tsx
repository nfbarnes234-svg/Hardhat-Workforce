"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard, Card, CardHeader, CardBody, StatusBadge, Button, EmptyState } from "@/components/ui";
import { FolderKanban, Clock, CheckCircle, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function CustomerDashboard() {
  const [data, setData] = useState<{ stats: Record<string, number>; projects: Array<Record<string, unknown>> } | null>(null);

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-brand-gray-500 text-sm">Track your projects and requests</p>
        </div>
        <Link href="/dashboard/customer/new-request">
          <Button className="gap-2"><Plus className="w-4 h-4" /> New Request</Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Total Projects" value={data.stats.totalProjects || 0} icon={<FolderKanban className="w-6 h-6" />} color="orange" />
        <StatCard title="Active" value={data.stats.activeProjects || 0} icon={<Clock className="w-6 h-6" />} color="blue" />
        <StatCard title="Completed" value={data.stats.completedProjects || 0} icon={<CheckCircle className="w-6 h-6" />} color="green" />
      </div>

      <Card>
        <CardHeader title="Recent Projects" action={<Link href="/dashboard/customer/projects" className="text-sm text-brand-orange hover:underline">View All</Link>} />
        <CardBody className="p-0">
          {data.projects.length === 0 ? (
            <EmptyState title="No projects yet" description="Submit a service request to get started." action={<Link href="/dashboard/customer/new-request"><Button size="sm">Submit Request</Button></Link>} />
          ) : (
            <div className="divide-y divide-brand-gray-100">
              {data.projects.map((p) => {
                const project = p as { id: string; title: string; status: string; serviceType: string; createdAt: string };
                return (
                  <Link key={project.id} href={`/dashboard/customer/projects/${project.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-brand-gray-50">
                    <div>
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-brand-gray-500">{project.serviceType} • {formatDate(project.createdAt)}</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </Link>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
