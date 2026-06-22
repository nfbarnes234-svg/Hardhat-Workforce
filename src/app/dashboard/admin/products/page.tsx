"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-brand-gray-500 text-sm">All supplier products across the platform</p>
      </div>
      {products.length === 0 ? <EmptyState title="No products" /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const product = p as { id: string; name: string; description: string; price: number; phone: string; images: string[]; supplier: { companyName: string; category: string } };
            return (
              <Card key={product.id}>
                <CardBody>
                  {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-3" />}
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-brand-gray-500">{product.supplier.companyName} • {product.supplier.category}</p>
                  {product.description && <p className="text-sm text-brand-gray-600 mt-2">{product.description}</p>}
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-bold text-brand-orange">{formatCurrency(product.price)}</span>
                    {product.phone && <span className="text-xs text-brand-gray-400">{product.phone}</span>}
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
