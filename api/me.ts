import { createHmac, timingSafeEqual } from "crypto";

export const config = { runtime: "nodejs" };
const sessionCookie = "bth_session";
const secret = () => process.env.BTH_AUTH_SECRET || "bth-local-session-secret";
function send(res: any, status: number, body: unknown) { res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(body)); }
function decode(value: string) { return Buffer.from(value, "base64url").toString("utf8"); }
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }
function readSession(req: any) {
  const raw = req.headers?.cookie || "";
  const cookieHeader = Array.isArray(raw) ? raw.join(";") : String(raw);
  const token = cookieHeader.split(";").map((item: string) => item.trim()).find((item: string) => item.startsWith(`${sessionCookie}=`))?.slice(sessionCookie.length + 1);
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  try {
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const data = JSON.parse(decode(payload));
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: data.email, name: data.name, role: data.role };
  } catch { return null; }
}
export default function handler(req: any, res: any) {
  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
  const user = readSession(req);
  if (!user) return send(res, 401, { error: "Unauthenticated" });
  return send(res, 200, { user });
}
