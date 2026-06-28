"use client";

import { useState } from "react";
import { Mail, Phone } from "lucide-react";

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"email" | "sms">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          method,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(
        method === "email"
          ? "Check your email for password reset instructions"
          : "Check your SMS for the reset code"
      );
      setEmail("");
      onSuccess?.();
    } catch (err) {
      setError("Failed to send reset request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Reset Method</label>
        <div className="space-y-3">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: method === "email" ? "#2563eb" : "#e5e7eb" }}>
            <input
              type="radio"
              name="method"
              value="email"
              checked={method === "email"}
              onChange={(e) => setMethod(e.target.value as "email" | "sms")}
              className="w-4 h-4"
            />
            <Mail className="ml-3 w-5 h-5" />
            <div className="ml-3">
              <p className="font-medium">Email</p>
              <p className="text-sm text-gray-600">Receive a password reset link</p>
            </div>
          </label>

          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: method === "sms" ? "#2563eb" : "#e5e7eb" }}>
            <input
              type="radio"
              name="method"
              value="sms"
              checked={method === "sms"}
              onChange={(e) => setMethod(e.target.value as "email" | "sms")}
              className="w-4 h-4"
            />
            <Phone className="ml-3 w-5 h-5" />
            <div className="ml-3">
              <p className="font-medium">SMS</p>
              <p className="text-sm text-gray-600">Receive a reset code via text</p>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
      >
        {loading ? "Sending..." : "Send Reset " + (method === "email" ? "Email" : "Code")}
      </button>
    </form>
  );
}
