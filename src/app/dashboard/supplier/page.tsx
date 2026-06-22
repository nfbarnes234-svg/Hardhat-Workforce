"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard, Card, CardHeader, CardBody, StatusBadge, Button, EmptyState } from "@/components/ui";
import { Package, Clock, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SupplierDashboard() {
  const [data, setData] = useState<{ stats: Record<string, number>; orders: Array<Record<string, unknown>> } | null>(null);

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
        <p className="text-brand-gray-500 text-sm">Manage purchase orders and deliveries</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Total Orders" value={data.stats.totalOrders || 0} icon={<Package className="w-6 h-6" />} color="orange" />
        <StatCard title="Pending" value={data.stats.pendingOrders || 0} icon={<Clock className="w-6 h-6" />} color="blue" />
        <StatCard title="Delivered" value={data.stats.deliveredOrders || 0} icon={<CheckCircle className="w-6 h-6" />} color="green" />
      </div>

      <Card>
        <CardHeader title="Recent Orders" action={<Link href="/dashboard/supplier/orders" className="text-sm text-brand-orange hover:underline">View All</Link>} />
        <CardBody className="p-0">
          {data.orders.length === 0 ? (
            <EmptyState title="No orders yet" description="Purchase orders will appear here when sent by admin." />
          ) : (
            <div className="divide-y divide-brand-gray-100">
              {data.orders.map((o) => {
                const order = o as { id: string; orderNumber: string; status: string; totalAmount: number; createdAt: string; project: { title: string } };
                return (
                  <div key={order.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-brand-gray-500">{order.project.title} • {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                      <StatusBadge status={order.status} />
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
