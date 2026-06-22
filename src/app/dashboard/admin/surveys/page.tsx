"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Button, Label, Input, Textarea, Modal, Select, EmptyState } from "@/components/ui";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Survey {
  id: string;
  projectId: string;
  surveyDate: string;
  notes: string;
  requirements: string;
  conductedBy: string;
  photos: string[];
  project: { title: string; location: string };
}

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; title: string }>>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Survey | null>(null);
  const [form, setForm] = useState({ projectId: "", surveyDate: "", notes: "", requirements: "", conductedBy: "" });

  const load = () => fetch("/api/surveys").then((r) => r.json()).then(setSurveys);

  useEffect(() => {
    load();
    fetch("/api/projects").then((r) => r.json()).then((p: Array<{ id: string; title: string }>) => setProjects(p));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ projectId: "", surveyDate: new Date().toISOString().split("T")[0], notes: "", requirements: "", conductedBy: "" });
    setShowModal(true);
  };

  const openEdit = (s: Survey) => {
    setEditing(s);
    setForm({
      projectId: s.projectId,
      surveyDate: s.surveyDate.split("T")[0],
      notes: s.notes || "",
      requirements: s.requirements || "",
      conductedBy: s.conductedBy || "",
    });
    setShowModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch(`/api/surveys/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowModal(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this survey?")) return;
    await fetch(`/api/surveys/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Surveys</h1>
          <p className="text-brand-gray-500 text-sm">Create, view, edit, and delete site surveys</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Create Survey</Button>
      </div>

      {surveys.length === 0 ? <EmptyState title="No surveys recorded" /> : (
        <div className="space-y-3">
          {surveys.map((s) => (
            <Card key={s.id}>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{s.project.title}</p>
                    <p className="text-sm text-brand-gray-500">{s.project.location}</p>
                    <p className="text-xs text-brand-gray-400 mt-1">{formatDate(s.surveyDate)} {s.conductedBy && `• ${s.conductedBy}`}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="danger" onClick={() => remove(s.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                {s.notes && <p className="text-sm text-brand-gray-600 mt-3">{s.notes}</p>}
                {s.requirements && <p className="text-xs text-brand-orange mt-2">Requirements: {s.requirements}</p>}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Survey" : "Create Survey"}>
        <form onSubmit={save} className="space-y-4">
          {!editing && (
            <div><Label required>Project</Label>
              <Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
                <option value="">Select project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </Select>
            </div>
          )}
          <div><Label required>Survey Date</Label><Input type="date" value={form.surveyDate} onChange={(e) => setForm({ ...form, surveyDate: e.target.value })} required /></div>
          <div><Label>Conducted By</Label><Input value={form.conductedBy} onChange={(e) => setForm({ ...form, conductedBy: e.target.value })} /></div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div><Label>Requirements</Label><Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></div>
          <Button type="submit" className="w-full">{editing ? "Update Survey" : "Create Survey"}</Button>
        </form>
      </Modal>
    </div>
  );
}
