"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, StatusBadge, Button, Modal, Label, Input, EmptyState } from "@/components/ui";
import { Plus, Trash2, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Worker {
  id: string;
  bio: string;
  skills: string[];
  experience: number;
  hourlyRate: number | null;
  status: string;
  passportPhoto: string | null;
  faceImage: string | null;
  user: { firstName: string; lastName: string; email: string; phone: string; username: string };
}

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: "", username: "", password: "", confirmPassword: "", firstName: "", lastName: "", phone: "", bio: "" });

  const load = () => {
    const params = filter ? `?status=${filter}` : "";
    fetch(`/api/workers${params}`).then((r) => r.json()).then(setWorkers).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/workers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    load();
  };

  const createWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return alert("Passwords do not match");
    const res = await fetch("/api/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowCreate(false); load(); }
    else { const data = await res.json(); alert(data.error); }
  };

  const removeWorker = async (id: string) => {
    if (!confirm("Remove this worker?")) return;
    await fetch(`/api/workers?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-gray-900">Workforce Management</h1>
          <p className="text-brand-gray-500 text-sm mt-1">Add, edit, approve, and remove workers</p>
        </div>
        <div className="flex gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-brand-gray-300 px-3 py-2 text-sm">
            <option value="">All Workers</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="w-4 h-4" /> Add Worker</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" /></div>
      ) : workers.length === 0 ? (
        <EmptyState title="No workers found" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((w) => (
            <Card key={w.id}>
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-3">
                    {w.faceImage && <img src={w.faceImage} alt="" className="w-12 h-12 rounded-full object-cover" />}
                    <div>
                      <h3 className="font-semibold text-brand-gray-900">{w.user.firstName} {w.user.lastName}</h3>
                      <p className="text-sm text-brand-gray-500">{w.user.email}</p>
                      <p className="text-xs text-brand-gray-400">{w.user.phone}</p>
                    </div>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
                {w.bio && <p className="text-sm text-brand-gray-600 mb-3">{w.bio}</p>}
                <div className="flex flex-wrap gap-1 mb-3">
                  {w.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange text-xs rounded-full">{s}</span>
                  ))}
                </div>
                <div className="text-xs text-brand-gray-400 mb-4">
                  {w.experience} years experience {w.hourlyRate && `• ${formatCurrency(w.hourlyRate)}/hr`}
                </div>
                <div className="flex gap-2">
                  {w.status === "PENDING" && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(w.id, "APPROVED")} className="flex-1 gap-1"><Check className="w-4 h-4" /> Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => updateStatus(w.id, "REJECTED")} className="gap-1"><X className="w-4 h-4" /></Button>
                    </>
                  )}
                  <Button size="sm" variant="danger" onClick={() => removeWorker(w.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Worker">
        <form onSubmit={createWorker} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label required>First Name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
            <div><Label required>Last Name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
          </div>
          <div><Label required>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
          <div><Label required>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><Label required>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div><Label required>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
          <div><Label required>Confirm Password</Label><Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required minLength={6} /></div>
          <Button type="submit" className="w-full">Create Worker</Button>
        </form>
      </Modal>
    </div>
  );
}
