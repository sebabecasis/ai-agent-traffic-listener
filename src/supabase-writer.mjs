export function createSupabaseWriter({ url, anonKey, timeoutMs = 2000, fetchImpl = fetch }) {
  if (!url || !anonKey) throw new Error("Supabase writer requires url and anonKey");
  return async function writeAgentHit(hit) {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(hit),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok && response.status !== 409) {
      throw new Error(`Agent-hit write failed: ${response.status}`);
    }
  };
}
