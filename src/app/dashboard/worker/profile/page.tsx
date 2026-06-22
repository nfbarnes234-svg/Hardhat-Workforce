"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Button, Label, Input, Textarea, Select, EmptyState } from "@/components/ui";
import { WORKER_SKILLS } from "@/lib/utils";

export default function WorkerProfilePage() {
  const [profile, setProfile] = useState<{ id: string; bio: string; skills: string[]; experience: number; hourlyRate: number; availability: string; status: string } | null>(null);
  const [form, setForm] = useState({ bio: "", experience: "", hourlyRate: "", availability: "available" });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/workers").then((r) => r.json()).then((workers) => {
      const me = workers[0];
      if (me) {
        setProfile(me);
        setForm({ bio: me.bio || "", experience: String(me.experience), hourlyRate: String(me.hourlyRate || ""), availability: me.availability });
        setSelectedSkills(me.skills || []);
      }
    });
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    await fetch("/api/workers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: profile.id, ...form, skills: selectedSkills }),
    });
    setSaving(false);
  };

  if (!profile) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-brand-gray-500 text-sm">Update your worker profile and skills</p>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Experience (years)</Label><Input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></div>
            <div><Label>Hourly Rate (GHS)</Label><Input type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} /></div>
          </div>
          <div><Label>Availability</Label>
            <Select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </Select>
          </div>
          <div>
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {WORKER_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedSkills.includes(skill) ? "bg-brand-orange text-white" : "bg-brand-gray-100 text-brand-gray-600 hover:bg-brand-gray-200"}`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={save} loading={saving} className="w-full">Save Profile</Button>
        </CardBody>
      </Card>
    </div>
  );
}
