"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardBody, StatusBadge, Button, Select, Label, Input, Textarea, Modal } from "@/components/ui";
import { ArrowLeft, UserPlus } from "lucide-react";
import { formatDate, formatCurrency, PROJECT_STATUS_LABELS } from "@/lib/utils";

export default function AdminProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Record<string, unknown> | null>(null);
  const [workers, setWorkers] = useState<Array<{ id: string; user: { firstName: string; lastName: string }; skills: string[]; status: string }>>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [showSurvey, setShowSurvey] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [surveyForm, setSurveyForm] = useState({ surveyDate: "", notes: "", requirements: "", conductedBy: "" });
  const [quoteForm, setQuoteForm] = useState({ laborCost: "", materialCost: "", otherCosts: "", notes: "" });

  const fetchProject = () => {
    fetch(`/api/projects/${params.id}`).then((r) => r.json()).then(setProject);
  };

  useEffect(() => { fetchProject(); fetch("/api/workers?status=APPROVED").then((r) => r.json()).then(setWorkers); }, [params.id]);

  if (!project) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" /></div>;

  const p = project as {
    id: string; title: string; description: string; location: string; serviceType: string;
    status: string; contractPrice: number | null; createdAt: string; images: string[];
    customer: { user: { firstName: string; lastName: string; email: string; phone: string } };
    surveys: Array<{ id: string; surveyDate: string; notes: string; requirements: string }>;
    quotations: Array<{ id: string; totalAmount: number; status: string; laborCost: number; materialCost: number }>;
    assignments: Array<{ id: string; status: string; worker: { user: { firstName: string; lastName: string } } }>;
  };

  const publishToWorkers = async () => {
    await fetch(`/api/projects/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "OPEN_FOR_WORKERS" }) });
    fetchProject();
  };

  const reviewApplication = async (assignmentId: string, status: string) => {
    await fetch("/api/assignments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: assignmentId, status }) });
    fetchProject();
  };

  const updateStatus = async (status: string) => {
    await fetch(`/api/projects/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchProject();
  };

  const assignWorker = async () => {
    await fetch("/api/assignments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: p.id, workerId: selectedWorker }) });
    setShowAssign(false);
    fetchProject();
  };

  const createSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/surveys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...surveyForm, projectId: p.id }) });
    setShowSurvey(false);
    fetchProject();
  };

  const createQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/quotations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...quoteForm, projectId: p.id }) });
    setShowQuote(false);
    fetchProject();
  };

  const sendQuote = async (quoteId: string) => {
    await fetch("/api/quotations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: quoteId, status: "SENT" }) });
    fetchProject();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/projects" className="p-2 rounded-lg hover:bg-brand-gray-200"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-brand-gray-900">{p.title}</h1>
          <p className="text-brand-gray-500 text-sm">{p.location}</p>
        </div>
        <StatusBadge status={p.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Project Details" />
            <CardBody className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-brand-gray-500">Service:</span> <span className="ml-2 font-medium">{p.serviceType}</span></div>
                <div><span className="text-brand-gray-500">Created:</span> <span className="ml-2">{formatDate(p.createdAt)}</span></div>
                <div><span className="text-brand-gray-500">Price:</span> <span className="ml-2 font-medium">{p.contractPrice ? formatCurrency(p.contractPrice) : "Not set"}</span></div>
                <div><span className="text-brand-gray-500">Customer:</span> <span className="ml-2">{p.customer.user.firstName} {p.customer.user.lastName}</span></div>
              </div>
              <p className="text-sm text-brand-gray-600 mt-4">{p.description}</p>
              {p.images?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-brand-gray-700 mb-2">Customer Uploaded Images</p>
                  <div className="flex gap-2 flex-wrap">
                    {p.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                        <img src={img} alt={`Project image ${i + 1}`} className="w-28 h-28 rounded-lg object-cover border hover:opacity-90" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Surveys" action={<Button size="sm" onClick={() => setShowSurvey(true)}>Add Survey</Button>} />
            <CardBody>
              {p.surveys.length === 0 ? <p className="text-sm text-brand-gray-500">No surveys recorded yet.</p> : (
                p.surveys.map((s) => (
                  <div key={s.id} className="border-b border-brand-gray-100 pb-3 mb-3 last:border-0">
                    <p className="text-sm font-medium">{formatDate(s.surveyDate)}</p>
                    <p className="text-sm text-brand-gray-600 mt-1">{s.notes}</p>
                    {s.requirements && <p className="text-xs text-brand-gray-400 mt-1">Requirements: {s.requirements}</p>}
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Quotations" action={<Button size="sm" onClick={() => setShowQuote(true)}>Create Quote</Button>} />
            <CardBody>
              {p.quotations.length === 0 ? <p className="text-sm text-brand-gray-500">No quotations yet.</p> : (
                p.quotations.map((q) => (
                  <div key={q.id} className="flex items-center justify-between border-b border-brand-gray-100 pb-3 mb-3 last:border-0">
                    <div>
                      <p className="font-medium">{formatCurrency(q.totalAmount)}</p>
                      <p className="text-xs text-brand-gray-400">Labor: {formatCurrency(q.laborCost)} | Materials: {formatCurrency(q.materialCost)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={q.status} />
                      {q.status === "DRAFT" && <Button size="sm" onClick={() => sendQuote(q.id)}>Send to Customer</Button>}
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Worker Applications & Assignments" action={
              <div className="flex gap-2">
                {p.status === "QUOTATION_APPROVED" && <Button size="sm" onClick={publishToWorkers}>Publish to Workers</Button>}
                <Button size="sm" onClick={() => setShowAssign(true)} className="gap-1"><UserPlus className="w-4 h-4" /> Assign</Button>
              </div>
            } />
            <CardBody>
              {p.assignments.length === 0 ? <p className="text-sm text-brand-gray-500">No worker applications yet.</p> : (
                p.assignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-brand-gray-100 last:border-0">
                    <span className="text-sm">{a.worker.user.firstName} {a.worker.user.lastName}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.status} />
                      {a.status === "PENDING" && (
                        <>
                          <Button size="sm" onClick={() => reviewApplication(a.id, "ASSIGNED")}>Approve</Button>
                          <Button size="sm" variant="danger" onClick={() => reviewApplication(a.id, "REJECTED")}>Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Update Status" />
            <CardBody>
              <Select value={p.status} onChange={(e) => updateStatus(e.target.value)} className="mb-3">
                {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Customer Contact" />
            <CardBody className="text-sm space-y-2">
              <p><span className="text-brand-gray-500">Name:</span> {p.customer.user.firstName} {p.customer.user.lastName}</p>
              <p><span className="text-brand-gray-500">Email:</span> {p.customer.user.email}</p>
              <p><span className="text-brand-gray-500">Phone:</span> {p.customer.user.phone || "N/A"}</p>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title="Assign Worker">
        <div className="space-y-4">
          <div><Label>Select Worker</Label>
            <Select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)}>
              <option value="">Choose a worker</option>
              {workers.map((w) => <option key={w.id} value={w.id}>{w.user.firstName} {w.user.lastName}</option>)}
            </Select>
          </div>
          <Button onClick={assignWorker} disabled={!selectedWorker} className="w-full">Assign Worker</Button>
        </div>
      </Modal>

      <Modal isOpen={showSurvey} onClose={() => setShowSurvey(false)} title="Record Survey">
        <form onSubmit={createSurvey} className="space-y-4">
          <div><Label required>Survey Date</Label><Input type="date" value={surveyForm.surveyDate} onChange={(e) => setSurveyForm({ ...surveyForm, surveyDate: e.target.value })} required /></div>
          <div><Label>Conducted By</Label><Input value={surveyForm.conductedBy} onChange={(e) => setSurveyForm({ ...surveyForm, conductedBy: e.target.value })} /></div>
          <div><Label>Notes</Label><Textarea value={surveyForm.notes} onChange={(e) => setSurveyForm({ ...surveyForm, notes: e.target.value })} /></div>
          <div><Label>Requirements</Label><Textarea value={surveyForm.requirements} onChange={(e) => setSurveyForm({ ...surveyForm, requirements: e.target.value })} /></div>
          <Button type="submit" className="w-full">Save Survey</Button>
        </form>
      </Modal>

      <Modal isOpen={showQuote} onClose={() => setShowQuote(false)} title="Create Quotation">
        <form onSubmit={createQuote} className="space-y-4">
          <div><Label required>Labor Cost</Label><Input type="number" value={quoteForm.laborCost} onChange={(e) => setQuoteForm({ ...quoteForm, laborCost: e.target.value })} required /></div>
          <div><Label required>Material Cost</Label><Input type="number" value={quoteForm.materialCost} onChange={(e) => setQuoteForm({ ...quoteForm, materialCost: e.target.value })} required /></div>
          <div><Label>Other Costs</Label><Input type="number" value={quoteForm.otherCosts} onChange={(e) => setQuoteForm({ ...quoteForm, otherCosts: e.target.value })} /></div>
          <div><Label>Notes</Label><Textarea value={quoteForm.notes} onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })} /></div>
          <Button type="submit" className="w-full">Create Quotation</Button>
        </form>
      </Modal>
    </div>
  );
}
