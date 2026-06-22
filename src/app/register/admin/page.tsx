import Link from "next/link";
import { Button } from "@/components/ui";

export default function AdminRegisterPage() {
  return (
    <div className="min-h-screen bg-brand-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-brand-gray-200 shadow-sm p-6 text-center">
        <h1 className="text-2xl font-bold text-brand-gray-900 mb-4">Registration Disabled</h1>
        <p className="text-brand-gray-600 mb-6">
          Administrator accounts cannot be created publicly. New administrators must be created by the Super Admin from within the dashboard.
        </p>
        <Link href="/">
          <Button className="w-full">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
