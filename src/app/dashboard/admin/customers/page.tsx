"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody, StatusBadge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface Customer {
  id: string;
  company: string | null;
  city: string | null;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
  _count: { projects: number };
  projects: Array<{ id: string; title: string; status: string }>;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-gray-900">Customer Management</h1>
        <p className="text-brand-gray-500 text-sm mt-1">View and manage registered customers</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" /></div>
      ) : customers.length === 0 ? (
        <EmptyState title="No customers yet" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {customers.map((c) => (
            <Card key={c.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{c.user.firstName} {c.user.lastName}</h3>
                    {c.company && <p className="text-sm text-brand-gray-500">{c.company}</p>}
                  </div>
                  <span className="text-sm text-brand-orange font-medium">{c._count.projects} projects</span>
                </div>
                <div className="text-sm text-brand-gray-500 mt-3 space-y-1">
                  <p>{c.user.email}</p>
                  {c.user.phone && <p>{c.user.phone}</p>}
                  {c.city && <p>{c.city}</p>}
                </div>
                {c.projects.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-brand-gray-100">
                    <p className="text-xs font-medium text-brand-gray-400 mb-2">Recent Projects</p>
                    {c.projects.map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-1">
                        <Link href={`/dashboard/admin/projects/${p.id}`} className="text-sm hover:text-brand-orange">{p.title}</Link>
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
