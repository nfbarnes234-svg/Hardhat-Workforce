"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, StatusBadge, Button, EmptyState } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetch("/api/quotations").then((r) => r.json()).then(setQuotations);
  }, []);

  const sendQuote = async (id: string) => {
    await fetch("/api/quotations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "SENT" }) });
    fetch("/api/quotations").then((r) => r.json()).then(setQuotations);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quotations</h1>
        <p className="text-brand-gray-500 text-sm">Manage project quotations</p>
      </div>
      {quotations.length === 0 ? <EmptyState title="No quotations" /> : (
        <div className="space-y-3">
          {quotations.map((q) => {
            const quote = q as { id: string; totalAmount: number; status: string; createdAt: string; project: { title: string } };
            return (
              <Card key={quote.id}>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{quote.project.title}</p>
                    <p className="text-sm text-brand-gray-400">{formatDate(quote.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatCurrency(quote.totalAmount)}</span>
                    <StatusBadge status={quote.status} />
                    {quote.status === "DRAFT" && <Button size="sm" onClick={() => sendQuote(quote.id)}>Send</Button>}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
