"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, StatusBadge, Button, Modal, Label, Select, Input, Textarea, EmptyState } from "@/components/ui";
import { Plus, Trash2 } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface OrderItem { name: string; quantity: number; unitPrice: number }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; companyName: string }>>([]);
  const [projects, setProjects] = useState<Array<{ id: string; title: string }>>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ projectId: "", supplierId: "", notes: "", deliveryDate: "" });
  const [items, setItems] = useState<OrderItem[]>([{ name: "", quantity: 1, unitPrice: 0 }]);

  const load = () => fetch("/api/purchase-orders").then((r) => r.json()).then(setOrders);

  useEffect(() => {
    load();
    fetch("/api/suppliers").then((r) => r.json()).then(setSuppliers);
    fetch("/api/projects").then((r) => r.json()).then((p: Array<{ id: string; title: string }>) => setProjects(p));
  }, []);

  const addItem = () => setItems([...items, { name: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof OrderItem, value: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: field === "name" ? value : parseFloat(value) || 0 };
    setItems(updated);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((i) => !i.name)) return alert("All items need a name");
    await fetch("/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items, totalAmount }),
    });
    setShowCreate(false);
    setItems([{ name: "", quantity: 1, unitPrice: 0 }]);
    load();
  };

  const sendOrder = async (id: string) => {
    await fetch("/api/purchase-orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "SENT" }) });
    load();
  };

  const verifyReceipt = async (id: string) => {
    await fetch("/api/purchase-orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, receiptVerified: true }) });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <p className="text-brand-gray-500 text-sm">Manage material orders with multiple items per package</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="w-4 h-4" /> New Order</Button>
      </div>

      {orders.length === 0 ? <EmptyState title="No purchase orders" /> : (
        <div className="space-y-4">
          {orders.map((o) => {
            const order = o as {
              id: string; orderNumber: string; status: string; totalAmount: number; createdAt: string;
              receiptSubmitted: boolean; receiptVerified: boolean;
              items: OrderItem[]; receiptItems: OrderItem[] | null;
              project: { title: string }; supplier: { companyName: string };
            };
            return (
              <Card key={order.id}>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-brand-gray-500">{order.project.title} • {order.supplier.companyName}</p>
                      <p className="text-sm text-brand-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  <table className="w-full text-sm mb-4">
                    <thead><tr className="border-b border-brand-gray-200 text-brand-gray-500">
                      <th className="text-left py-2">Item</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Unit Price</th><th className="text-right py-2">Total</th>
                    </tr></thead>
                    <tbody>
                      {order.items?.map((item, i) => (
                        <tr key={i} className="border-b border-brand-gray-100">
                          <td className="py-2">{item.name}</td>
                          <td className="text-right">{item.quantity}</td>
                          <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {order.receiptSubmitted && order.receiptItems && (
                    <div className="bg-green-50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-green-800 mb-2">Supplier Receipt {order.receiptVerified ? "(Verified)" : "(Pending Verification)"}</p>
                      {order.receiptItems.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-green-700">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                        </div>
                      ))}
                      {!order.receiptVerified && (
                        <Button size="sm" className="mt-2" onClick={() => verifyReceipt(order.id)}>Verify Receipt</Button>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {order.status === "DRAFT" && <Button size="sm" onClick={() => sendOrder(order.id)}>Send to Supplier</Button>}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Purchase Order">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><Label required>Project</Label>
            <Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
              <option value="">Select project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </Select>
          </div>
          <div><Label required>Supplier</Label>
            <Select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} required>
              <option value="">Select supplier</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.companyName}</option>)}
            </Select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label required>Order Items</Label>
              <Button type="button" size="sm" variant="outline" onClick={addItem} className="gap-1"><Plus className="w-3 h-3" /> Add Item</Button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-5"><Input placeholder="Item name" value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} required /></div>
                <div className="col-span-2"><Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} required /></div>
                <div className="col-span-3"><Input type="number" placeholder="Price (GHS)" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", e.target.value)} required /></div>
                <div className="col-span-2 flex gap-1">
                  {items.length > 1 && <Button type="button" size="sm" variant="danger" onClick={() => removeItem(i)}><Trash2 className="w-4 h-4" /></Button>}
                </div>
              </div>
            ))}
            <p className="text-sm font-medium text-right mt-2">Total: {formatCurrency(totalAmount)}</p>
          </div>
          <div><Label>Delivery Date</Label><Input type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} /></div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <Button type="submit" className="w-full">Create Order Package</Button>
        </form>
      </Modal>
    </div>
  );
}
