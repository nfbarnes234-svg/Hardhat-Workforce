"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, StatusBadge, Button, EmptyState } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomerQuotationsPage() {
  const [quotations, setQuotations] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetch("/api/quotations").then((r) => r.json()).then(setQuotations);
  }, []);

  const respond = async (id: string, status: string) => {
    await fetch("/api/quotations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    fetch("/api/quotations").then((r) => r.json()).then(setQuotations);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quotations</h1>
        <p className="text-brand-gray-500 text-sm">Review and respond to project quotations</p>
      </div>
      {quotations.length === 0 ? <EmptyState title="No quotations yet" /> : (
        <div className="space-y-4">
          {quotations.map((q) => {
            const quote = q as { id: string; totalAmount: number; status: string; createdAt: string; laborCost: number; materialCost: number; project: { title: string } };
            return (
              <Card key={quote.id}>
                <CardBody>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{quote.project.title}</h3>
                      <p className="text-2xl font-bold text-brand-orange mt-1">{formatCurrency(quote.totalAmount)}</p>
                      <p className="text-xs text-brand-gray-400 mt-1">{formatDate(quote.createdAt)}</p>
                    </div>
                    <StatusBadge status={quote.status} />
                  </div>
                  {quote.status === "SENT" && (
                    <div className="flex gap-3 mt-4">
                      <Button onClick={() => respond(quote.id, "APPROVED")} className="flex-1">Approve</Button>
                      <Button variant="danger" onClick={() => respond(quote.id, "REJECTED")} className="flex-1">Reject</Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
