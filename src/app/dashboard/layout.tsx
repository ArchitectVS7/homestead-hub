import { SidebarLayout } from "@/components/ui/sidebar";
import { getUnreadCount } from "@/actions/notifications";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const unreadCount = await getUnreadCount();
  return <SidebarLayout unreadCount={unreadCount}>{children}</SidebarLayout>;
}
