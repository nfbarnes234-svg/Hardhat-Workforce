"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody, StatusBadge, Button, Input, Select, EmptyState, Modal, Label, Textarea } from "@/components/ui";
import { Plus, Search } from "lucide-react";
import { formatDate, formatCurrency, SERVICE_TYPES } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  serviceType: string;
  status: string;
  contractPrice: number | null;
  createdAt: string;
  customer: { user: { firstName: string; lastName: string; email: string } };
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; user: { firstName: string; lastName: string } }>>([]);
  const [form, setForm] = useState({ title: "", description: "", location: "", serviceType: "", contractPrice: "", customerId: "" });

  const fetchProjects = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/projects?${params}`).then((r) => r.json()).then(setProjects).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, [search, statusFilter]);
  useEffect(() => { fetch("/api/customers").then((r) => r.json()).then(setCustomers); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ title: "", description: "", location: "", serviceType: "", contractPrice: "", customerId: "" });
      fetchProjects();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-gray-900">Projects</h1>
          <p className="text-brand-gray-500 text-sm mt-1">Manage all construction projects</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="w-4 h-4" /> New Project</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
          <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-48">
          <option value="">All Statuses</option>
          {["REQUEST_SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "COMPLETED", "OPEN_FOR_WORKERS"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </Select>
      </div>

      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" /></div>
          ) : projects.length === 0 ? (
            <EmptyState title="No projects found" description="Create a new project or adjust your filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-gray-200 bg-brand-gray-50">
                    <th className="text-left px-6 py-3 font-medium text-brand-gray-600">Project</th>
                    <th className="text-left px-6 py-3 font-medium text-brand-gray-600">Customer</th>
                    <th className="text-left px-6 py-3 font-medium text-brand-gray-600">Service</th>
                    <th className="text-left px-6 py-3 font-medium text-brand-gray-600">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-brand-gray-600">Price</th>
                    <th className="text-left px-6 py-3 font-medium text-brand-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="border-b border-brand-gray-100 hover:bg-brand-gray-50">
                      <td className="px-6 py-3">
                        <Link href={`/dashboard/admin/projects/${p.id}`} className="font-medium hover:text-brand-orange">{p.title}</Link>
                        <p className="text-xs text-brand-gray-400 mt-0.5">{p.location}</p>
                      </td>
                      <td className="px-6 py-3">{p.customer.user.firstName} {p.customer.user.lastName}</td>
                      <td className="px-6 py-3">{p.serviceType}</td>
                      <td className="px-6 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-6 py-3">{p.contractPrice ? formatCurrency(p.contractPrice) : "—"}</td>
                      <td className="px-6 py-3 text-brand-gray-500">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><Label required>Customer</Label>
            <Select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
              <option value="">Select customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.user.firstName} {c.user.lastName}</option>)}
            </Select>
          </div>
          <div><Label required>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><Label required>Service Type</Label>
            <Select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} required>
              <option value="">Select service</option>
              {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div><Label required>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
          <div><Label required>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
          <div><Label>Contract Price</Label><Input type="number" value={form.contractPrice} onChange={(e) => setForm({ ...form, contractPrice: e.target.value })} /></div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Create Project</Button>
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
