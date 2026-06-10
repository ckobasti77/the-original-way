import { BrandsClient } from "./brands-client";

export default function BrandsPage() {
  return (
    <BrandsClient convexEnabled={Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)} />
  );
}
