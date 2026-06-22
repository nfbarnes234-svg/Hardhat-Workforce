import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") redirect("/login/customer");
  return (
    <DashboardLayout role="CUSTOMER" userName={`${session.firstName} ${session.lastName}`}>
      {children}
    </DashboardLayout>
  );
}
