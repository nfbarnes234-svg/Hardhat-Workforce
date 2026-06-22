"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Button, Label, Input, StatusBadge } from "@/components/ui";

interface ProfileData {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
}

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", username: "", password: "", currentPassword: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/users/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setProfile(data);
          setForm({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || "",
            username: data.username,
            password: "",
            currentPassword: "",
          });
        }
      });
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setProfile((prev) => (prev ? { ...prev, ...data } : prev));
      setForm((f) => ({ ...f, password: "", currentPassword: "" }));
      setMessage("Profile updated successfully.");
    } else {
      setMessage(data.error || "Update failed.");
    }
    setSaving(false);
  };

  if (!profile) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-brand-gray-500 text-sm">View and update your account information</p>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-brand-gray-500">Full Name:</span> <span className="ml-2 font-medium">{profile.firstName} {profile.lastName}</span></div>
            <div><span className="text-brand-gray-500">Role:</span> <span className="ml-2 capitalize">{profile.role.toLowerCase().replace("_", " ")}</span></div>
            <div><span className="text-brand-gray-500">Email:</span> <span className="ml-2">{profile.email}</span></div>
            <div className="flex items-center gap-2"><span className="text-brand-gray-500">Status:</span> <StatusBadge status={profile.isActive ? "APPROVED" : "REJECTED"} /></div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          {message && <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>First Name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
            <div><Label>Last Name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
          </div>
          <div><Label>Phone Number</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
          <div><Label>New Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank to keep current" /></div>
          {form.password && (
            <div><Label required>Current Password</Label><Input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /></div>
          )}
          <Button onClick={save} loading={saving} className="w-full">Save Changes</Button>
        </CardBody>
      </Card>
    </div>
  );
}
