"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardBody, Button, Label, Input, Textarea, Modal, EmptyState } from "@/components/ui";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  phone: string;
  images: string[];
}

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", phone: "" });
  const [images, setImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => fetch("/api/products").then((r) => r.json()).then(setProducts);

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: "", phone: "" });
    setImages([]);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", price: String(p.price), phone: p.phone || "" });
    setImages(p.images || []);
    setShowModal(true);
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) setImages([...images, data.url]);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, images, ...(editing && { id: editing.id }) };
    await fetch("/api/products", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setShowModal(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-brand-gray-500 text-sm">Manage your product catalog with pricing and images</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
      </div>

      {products.length === 0 ? <EmptyState title="No products yet" description="Add products for admins to view and order." /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id}>
              <CardBody>
                {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-32 object-cover rounded-lg mb-3" />}
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{p.name}</h3>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="danger" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                {p.description && <p className="text-sm text-brand-gray-600 mt-2">{p.description}</p>}
                <p className="font-bold text-brand-orange mt-2">{formatCurrency(p.price)}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Product" : "Add Product"}>
        <form onSubmit={save} className="space-y-4">
          <div><Label required>Product Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label required>Price (GHS)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
          <div><Label>Phone Number</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div>
            <Label>Product Images</Label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>Upload Image</Button>
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((img, i) => <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded border" />)}
            </div>
          </div>
          <Button type="submit" className="w-full">{editing ? "Update Product" : "Add Product"}</Button>
        </form>
      </Modal>
    </div>
  );
}
