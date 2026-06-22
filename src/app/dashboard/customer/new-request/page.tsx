"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody, StatusBadge, Button, Label, Input, Select, Textarea, EmptyState } from "@/components/ui";
import { Upload, X } from "lucide-react";
import { SERVICE_TYPES } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({ title: "", description: "", location: "", serviceType: "" });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setImages((prev) => [...prev, data.url]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, images }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/dashboard/customer/projects/${data.id}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submit Service Request</h1>
        <p className="text-brand-gray-500 text-sm">Tell us about your project and we&apos;ll get back to you</p>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label required>Project Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Kitchen Renovation" required /></div>
            <div><Label required>Service Type</Label>
              <Select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} required>
                <option value="">Select a service</option>
                {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div><Label required>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Full address" required /></div>
            <div><Label required>Project Details</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the work needed..." rows={5} required /></div>

            <div>
              <Label>Site Photos</Label>
              <div className="mt-2 flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed border-brand-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange transition-colors">
                  <Upload className="w-5 h-5 text-brand-gray-400" />
                  <span className="text-xs text-brand-gray-400 mt-1">Upload</span>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">Submit Request</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
