
import { getNotifications, generateNotifications } from "@/actions/notifications";
import { NotificationsView } from "./notifications-view";

export default async function NotificationsPage() {
  // Generate fresh notifications on visit
  await generateNotifications(); // Logic inside handles existing checks

  const notifications = await getNotifications();

  return (
    <div className="space-y-6">
      <NotificationsView initialNotifications={notifications} />
    </div>
  );
}
