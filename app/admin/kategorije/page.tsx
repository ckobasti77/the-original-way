import { CategoriesClient } from "./categories-client";

export default function CategoriesPage() {
  return (
    <CategoriesClient convexEnabled={Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)} />
  );
}
