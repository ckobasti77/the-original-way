import { CollectionsClient } from "./collections-client";

export default function CollectionsPage() {
  return (
    <CollectionsClient
      convexEnabled={Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)}
    />
  );
}
