import {NextRequest} from "next/server";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BASE}/feedback`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body),
  });
  const ct = res.headers.get("content-type") || "";
  const payload = ct.includes("application/json") ? await res.json() : await res.text();
  return new Response(typeof payload === "string" ? payload : JSON.stringify(payload), {
    status: res.status,
    headers: {"Content-Type": ct.includes("application/json") ? "application/json" : "text/plain"},
  });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page");
  const target = new URL(`${BASE}/feedback`);
  if (page) target.searchParams.set("page", page);
  const res = await fetch(target.toString());
  const ct = res.headers.get("content-type") || "";
  const payload = ct.includes("application/json") ? await res.json() : await res.text();
  return new Response(typeof payload === "string" ? payload : JSON.stringify(payload), {
    status: res.status,
    headers: {"Content-Type": ct.includes("application/json") ? "application/json" : "text/plain"},
  });
}
