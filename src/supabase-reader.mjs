// Server-side only: the insert-only anon key cannot read reports.
export async function readHits({ url, key, from, to, pageSize = 1000, maxPages = 100, fetchImpl = fetch }) {
  if (!url || !key || !from || !to) throw new Error("URL, reporting key, from and to are required");
  if (!Number.isFinite(Date.parse(from)) || !Number.isFinite(Date.parse(to)) || Date.parse(from) >= Date.parse(to)) throw new Error("Invalid report window");
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 1000 || !Number.isInteger(maxPages) || maxPages < 1) throw new Error("Invalid pagination limits");
  const hits = [];
  for (let page = 0; page < maxPages; page++) {
    const target = new URL(url);
    if (target.protocol !== "https:") throw new Error("Reporting endpoint must use HTTPS");
    target.searchParams.set("select", "request_id,occurred_at,path,user_agent,agent,agent_vendor,agent_kind");
    target.searchParams.append("occurred_at", `gte.${new Date(from).toISOString()}`);
    target.searchParams.append("occurred_at", `lt.${new Date(to).toISOString()}`);
    target.searchParams.set("order", "occurred_at.asc,id.asc");
    target.searchParams.set("limit", String(pageSize));
    target.searchParams.set("offset", String(page * pageSize));
    const response = await fetchImpl(target.toString(), { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Report read failed: ${response.status}`);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error("Report response must contain rows");
    hits.push(...rows);
    if (rows.length < pageSize) return hits;
  }
  throw new Error("Report exceeds pagination limit; narrow the window (no partial report returned)");
}
