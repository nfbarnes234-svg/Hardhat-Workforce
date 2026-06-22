"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardBody, StatusBadge, Button, Label, Textarea, Select } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function CustomerProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Record<string, unknown> | null>(null);
  const [surveyForm, setSurveyForm] = useState({ rating: "5", feedback: "" });
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${params.id}`).then((r) => r.json()).then(setProject);
  }, [params.id]);

  const respondToQuote = async (quoteId: string, status: string) => {
    await fetch("/api/quotations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: quoteId, status }) });
    fetch(`/api/projects/${params.id}`).then((r) => r.json()).then(setProject);
  };

  const submitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/satisfaction-surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: params.id, ...surveyForm }),
    });
    if (res.ok) setSurveySubmitted(true);
    else { const data = await res.json(); alert(data.error); }
  };

  if (!project) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" /></div>;

  const p = project as {
    title: string; description: string; location: string; serviceType: string; status: string; createdAt: string; images: string[];
    quotations: Array<{ id: string; totalAmount: number; status: string; laborCost: number; materialCost: number; otherCosts: number; notes: string }>;
    assignments: Array<{ status: string; worker: { user: { firstName: string; lastName: string } }; progress: number }>;
    satisfactionSurvey?: { id: string } | null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/customer/projects" className="p-2 rounded-lg hover:bg-brand-gray-200"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{p.title}</h1>
          <p className="text-brand-gray-500 text-sm">{p.location}</p>
        </div>
        <StatusBadge status={p.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Project Details" />
            <CardBody>
              <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
                <div><span className="text-brand-gray-500">Service:</span> <span className="ml-2">{p.serviceType}</span></div>
                <div><span className="text-brand-gray-500">Submitted:</span> <span className="ml-2">{formatDate(p.createdAt)}</span></div>
              </div>
              <p className="text-sm text-brand-gray-600">{p.description}</p>
              {p.images.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {p.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-24 h-24 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {p.quotations.length > 0 && (
            <Card>
              <CardHeader title="Quotations" />
              <CardBody>
                {p.quotations.map((q) => (
                  <div key={q.id} className="border-b border-brand-gray-100 pb-4 mb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-2xl font-bold">{formatCurrency(q.totalAmount)}</p>
                        <p className="text-xs text-brand-gray-400 mt-1">Labor: {formatCurrency(q.laborCost)} | Materials: {formatCurrency(q.materialCost)} | Other: {formatCurrency(q.otherCosts)}</p>
                        {q.notes && <p className="text-sm text-brand-gray-500 mt-2">{q.notes}</p>}
                      </div>
                      <StatusBadge status={q.status} />
                    </div>
                    {q.status === "SENT" && (
                      <div className="flex gap-3 mt-4">
                        <Button onClick={() => respondToQuote(q.id, "APPROVED")} className="flex-1">Approve Quotation</Button>
                        <Button variant="danger" onClick={() => respondToQuote(q.id, "REJECTED")} className="flex-1">Reject</Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {p.status === "COMPLETED" && !p.satisfactionSurvey && !surveySubmitted && (
            <Card>
              <CardHeader title="Satisfaction Survey" />
              <CardBody>
                <p className="text-sm text-brand-gray-600 mb-4">Your project is complete! Please share your feedback.</p>
                <form onSubmit={submitSurvey} className="space-y-4">
                  <div>
                    <Label required>Rating</Label>
                    <Select value={surveyForm.rating} onChange={(e) => setSurveyForm({ ...surveyForm, rating: e.target.value })} required>
                      {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label required>Your Feedback</Label>
                    <Textarea value={surveyForm.feedback} onChange={(e) => setSurveyForm({ ...surveyForm, feedback: e.target.value })} required rows={4} placeholder="Tell us about your experience..." />
                  </div>
                  <Button type="submit" className="w-full">Submit Survey</Button>
                </form>
              </CardBody>
            </Card>
          )}

          {(p.satisfactionSurvey || surveySubmitted) && (
            <Card>
              <CardBody>
                <p className="text-sm text-green-600 font-medium">Thank you! Your satisfaction survey has been submitted.</p>
              </CardBody>
            </Card>
          )}

          {p.assignments.length > 0 && (
            <Card>
              <CardHeader title="Assigned Workers" />
              <CardBody>
                {p.assignments.map((a, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <span>{a.worker.user.firstName} {a.worker.user.lastName}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-brand-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-orange rounded-full" style={{ width: `${a.progress}%` }} />
                      </div>
                      <span className="text-xs text-brand-gray-400">{a.progress}%</span>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader title="Project Progress" />
          <CardBody>
            <div className="space-y-3">
              {["REQUEST_SUBMITTED", "UNDER_REVIEW", "SURVEY_COMPLETED", "QUOTATION_SENT", "QUOTATION_APPROVED", "IN_PROGRESS", "COMPLETED"].map((step) => {
                const steps = ["REQUEST_SUBMITTED", "UNDER_REVIEW", "SURVEY_COMPLETED", "QUOTATION_SENT", "QUOTATION_APPROVED", "IN_PROGRESS", "COMPLETED"];
                const currentIdx = steps.indexOf(p.status);
                const stepIdx = steps.indexOf(step);
                const isComplete = stepIdx <= currentIdx;
                const isCurrent = step === p.status;
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isComplete ? "bg-brand-orange" : "bg-brand-gray-200"} ${isCurrent ? "ring-2 ring-brand-orange ring-offset-2" : ""}`} />
                    <span className={`text-sm ${isComplete ? "text-brand-gray-900 font-medium" : "text-brand-gray-400"}`}>{step.replace(/_/g, " ")}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
