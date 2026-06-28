import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Set New Password</h1>
          <p className="text-center text-gray-600 mb-8">
            Create a strong password for your account
          </p>

          <ResetPasswordForm />

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              <Link href="/login/customer" className="text-blue-600 hover:underline">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
