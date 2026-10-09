import { createHash, createHmac } from "crypto";

export const config = { runtime: "nodejs" };

type AppUser = { email: string; name: string; role: "senior_sales_manager" | "sales_manager" };
const sessionCookie = "bth_session";
const secret = () => process.env.BTH_AUTH_SECRET || "bth-local-session-secret";
const accounts: Array<AppUser & { envKey: string; passwordHash: string }> = [
  { email: "seniorsalesmanager@balitopholiday.com", name: "Senior Sales Manager", role: "senior_sales_manager", envKey: "SENIOR_SALES_MANAGER_PASSWORD", passwordHash: "f1c21bc5456efdfd03ec9769d956428c38ac34a80d8dec41e136b6686ad61aaf" },
  { email: "salesmanager@balitopholiday.com", name: "Sales Manager", role: "sales_manager", envKey: "SALES_MANAGER_PASSWORD", passwordHash: "2161e68fdd1aef89d6299c655a97d49a0548bfb2f1247380e2b7225184eb9e32" },
];
function send(res: any, status: number, body: unknown) { res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(body)); }
function encode(value: string) { return Buffer.from(value).toString("base64url"); }
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }
function findAccount(email: string, password: string) {
  const account = accounts.find(item => item.email === email.trim().toLowerCase());
  if (!account) return null;
  const configured = process.env[account.envKey];
  const expectedHash = configured ? createHash("sha256").update(configured).digest("hex") : account.passwordHash;
  if (expectedHash !== createHash("sha256").update(password).digest("hex")) return null;
  return { email: account.email, name: account.name, role: account.role } satisfies AppUser;
}
export default function handler(req: any, res: any) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const user = findAccount(String(body.email || ""), String(body.password || ""));
    if (!user) return send(res, 401, { error: "Email atau password salah." });
    const payload = encode(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12 }));
    res.setHeader("Set-Cookie", `${sessionCookie}=${payload}.${sign(payload)}; Path=/; Max-Age=43200; HttpOnly; Secure; SameSite=None`);
    return send(res, 200, { user });
  } catch { return send(res, 400, { error: "Format request tidak valid." }); }
}
