"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { HardHat } from "lucide-react";
import type { UserRole } from "@prisma/client";

interface AuthFormProps {
  mode: "login" | "register";
  role: UserRole;
  roleLabel: string;
}

export function AuthForm({ mode, role, roleLabel }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
    companyName: "",
    address: "",
    city: "",
    postcode: "",
    bio: "",
    passportPhoto: "",
    faceImage: "",
    category: "Other Categories",
    skills: [] as string[],
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "passportPhoto" | "faceImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({ ...prev, [field]: data.url }));
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "register") {
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      if (role === "WORKER" && (!form.passportPhoto || !form.faceImage)) {
        setError("Passport photo and face image are required");
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push(data.redirectTo);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-brand-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-brand-gray-900">Hardhat Workforce</span>
          </Link>
          <h1 className="text-2xl font-bold text-brand-gray-900">
            {mode === "login" ? "Sign In" : "Create Account"}
          </h1>
          <p className="text-brand-gray-500 mt-1">{roleLabel} Portal</p>
        </div>

        <div className="bg-white rounded-xl border border-brand-gray-200 shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName" required>First Name</Label>
                    <Input id="firstName" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="lastName" required>Last Name</Label>
                    <Input id="lastName" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="username" required>Username</Label>
                  <Input id="username" value={form.username} onChange={(e) => update("username", e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="phone" required>Phone Number</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
                </div>
                {role === "CUSTOMER" && (
                  <>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" value={form.company} onChange={(e) => update("company", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} />
                    </div>
                  </>
                )}
                {role === "SUPPLIER" && (
                  <>
                    <div>
                      <Label htmlFor="companyName" required>Company Name</Label>
                      <Input id="companyName" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="category" required>Supplier Category</Label>
                      <select id="category" value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full rounded-lg border border-brand-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange" required>
                        <option value="Building Materials">Building Materials</option>
                        <option value="Electrical Supplies">Electrical Supplies</option>
                        <option value="Plumbing Supplies">Plumbing Supplies</option>
                        <option value="Paint Suppliers">Paint Suppliers</option>
                        <option value="Carpentry Materials">Carpentry Materials</option>
                        <option value="Other Categories">Other Categories</option>
                      </select>
                    </div>
                  </>
                )}
                {role === "WORKER" && (
                  <>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Tell us about your experience..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="passportPhoto" required>Passport Photo</Label>
                        <input id="passportPhoto" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "passportPhoto")} required className="block w-full text-xs text-brand-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-orange/10 file:text-brand-orange hover:file:bg-brand-orange/20" />
                        {form.passportPhoto && <img src={form.passportPhoto} className="w-16 h-16 object-cover rounded mt-2 border" />}
                      </div>
                      <div>
                        <Label htmlFor="faceImage" required>Face Image</Label>
                        <input id="faceImage" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "faceImage")} required className="block w-full text-xs text-brand-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-orange/10 file:text-brand-orange hover:file:bg-brand-orange/20" />
                        {form.faceImage && <img src={form.faceImage} className="w-16 h-16 object-cover rounded mt-2 border" />}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <Label htmlFor="email" required>{mode === "login" ? "Email or Username" : "Email Address"}</Label>
              <Input id="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password" required>Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} />
            </div>
            {mode === "register" && (
              <div>
                <Label htmlFor="confirmPassword" required>Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required minLength={6} />
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 flex flex-col items-center justify-between gap-2 text-sm text-brand-gray-500">
            {mode === "login" && (
              <Link href="/forgot-password" className="text-brand-orange hover:underline font-medium">
                Forgot Password?
              </Link>
            )}
            <p className="text-center mt-2">
              {mode === "login" ? (
                role !== "ADMIN" && role !== "SUPPLIER" && role !== "SUPERADMIN" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <Link href={`/register/${role.toLowerCase()}`} className="text-brand-orange hover:underline font-medium">
                      Register
                    </Link>
                  </>
                ) : null
              ) : (
                <>
                  Already have an account?{" "}
                  <Link href={`/login/${role.toLowerCase()}`} className="text-brand-orange hover:underline font-medium">
                    Sign In
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-brand-gray-400 mt-4">
          <Link href="/" className="hover:text-brand-orange transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
