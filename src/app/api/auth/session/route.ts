import { clearSessionCookie, getSession } from "@/lib/auth";
import { apiSuccess } from "@/lib/api-utils";

export async function POST() {
  await clearSessionCookie();
  return apiSuccess({ message: "Logged out" });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ user: null });
  }
  return Response.json({ user: session });
}
