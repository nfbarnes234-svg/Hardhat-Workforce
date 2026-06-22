import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    redirect("/login/admin");
  }
  return (
    <DashboardLayout role={session.role} userName={`${session.firstName} ${session.lastName}`}>
      {children}
    </DashboardLayout>
  );
}
