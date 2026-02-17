/**
 * Dashboard Page - Homestead Command Center
 *
 * The main landing page after login, providing at-a-glance visibility
 * into all critical homestead operations.
 *
 * Key Features:
 * - Quick stats cards (expiring items, urgent tasks, etc.)
 * - Priority tasks list (top 5 upcoming)
 * - Expiring items widget (next 30 days)
 * - Onboarding tour for first-time users
 *
 * Data Sources:
 * - Storage: Items expiring within 30 days
 * - Tasks: All active tasks (filtered by priority)
 * - Onboarding: Status to show/hide tour
 *
 * Server-Side Rendering:
 * This is an async Server Component that fetches data at request time.
 * Parallel fetching (Promise.all) optimizes performance.
 *
 * Layout:
 * - Wrapped in dashboard layout (sidebar navigation)
 * - Responsive grid for stats cards
 * - Two-column layout for tasks/expiring items
 *
 * Related:
 * - Layout: src/app/dashboard/layout.tsx
 * - Onboarding: src/app/dashboard/onboarding-wrapper.tsx
 * - Actions: src/actions/storage.ts, src/actions/tasks.ts
 */

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Leaf,
  Settings,
  Warehouse,
  Wrench,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { getExpiringItems } from "@/actions/storage";
import { getTasks } from "@/actions/tasks";
import { getOnboardingStatus } from "@/actions/onboarding";
import { formatDate, cn } from "@/lib/utils";
import { OnboardingWrapper } from "./onboarding-wrapper";

export default async function DashboardPage() {
  // Fetch data in parallel for optimal performance
  // Using Promise.all ensures all requests happen simultaneously
  const [expiringItems, activeTasks, onboardingStatus] = await Promise.all([
    getExpiringItems(30), // Items expiring in next 30 days
    getTasks({ status: "active" }), // All tasks not marked completed
    getOnboardingStatus(), // Check if user needs to see tour
  ]);

  // Filter and slice data for dashboard widgets
  const urgentTasks = activeTasks.filter((t) => t.priority === "urgent");
  const upcomingTasks = activeTasks.slice(0, 5); // Take top 5 due soonest

  /**
   * Quick Stats Cards Configuration
   *
   * Each stat card shows:
   * - label: Display name
   * - value: Primary metric (count or status)
   * - change: Subtitle/context
   * - icon: Lucide icon component
   * - color: Icon/text color (theme-based)
   * - bgColor: Icon container background
   * - href: Link destination on click
   *
   * Design: Color-coded by urgency/module type
   */
  const quickStats = [
    {
      label: "Items Expiring Soon",
      value: expiringItems.length.toString(),
      change: "Next 30 days",
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      href: "/dashboard/storage",
    },
    {
      label: "Urgent Tasks",
      value: urgentTasks.length.toString(),
      change: "Need attention",
      icon: CheckCircle2,
      color: "text-red-600",
      bgColor: "bg-red-50",
      href: "/dashboard/tasks",
    },
    {
      label: "Total Active Tasks",
      value: activeTasks.length.toString(),
      change: "In progress",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/dashboard/tasks",
    },
    {
      label: "Storage Items",
      value: "Manage",
      change: "Inventory",
      icon: Warehouse,
      color: "text-forest-600",
      bgColor: "bg-forest-50",
      href: "/dashboard/storage",
    },
  ];

  return (
    <>
      <OnboardingWrapper shouldShowOnboarding={!onboardingStatus.onboardingCompleted} />
      <div className="space-y-8">
        {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-soil-900">
            Homestead Overview
          </h1>
          <p className="text-soil-600 mt-1">
            Good morning. Here&apos;s what&apos;s happening on the farm today.
          </p>
        </div>
        <div className="text-sm text-soil-500 bg-white px-4 py-2 rounded-lg border border-soil-200">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl p-4 border border-soil-200 hover:border-soil-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-soil-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-soil-900 mt-1">
                  {stat.value}
                </h3>
              </div>
              <div
                className={cn(
                  "p-2 rounded-lg transition-colors group-hover:scale-110 duration-200",
                  stat.bgColor
                )}
              >
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-soil-500">
              <span className="font-medium">{stat.change}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Urgent/Upcoming Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-soil-900">Priority Tasks</h2>
            <Link
              href="/dashboard/tasks"
              className="text-sm font-medium text-forest-600 hover:text-forest-700 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-soil-200 overflow-hidden">
            {upcomingTasks.length === 0 ? (
              <div className="p-8 text-center text-soil-500">
                No active tasks. Good job!
              </div>
            ) : (
              <div className="divide-y divide-soil-100">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-soil-50 transition-colors flex items-center gap-4"
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        task.priority === "urgent"
                          ? "bg-red-500"
                          : task.priority === "high"
                            ? "bg-amber-500"
                            : "bg-green-500"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-soil-900 truncate">
                        {task.title}
                      </h4>
                      <p className="text-xs text-soil-500 mt-0.5">
                        Due: {task.nextDue ? formatDate(task.nextDue) : "No date"} •{" "}
                        {task.category || "General"}
                      </p>
                    </div>
                    {task.recurrenceRule && (
                      <span className="text-xs bg-soil-100 text-soil-600 px-2 py-1 rounded">Recurring</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expiring Items */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-soil-900">Expiring Soon</h2>
            <Link
              href="/dashboard/storage"
              className="text-sm font-medium text-forest-600 hover:text-forest-700 hover:underline"
            >
              View inventory
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-soil-200 overflow-hidden">
            {expiringItems.length === 0 ? (
              <div className="p-8 text-center text-soil-500">
                No items expiring within 30 days.
              </div>
            ) : (
              <div className="divide-y divide-soil-100">
                {expiringItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-soil-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-soil-900">{item.name}</p>
                      <p className="text-xs text-soil-500">
                        {item.quantity} {item.unit} • {item.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-red-600">
                        {item.expirationDate ? formatDate(item.expirationDate) : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
