import { getSettings } from "@/actions/settings";
import { SettingsView } from "./settings-view";

export default async function SettingsPage() {
  const settings = await getSettings();

  return <SettingsView initialSettings={settings} />;
}
