import { AuthForm } from "@/components/auth/AuthForm";

export default function AdminLoginPage() {
  return <AuthForm mode="login" role="ADMIN" roleLabel="Administrator" />;
}
