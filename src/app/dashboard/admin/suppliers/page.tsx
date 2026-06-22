"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Button, Label, Input, Modal, Select, EmptyState } from "@/components/ui";
import { Plus, Trash2 } from "lucide-react";
import { SUPPLIER_CATEGORIES } from "@/lib/utils";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Array<Record<string, unknown>>>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    email: "", username: "", password: "", confirmPassword: "",
    firstName: "", lastName: "", phone: "", companyName: "",
    address: "", city: "", postcode: "", category: "Other Categories",
  });

  const load = () => fetch("/api/suppliers").then((r) => r.json()).then(setSuppliers);

  useEffect(() => { load(); }, []);

  const createSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return alert("Passwords do not match");
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowCreate(false);
      load();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create supplier");
    }
  };

  const removeSupplier = async (id: string) => {
    if (!confirm("Remove this supplier?")) return;
    await fetch(`/api/suppliers?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-brand-gray-500 text-sm">Create and manage supplier accounts</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="w-4 h-4" /> Add Supplier</Button>
      </div>

      {suppliers.length === 0 ? <EmptyState title="No suppliers" /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => {
            const sup = s as { id: string; companyName: string; city: string; category: string; rating: number; user: { firstName: string; lastName: string; email: string; phone: string }; _count: { purchaseOrders: number; products: number } };
            return (
              <Card key={sup.id}>
                <CardBody>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{sup.companyName}</h3>
                    <Button size="sm" variant="danger" onClick={() => removeSupplier(sup.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                  <p className="text-xs text-brand-orange mt-1">{sup.category}</p>
                  <p className="text-sm text-brand-gray-500">{sup.user.firstName} {sup.user.lastName}</p>
                  <p className="text-sm text-brand-gray-400 mt-2">{sup.user.email}</p>
                  <p className="text-sm text-brand-gray-400">{sup.user.phone}</p>
                  <div className="flex justify-between mt-4 text-sm">
                    <span className="text-brand-orange">★ {sup.rating.toFixed(1)}</span>
                    <span className="text-brand-gray-400">{sup._count.products} products • {sup._count.purchaseOrders} orders</span>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Supplier Account">
        <form onSubmit={createSupplier} className="space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div><Label required>First Name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
            <div><Label required>Last Name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
          </div>
          <div><Label required>Company Name</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required /></div>
          <div><Label required>Category</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
              {SUPPLIER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div><Label required>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
          <div><Label required>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><Label required>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div><Label required>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
          <div><Label required>Confirm Password</Label><Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required minLength={6} /></div>
          <Button type="submit" className="w-full">Create Supplier</Button>
        </form>
      </Modal>
    </div>
  );
}
