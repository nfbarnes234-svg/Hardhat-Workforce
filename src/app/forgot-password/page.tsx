"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Label } from "@/components/ui";
import { HardHat } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devCode, setDevCode] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.code) {
          setDevCode(data.code); // Display code for easy testing
        }
        setStep(2);
      } else {
        setError(data.error || "Failed to send code.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, code }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3);
      } else {
        setError(data.error || "Invalid verification code.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, code, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Password has been reset successfully. You can now log in.");
        setStep(4);
      } else {
        setError(data.error || "Password reset failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-brand-gray-900">Reset Password</h1>
          <p className="text-brand-gray-500 mt-1">Secure Account Recovery</p>
        </div>

        <div className="bg-white rounded-xl border border-brand-gray-200 shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <Label htmlFor="emailOrUsername" required>Email or Username</Label>
                <Input
                  id="emailOrUsername"
                  placeholder="Enter email or username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send Verification Code
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {devCode && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 mb-2">
                  <span className="font-semibold">Dev Mode:</span> Code is <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border">{devCode}</span> (also printed to server logs).
                </div>
              )}
              <div>
                <Label htmlFor="code" required>Verification Code</Label>
                <Input
                  id="code"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Verify Code
              </Button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-brand-gray-500 hover:text-brand-orange mt-2"
              >
                Change Email / Username
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="newPassword" required>New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" required>Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Reset Password
              </Button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center space-y-4 py-2">
              <p className="text-green-600 font-semibold">{success}</p>
              <Link href="/" className="block w-full">
                <Button className="w-full" size="lg">Go to Homepage</Button>
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-brand-gray-400 mt-4">
          <Link href="/" className="hover:text-brand-orange transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
