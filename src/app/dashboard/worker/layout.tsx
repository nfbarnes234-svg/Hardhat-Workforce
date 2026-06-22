import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "WORKER") redirect("/login/worker");
  return (
    <DashboardLayout role="WORKER" userName={`${session.firstName} ${session.lastName}`}>
      {children}
    </DashboardLayout>
  );
}
