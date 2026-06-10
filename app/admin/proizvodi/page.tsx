import { ProductsClient } from "./products-client";

export default function ProductsPage() {
  return (
    <ProductsClient convexEnabled={Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)} />
  );
}
