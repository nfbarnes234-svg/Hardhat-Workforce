"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, StatusBadge, Button, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

export default function WorkerJobsPage() {
  const [projects, setProjects] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetch("/api/projects?status=OPEN_FOR_WORKERS").then((r) => r.json()).then(setProjects);
  }, []);

  const applyForProject = async (projectId: string) => {
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Application submitted! Admin will review your application.");
    } else {
      alert(data.error || "Failed to apply");
    }
    fetch("/api/projects?status=OPEN_FOR_WORKERS").then((r) => r.json()).then(setProjects);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Available Jobs</h1>
        <p className="text-brand-gray-500 text-sm">Projects open for worker recruitment</p>
      </div>
      {projects.length === 0 ? (
        <EmptyState title="No available jobs" description="Check back later for new project opportunities." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const project = p as { id: string; title: string; description: string; location: string; serviceType: string; contractPrice: number; status: string };
            return (
              <Card key={project.id}>
                <CardBody>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{project.title}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-sm text-brand-gray-500">{project.serviceType} • {project.location}</p>
                  <p className="text-sm text-brand-gray-400 mt-2 line-clamp-2">{project.description}</p>
                  {project.contractPrice && (
                    <p className="text-lg font-bold text-brand-orange mt-3">{formatCurrency(project.contractPrice)}</p>
                  )}
                  <Button className="w-full mt-4" onClick={() => applyForProject(project.id)}>Apply for Job</Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
