"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Button, Label, Input, Modal, EmptyState } from "@/components/ui";
import { Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: "", username: "", password: "", confirmPassword: "", firstName: "", lastName: "", phone: "" });

  const load = () => fetch("/api/users/admins").then((r) => r.json()).then(setAdmins);

  useEffect(() => { load(); }, []);

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return alert("Passwords do not match");
    const res = await fetch("/api/users/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ email: "", username: "", password: "", confirmPassword: "", firstName: "", lastName: "", phone: "" });
      load();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create admin");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch("/api/users/admins", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isActive: !isActive }) });
    load();
  };

  const removeAdmin = async (id: string) => {
    if (!confirm("Delete this admin account?")) return;
    await fetch(`/api/users/admins?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <p className="text-brand-gray-500 text-sm">Create and manage administrator accounts</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="w-4 h-4" /> New Admin</Button>
      </div>

      {admins.length === 0 ? <EmptyState title="No admins" /> : (
        <div className="space-y-3">
          {admins.map((a) => (
            <Card key={a.id}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{a.firstName} {a.lastName} <span className="text-xs text-brand-orange ml-2 capitalize">{a.role.toLowerCase()}</span></p>
                  <p className="text-sm text-brand-gray-500">{a.email} • @{a.username}</p>
                  <p className="text-xs text-brand-gray-400 mt-1">{a.phone} • Created {formatDate(a.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  {a.role !== "SUPERADMIN" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => toggleActive(a.id, a.isActive)}>{a.isActive ? "Deactivate" : "Activate"}</Button>
                      <Button size="sm" variant="danger" onClick={() => removeAdmin(a.id)}><Trash2 className="w-4 h-4" /></Button>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Admin Account">
        <form onSubmit={createAdmin} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label required>First Name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
            <div><Label required>Last Name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
          </div>
          <div><Label required>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
          <div><Label required>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><Label required>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div><Label required>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
          <div><Label required>Confirm Password</Label><Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required minLength={6} /></div>
          <Button type="submit" className="w-full">Create Admin</Button>
        </form>
      </Modal>
    </div>
  );
}
