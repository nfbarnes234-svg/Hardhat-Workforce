import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "SUPPLIER") redirect("/login/supplier");
  return (
    <DashboardLayout role="SUPPLIER" userName={`${session.firstName} ${session.lastName}`}>
      {children}
    </DashboardLayout>
  );
}
