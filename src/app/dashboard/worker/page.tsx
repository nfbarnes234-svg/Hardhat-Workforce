"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard, Card, CardHeader, CardBody, StatusBadge, EmptyState } from "@/components/ui";
import { Briefcase, Clock, CheckCircle, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function WorkerDashboard() {
  const [data, setData] = useState<{ stats: Record<string, number>; assignments: Array<Record<string, unknown>>; workerStatus: string } | null>(null);

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" /></div>;

  if (data.workerStatus === "PENDING") {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold">Account Pending Approval</h2>
        <p className="text-brand-gray-500 mt-2 max-w-md mx-auto">Your worker account is being reviewed by our admin team. You&apos;ll be notified once approved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Worker Dashboard</h1>
        <p className="text-brand-gray-500 text-sm">Manage your jobs and assignments</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assignments" value={data.stats.totalAssignments || 0} icon={<Briefcase className="w-6 h-6" />} color="orange" />
        <StatCard title="Active Jobs" value={data.stats.activeAssignments || 0} icon={<Clock className="w-6 h-6" />} color="blue" />
        <StatCard title="Completed" value={data.stats.completedAssignments || 0} icon={<CheckCircle className="w-6 h-6" />} color="green" />
        <StatCard title="Available Jobs" value={data.stats.availableProjects || 0} icon={<Search className="w-6 h-6" />} color="black" />
      </div>

      <Card>
        <CardHeader title="Recent Assignments" action={<Link href="/dashboard/worker/assignments" className="text-sm text-brand-orange hover:underline">View All</Link>} />
        <CardBody className="p-0">
          {data.assignments.length === 0 ? (
            <EmptyState title="No assignments yet" description="Check available jobs to get started." action={<Link href="/dashboard/worker/jobs"><span className="text-brand-orange hover:underline">Browse Jobs</span></Link>} />
          ) : (
            <div className="divide-y divide-brand-gray-100">
              {data.assignments.map((a) => {
                const assignment = a as { id: string; status: string; progress: number; project: { title: string; location: string; serviceType: string } };
                return (
                  <div key={assignment.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium">{assignment.project.title}</p>
                      <p className="text-sm text-brand-gray-500">{assignment.project.serviceType} • {assignment.project.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-brand-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-orange rounded-full" style={{ width: `${assignment.progress}%` }} />
                      </div>
                      <StatusBadge status={assignment.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
