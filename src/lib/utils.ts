import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function parseJsonArray<T>(json: string, fallback: T[] = []): T[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function generateOrderNumber(): string {
  const prefix = "PO";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const SERVICE_TYPES = [
  "Painting",
  "Tiling",
  "Carpentry",
  "Masonry",
  "Electrical Installation",
  "Plumbing",
  "Roofing",
  "Flooring",
  "Drywall",
  "General Maintenance",
] as const;

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  REQUEST_SUBMITTED: "Request Submitted",
  UNDER_REVIEW: "Under Review",
  SURVEY_SCHEDULED: "Survey Scheduled",
  SURVEY_COMPLETED: "Survey Completed",
  MATERIALS_ORDERED: "Materials Ordered",
  QUOTATION_SENT: "Quotation Sent",
  QUOTATION_APPROVED: "Quotation Approved",
  QUOTATION_REJECTED: "Quotation Rejected",
  OPEN_FOR_WORKERS: "Open for Workers",
  WORKERS_ASSIGNED: "Workers Assigned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
  CANCELLED: "Cancelled",
};

export const SUPPLIER_CATEGORIES = [
  "Building Materials",
  "Electrical Supplies",
  "Plumbing Supplies",
  "Paint Suppliers",
  "Carpentry Materials",
  "Other Categories",
] as const;

export const WORKER_SKILLS = [
  "Painting",
  "Tiling",
  "Carpentry",
  "Masonry",
  "Electrical",
  "Plumbing",
  "Roofing",
  "Flooring",
  "Drywall",
  "Demolition",
  "Scaffolding",
  "Welding",
  "HVAC",
  "Landscaping",
] as const;
