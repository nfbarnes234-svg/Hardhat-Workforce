"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const variants = {
      primary: "bg-brand-orange hover:bg-brand-orange-dark text-white shadow-sm",
      secondary: "bg-brand-black hover:bg-brand-gray-800 text-white",
      outline: "border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white",
      ghost: "text-brand-gray-600 hover:bg-brand-gray-200 hover:text-brand-gray-900",
      danger: "bg-red-600 hover:bg-red-700 text-white",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-brand-gray-300 bg-white px-3 py-2 text-sm text-brand-gray-900 placeholder:text-brand-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-colors",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-brand-gray-300 bg-white px-3 py-2 text-sm text-brand-gray-900 placeholder:text-brand-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-colors resize-y min-h-[80px]",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-brand-gray-300 bg-white px-3 py-2 text-sm text-brand-gray-900 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export function Label({ children, htmlFor, required }: { children: React.ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-brand-gray-700 mb-1">
      {children}
      {required && <span className="text-brand-orange ml-0.5">*</span>}
    </label>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-xl border border-brand-gray-200 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray-200">
      <div>
        <h3 className="text-lg font-semibold text-brand-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-brand-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" }) {
  const variants = {
    default: "bg-brand-gray-100 text-brand-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant])}>
      {children}
    </span>
  );
}

export function StatCard({ title, value, icon, trend, color = "orange" }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: "orange" | "black" | "green" | "blue";
}) {
  const colors = {
    orange: "bg-brand-orange/10 text-brand-orange",
    black: "bg-brand-gray-900/10 text-brand-gray-900",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
  };
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-brand-gray-500">{title}</p>
          <p className="text-2xl font-bold text-brand-gray-900 mt-1">{value}</p>
          {trend && <p className="text-xs text-brand-gray-400 mt-1">{trend}</p>}
        </div>
        <div className={cn("p-3 rounded-lg", colors[color])}>{icon}</div>
      </div>
    </Card>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-brand-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-brand-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-brand-gray-900">{title}</h3>
      {description && <p className="text-sm text-brand-gray-500 mt-1 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray-200">
          <h2 className="text-lg font-semibold text-brand-gray-900">{title}</h2>
          <button onClick={onClose} className="text-brand-gray-400 hover:text-brand-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
    REQUEST_SUBMITTED: { label: "Submitted", variant: "info" },
    UNDER_REVIEW: { label: "Under Review", variant: "warning" },
    SURVEY_SCHEDULED: { label: "Survey Scheduled", variant: "info" },
    SURVEY_COMPLETED: { label: "Survey Done", variant: "info" },
    MATERIALS_ORDERED: { label: "Materials Ordered", variant: "info" },
    QUOTATION_SENT: { label: "Quotation Sent", variant: "warning" },
    QUOTATION_APPROVED: { label: "Approved", variant: "success" },
    QUOTATION_REJECTED: { label: "Rejected", variant: "danger" },
    OPEN_FOR_WORKERS: { label: "Open", variant: "info" },
    WORKERS_ASSIGNED: { label: "Assigned", variant: "warning" },
    IN_PROGRESS: { label: "In Progress", variant: "warning" },
    COMPLETED: { label: "Completed", variant: "success" },
    ARCHIVED: { label: "Archived", variant: "default" },
    CANCELLED: { label: "Cancelled", variant: "danger" },
    PENDING: { label: "Pending", variant: "warning" },
    APPROVED: { label: "Approved", variant: "success" },
    REJECTED: { label: "Rejected", variant: "danger" },
    ACCEPTED: { label: "Accepted", variant: "success" },
    ASSIGNED: { label: "Assigned", variant: "info" },
    DRAFT: { label: "Draft", variant: "default" },
    SENT: { label: "Sent", variant: "info" },
    CONFIRMED: { label: "Confirmed", variant: "success" },
    DELIVERED: { label: "Delivered", variant: "success" },
  };
  const config = statusMap[status] || { label: status.replace(/_/g, " "), variant: "default" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
