"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, StatusBadge, Button, Label, Input, EmptyState } from "@/components/ui";

export default function WorkerAssignmentsPage() {
  const [assignments, setAssignments] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetch("/api/assignments").then((r) => r.json()).then(setAssignments);
  }, []);

  const respond = async (id: string, status: string) => {
    await fetch("/api/assignments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    fetch("/api/assignments").then((r) => r.json()).then(setAssignments);
  };

  const updateProgress = async (id: string, progress: number) => {
    const status = progress === 100 ? "COMPLETED" : "IN_PROGRESS";
    await fetch("/api/assignments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, progress, status }) });
    fetch("/api/assignments").then((r) => r.json()).then(setAssignments);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Assignments</h1>
        <p className="text-brand-gray-500 text-sm">Manage your assigned projects</p>
      </div>
      {assignments.length === 0 ? <EmptyState title="No assignments" /> : (
        <div className="space-y-4">
          {assignments.map((a) => {
            const assignment = a as { id: string; status: string; progress: number; project: { title: string; location: string; serviceType: string } };
            return (
              <Card key={assignment.id}>
                <CardBody>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{assignment.project.title}</h3>
                      <p className="text-sm text-brand-gray-500">{assignment.project.serviceType} • {assignment.project.location}</p>
                    </div>
                    <StatusBadge status={assignment.status} />
                  </div>

                  {assignment.status === "PENDING" && (
                    <div className="flex gap-3 mt-4">
                      <Button onClick={() => respond(assignment.id, "ACCEPTED")} className="flex-1">Accept</Button>
                      <Button variant="danger" onClick={() => respond(assignment.id, "REJECTED")} className="flex-1">Reject</Button>
                    </div>
                  )}

                  {(assignment.status === "ACCEPTED" || assignment.status === "ASSIGNED" || assignment.status === "IN_PROGRESS") && (
                    <div className="mt-4">
                      <Label>Progress: {assignment.progress}%</Label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={assignment.progress}
                        onChange={(e) => updateProgress(assignment.id, parseInt(e.target.value))}
                        className="w-full mt-2 accent-brand-orange"
                      />
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
