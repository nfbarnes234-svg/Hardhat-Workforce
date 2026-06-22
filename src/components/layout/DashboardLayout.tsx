"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Truck,
  ClipboardList,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  HardHat,
  FileText,
  Package,
  UserCheck,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  SUPERADMIN: [
    { label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Admin Management", href: "/dashboard/admin/admins", icon: <Users className="w-5 h-5" /> },
    { label: "Projects", href: "/dashboard/admin/projects", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Surveys", href: "/dashboard/admin/surveys", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Workers", href: "/dashboard/admin/workers", icon: <UserCheck className="w-5 h-5" /> },
    { label: "Customers", href: "/dashboard/admin/customers", icon: <Users className="w-5 h-5" /> },
    { label: "Suppliers", href: "/dashboard/admin/suppliers", icon: <Truck className="w-5 h-5" /> },
    { label: "Products", href: "/dashboard/admin/products", icon: <Package className="w-5 h-5" /> },
    { label: "Orders", href: "/dashboard/admin/orders", icon: <Package className="w-5 h-5" /> },
    { label: "Quotations", href: "/dashboard/admin/quotations", icon: <FileText className="w-5 h-5" /> },
    { label: "Testimonials", href: "/dashboard/admin/testimonials", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Messages", href: "/dashboard/admin/messages", icon: <MessageSquare className="w-5 h-5" /> },
    { label: "My Profile", href: "/dashboard/admin/profile", icon: <UserCheck className="w-5 h-5" /> },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Projects", href: "/dashboard/admin/projects", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "Surveys", href: "/dashboard/admin/surveys", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Workers", href: "/dashboard/admin/workers", icon: <UserCheck className="w-5 h-5" /> },
    { label: "Customers", href: "/dashboard/admin/customers", icon: <Users className="w-5 h-5" /> },
    { label: "Suppliers", href: "/dashboard/admin/suppliers", icon: <Truck className="w-5 h-5" /> },
    { label: "Products", href: "/dashboard/admin/products", icon: <Package className="w-5 h-5" /> },
    { label: "Orders", href: "/dashboard/admin/orders", icon: <Package className="w-5 h-5" /> },
    { label: "Quotations", href: "/dashboard/admin/quotations", icon: <FileText className="w-5 h-5" /> },
    { label: "Testimonials", href: "/dashboard/admin/testimonials", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Messages", href: "/dashboard/admin/messages", icon: <MessageSquare className="w-5 h-5" /> },
    { label: "My Profile", href: "/dashboard/admin/profile", icon: <UserCheck className="w-5 h-5" /> },
  ],
  CUSTOMER: [
    { label: "Dashboard", href: "/dashboard/customer", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "My Projects", href: "/dashboard/customer/projects", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "New Request", href: "/dashboard/customer/new-request", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Quotations", href: "/dashboard/customer/quotations", icon: <FileText className="w-5 h-5" /> },
    { label: "Messages", href: "/dashboard/customer/messages", icon: <MessageSquare className="w-5 h-5" /> },
    { label: "My Profile", href: "/dashboard/customer/profile", icon: <UserCheck className="w-5 h-5" /> },
  ],
  WORKER: [
    { label: "Dashboard", href: "/dashboard/worker", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Available Jobs", href: "/dashboard/worker/jobs", icon: <FolderKanban className="w-5 h-5" /> },
    { label: "My Assignments", href: "/dashboard/worker/assignments", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "My Profile", href: "/dashboard/worker/profile", icon: <UserCheck className="w-5 h-5" /> },
  ],
  SUPPLIER: [
    { label: "Dashboard", href: "/dashboard/supplier", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Purchase Orders", href: "/dashboard/supplier/orders", icon: <Package className="w-5 h-5" /> },
    { label: "Products", href: "/dashboard/supplier/products", icon: <Package className="w-5 h-5" /> },
    { label: "Materials", href: "/dashboard/supplier/materials", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "My Profile", href: "/dashboard/supplier/profile", icon: <UserCheck className="w-5 h-5" /> },
  ],
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "SUPERADMIN" | "ADMIN" | "CUSTOMER" | "WORKER" | "SUPPLIER";
  userName: string;
}

export function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navItems = NAV_ITEMS[role] || [];

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.unreadCount || 0))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-brand-gray-100 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-black text-white flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-brand-gray-800">
          <div className="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">Hardhat Workforce</h1>
            <p className="text-xs text-brand-gray-400 capitalize">{role.toLowerCase()}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/dashboard/${role.toLowerCase()}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-orange text-white"
                    : "text-brand-gray-400 hover:bg-brand-gray-800 hover:text-white"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-brand-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-gray-400 hover:bg-brand-gray-800 hover:text-white w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-brand-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-brand-gray-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p className="text-sm text-brand-gray-500">Welcome back,</p>
              <p className="font-semibold text-brand-gray-900">{userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/${role.toLowerCase()}/notifications`} className="relative p-2 rounded-lg hover:bg-brand-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-brand-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-orange text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
