import { getAuthJwks } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(getAuthJwks(), {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
