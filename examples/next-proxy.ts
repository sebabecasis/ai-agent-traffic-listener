import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { recordAgentHit } from "../src/hit.mjs";
import { createSupabaseWriter } from "../src/supabase-writer.mjs";

let writer: ReturnType<typeof createSupabaseWriter> | undefined;
let warned = false;
function reportFailure() {
  if (!warned) {
    console.warn("Agent traffic recording unavailable; check server configuration and table access");
    warned = true;
  }
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  try {
    writer ??= createSupabaseWriter({
      url: process.env.AGENT_HITS_URL!,
      anonKey: process.env.AGENT_HITS_ANON_KEY!,
    });
    event.waitUntil(recordAgentHit(request, writer, { onError: reportFailure }));
  } catch {
    reportFailure();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
