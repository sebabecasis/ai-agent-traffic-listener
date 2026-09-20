import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { recordAgentHit } from "../src/hit.mjs";
import { createSupabaseWriter } from "../src/supabase-writer.mjs";

const writer = createSupabaseWriter({
  url: process.env.AGENT_HITS_URL!,
  anonKey: process.env.AGENT_HITS_ANON_KEY!,
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  event.waitUntil(recordAgentHit(request, writer));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
