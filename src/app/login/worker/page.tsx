import { AuthForm } from "@/components/auth/AuthForm";

export default function WorkerLoginPage() {
  return <AuthForm mode="login" role="WORKER" roleLabel="Worker" />;
}
