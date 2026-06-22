"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, StatusBadge, Button, Modal, Label, Input, EmptyState } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderItem { name: string; quantity: number; unitPrice: number }

async function fetchOrders(): Promise<Array<Record<string, unknown>>> {
  const res = await fetch("/api/purchase-orders");
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiptOrder, setReceiptOrder] = useState<{ id: string; items: OrderItem[] } | null>(null);
  const [receiptItems, setReceiptItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(() => setError("Could not load purchase orders."))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/purchase-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) return;
    setOrders(await fetchOrders());
  };

  const openReceipt = (order: { id: string; items: OrderItem[] }) => {
    setReceiptOrder(order);
    setReceiptItems(order.items.map((i) => ({ ...i })));
  };

  const submitReceipt = async () => {
    if (!receiptOrder) return;
    await fetch("/api/purchase-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: receiptOrder.id, receiptItems }),
    });
    setReceiptOrder(null);
    setOrders(await fetchOrders());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <p className="text-brand-gray-500 text-sm">Confirm orders, deliver materials, and submit receipts</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" />
        </div>
      ) : orders.length === 0 ? <EmptyState title="No orders" /> : (
        <div className="space-y-4">
          {orders.map((o) => {
            const order = o as {
              id: string; orderNumber: string; status: string; totalAmount: number; createdAt: string;
              notes: string; items: OrderItem[]; receiptSubmitted: boolean; receiptVerified: boolean;
              project: { title: string; location: string };
            };
            return (
              <Card key={order.id}>
                <CardBody>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">{order.orderNumber}</h3>
                      <p className="text-sm text-brand-gray-500">{order.project.title} • {order.project.location}</p>
                      <p className="text-xs text-brand-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatCurrency(order.totalAmount)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  {order.items?.length > 0 && (
                    <table className="w-full text-sm mb-4">
                      <thead><tr className="border-b border-brand-gray-200 text-brand-gray-500">
                        <th className="text-left py-2">Item</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Total</th>
                      </tr></thead>
                      <tbody>
                        {order.items.map((item, i) => (
                          <tr key={i} className="border-b border-brand-gray-100">
                            <td className="py-2">{item.name}</td>
                            <td className="text-right">{item.quantity}</td>
                            <td className="text-right">{formatCurrency(item.unitPrice * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {order.notes && <p className="text-sm text-brand-gray-500 mb-4">{order.notes}</p>}
                  <div className="flex gap-3 flex-wrap">
                    {order.status === "SENT" && (
                      <>
                        <Button onClick={() => updateStatus(order.id, "CONFIRMED")} className="flex-1">Confirm Stock</Button>
                        <Button variant="danger" onClick={() => updateStatus(order.id, "CANCELLED")} className="flex-1">Decline</Button>
                      </>
                    )}
                    {order.status === "CONFIRMED" && (
                      <>
                        <Button onClick={() => updateStatus(order.id, "DELIVERED")} className="flex-1">Mark as Delivered</Button>
                        {!order.receiptSubmitted && (
                          <Button variant="outline" onClick={() => openReceipt(order)} className="flex-1">Generate Receipt</Button>
                        )}
                      </>
                    )}
                    {order.receiptSubmitted && (
                      <span className="text-sm text-green-600 font-medium">
                        Receipt submitted {order.receiptVerified ? "(Verified by Admin)" : "(Pending verification)"}
                      </span>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!receiptOrder} onClose={() => setReceiptOrder(null)} title="Submit Purchase Receipt">
        <div className="space-y-4">
          <p className="text-sm text-brand-gray-600">Verify receipt items match the order before submitting to admin.</p>
          {receiptItems.map((item, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <Input value={item.name} onChange={(e) => {
                const updated = [...receiptItems];
                updated[i].name = e.target.value;
                setReceiptItems(updated);
              }} />
              <Input type="number" value={item.quantity} onChange={(e) => {
                const updated = [...receiptItems];
                updated[i].quantity = parseFloat(e.target.value) || 0;
                setReceiptItems(updated);
              }} />
              <Input type="number" value={item.unitPrice} onChange={(e) => {
                const updated = [...receiptItems];
                updated[i].unitPrice = parseFloat(e.target.value) || 0;
                setReceiptItems(updated);
              }} />
            </div>
          ))}
          <Button onClick={submitReceipt} className="w-full">Submit Receipt to Admin</Button>
        </div>
      </Modal>
    </div>
  );
}
