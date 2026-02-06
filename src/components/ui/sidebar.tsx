"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Warehouse,
  Sprout,
  Wrench,
  PawPrint,
  CalendarCheck,
  Droplets,
  Cloud,
  ShieldCheck,
  Menu,
  X,
  Leaf,
  ChevronLeft,
  Settings,
  Bell,
  Lock,
} from "lucide-react";
import { SyncIndicator } from "@/components/ui/sync-indicator";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/dashboard/storage", icon: Warehouse },
  { name: "Garden", href: "/dashboard/garden", icon: Sprout },
  { name: "Equipment", href: "/dashboard/equipment", icon: Wrench },
  { name: "Livestock", href: "/dashboard/livestock", icon: PawPrint },
  { name: "Tasks", href: "/dashboard/tasks", icon: CalendarCheck },
  { name: "Resources", href: "/dashboard/resources", icon: Droplets },
  { name: "Weather", href: "/dashboard/weather", icon: Cloud },
  { name: "Emergency Prep", href: "/dashboard/preparedness", icon: ShieldCheck },
];

const secondaryNavigation = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

export function Sidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-soil-800 text-soil-100 hover:bg-soil-700 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-soil-900 text-soil-100 transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-soil-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-white whitespace-nowrap">
                HomesteadHub
              </span>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-soil-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className={cn("mb-2", collapsed ? "px-2" : "px-3")}>
            {!collapsed && (
              <span className="text-xs font-semibold text-soil-500 uppercase tracking-wider">
                Modules
              </span>
            )}
          </div>

          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-forest-600 text-white shadow-lg shadow-forest-900/50"
                    : "text-soil-300 hover:bg-soil-800 hover:text-white"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-transform",
                    isActive ? "text-white" : "text-soil-400 group-hover:text-white",
                    !isActive && "group-hover:scale-110"
                  )}
                />
                {!collapsed && (
                  <span className="font-medium truncate">{item.name}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-4 border-t border-soil-800" />

          {/* Secondary navigation */}
          <div className={cn("mb-2", collapsed ? "px-2" : "px-3")}>
            {!collapsed && (
              <span className="text-xs font-semibold text-soil-500 uppercase tracking-wider">
                System
              </span>
            )}
          </div>

          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            const isNotifications = item.name === "Notifications";

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-soil-800 text-white"
                    : "text-soil-400 hover:bg-soil-800 hover:text-soil-200"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium truncate">{item.name}</span>
                )}
                {isNotifications && unreadCount > 0 && (
                  <span className={cn(
                    "ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center",
                    collapsed && "absolute top-1 right-1 px-1 py-0 min-w-[0.5rem] h-2 w-2 p-0"
                  )}>
                    {!collapsed ? unreadCount : ""}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button (desktop only) */}
        <div className="hidden lg:block px-3 py-4 border-t border-soil-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-lg text-soil-400 hover:bg-soil-800 hover:text-white transition-colors"
          >
            <ChevronLeft
              className={cn(
                "w-5 h-5 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>

        {/* User area with Lock button */}
        <div className="px-3 py-4 border-t border-soil-800 space-y-2">

          {/* Sync Indicator */}
          {!collapsed && (
            <div className="flex justify-center pb-2">
              <SyncIndicator />
            </div>
          )}

          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg bg-soil-800/50",
              collapsed && "justify-center"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-forest-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-white">H</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Homesteader
                </p>
                <p className="text-xs text-soil-400 truncate">Local Admin</p>
              </div>
            )}
          </div>

          {/* Lock button */}
          <button
            onClick={async () => {
              const { logout } = await import("@/actions/auth");
              await logout();
              window.location.href = "/login";
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-soil-400 hover:bg-soil-800 hover:text-barn-400 transition-colors w-full",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Lock" : undefined}
          >
            <Lock className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Lock</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export function SidebarLayout({ children, unreadCount }: { children: React.ReactNode; unreadCount?: number }) {
  return (
    <div className="min-h-screen bg-soil-100">
      <Sidebar unreadCount={unreadCount} />

      {/* Main content area - offset by sidebar width */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Top bar for mobile */}
        <header className="lg:hidden h-16 bg-white border-b border-soil-200 flex items-center justify-center px-4">
          <span className="text-lg font-bold text-soil-800">HomesteadHub</span>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
