"use client";

import { Card, CardBody, EmptyState } from "@/components/ui";

export default function SupplierMaterialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Materials Catalog</h1>
        <p className="text-brand-gray-500 text-sm">Manage your material inventory and pricing</p>
      </div>
      <Card>
        <CardBody>
          <EmptyState title="Materials catalog coming soon" description="You'll be able to manage your material inventory and pricing here." />
        </CardBody>
      </Card>
    </div>
  );
}
