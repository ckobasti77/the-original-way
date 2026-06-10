import { SettingsClient } from "./settings-client";

export default function SettingsPage() {
  return (
    <SettingsClient convexEnabled={Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)} />
  );
}
