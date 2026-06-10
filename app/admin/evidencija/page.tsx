import { EvidenceClient } from "./evidence-client";

export default function EvidencePage() {
  return (
    <EvidenceClient convexEnabled={Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)} />
  );
}
