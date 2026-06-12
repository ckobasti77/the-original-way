import { redirect } from "next/navigation";

function buildProductsUrl(slug: string[] = []) {
  const params = new URLSearchParams();
  const [first, second] = slug;

  if (first === "muskarci") {
    params.set("gender", "men");
    if (second) params.set("collection", second);
  } else if (first === "zene") {
    params.set("gender", "women");
    if (second) params.set("collection", second);
  } else if (first) {
    params.set("collection", first);
  }

  const query = params.toString();
  return query ? `/proizvodi?${query}` : "/proizvodi";
}

export default async function LegacyCollectionsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  redirect(buildProductsUrl(slug));
}
