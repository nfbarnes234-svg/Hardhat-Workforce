"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Button, EmptyState } from "@/components/ui";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Survey {
  id: string;
  rating: number;
  feedback: string;
  published: boolean;
  createdAt: string;
  project: { title: string; customer: { user: { firstName: string; lastName: string } } };
}

export default function AdminTestimonialsPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);

  const load = () => fetch("/api/satisfaction-surveys").then((r) => r.json()).then(setSurveys);

  useEffect(() => { load(); }, []);

  const togglePublish = async (id: string, published: boolean) => {
    await fetch("/api/satisfaction-surveys", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, published: !published }),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Satisfaction Surveys & Testimonials</h1>
        <p className="text-brand-gray-500 text-sm">Review customer feedback and publish testimonials to the homepage</p>
      </div>
      {surveys.length === 0 ? <EmptyState title="No satisfaction surveys yet" /> : (
        <div className="space-y-4">
          {surveys.map((s) => (
            <Card key={s.id}>
              <CardBody>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium">{s.project.title}</p>
                    <p className="text-sm text-brand-gray-500">{s.project.customer.user.firstName} {s.project.customer.user.lastName} • {formatDate(s.createdAt)}</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: s.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-brand-orange text-brand-orange" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-brand-gray-600 mb-4">&ldquo;{s.feedback}&rdquo;</p>
                <Button size="sm" variant={s.published ? "outline" : "primary"} onClick={() => togglePublish(s.id, s.published)}>
                  {s.published ? "Unpublish from Homepage" : "Publish to Homepage"}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
