import { AuthForm } from "@/components/auth/AuthForm";

export default function CustomerLoginPage() {
  return <AuthForm mode="login" role="CUSTOMER" roleLabel="Customer" />;
}
