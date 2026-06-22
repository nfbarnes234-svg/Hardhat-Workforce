"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody, StatusBadge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function CustomerProjectsPage() {
  const [projects, setProjects] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then(setProjects);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Projects</h1>
        <p className="text-brand-gray-500 text-sm">Track all your service requests</p>
      </div>
      {projects.length === 0 ? (
        <EmptyState title="No projects" action={<Link href="/dashboard/customer/new-request"><span className="text-brand-orange hover:underline">Submit a request</span></Link>} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const project = p as { id: string; title: string; description: string; location: string; serviceType: string; status: string; createdAt: string };
            return (
              <Link key={project.id} href={`/dashboard/customer/projects/${project.id}`}>
                <Card className="hover:border-brand-orange transition-colors h-full">
                  <CardBody>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{project.title}</h3>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="text-sm text-brand-gray-500">{project.serviceType} • {project.location}</p>
                    <p className="text-sm text-brand-gray-400 mt-2 line-clamp-2">{project.description}</p>
                    <p className="text-xs text-brand-gray-400 mt-3">{formatDate(project.createdAt)}</p>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
