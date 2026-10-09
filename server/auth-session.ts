import { createHash, createHmac, timingSafeEqual } from "crypto";

export type AppUser = {
  email: string;
  name: string;
  role: "senior_sales_manager" | "sales_manager";
};

const SESSION_COOKIE = "bth_session";
const secret = () => process.env.BTH_AUTH_SECRET || "bth-local-session-secret";

const accounts: Array<AppUser & { envKey: string; passwordHash: string }> = [
  { email: "seniorsalesmanager@balitopholiday.com", name: "Senior Sales Manager", role: "senior_sales_manager", envKey: "SENIOR_SALES_MANAGER_PASSWORD", passwordHash: "f1c21bc5456efdfd03ec9769d956428c38ac34a80d8dec41e136b6686ad61aaf" },
  { email: "salesmanager@balitopholiday.com", name: "Sales Manager", role: "sales_manager", envKey: "SALES_MANAGER_PASSWORD", passwordHash: "2161e68fdd1aef89d6299c655a97d49a0548bfb2f1247380e2b7225184eb9e32" },
];

export function findAccount(email: string, password: string) {
  const account = accounts.find(item => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!account) return null;
  const configured = process.env[account.envKey];
  const expectedHash = configured ? createHash("sha256").update(configured).digest("hex") : account.passwordHash;
  const receivedHash = createHash("sha256").update(password).digest("hex");
  if (expectedHash !== receivedHash) return null;
  return { email: account.email, name: account.name, role: account.role } satisfies AppUser;
}

function encode(value: string) { return Buffer.from(value).toString("base64url"); }
function decode(value: string) { return Buffer.from(value, "base64url").toString("utf8"); }
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }

export function createSession(user: AppUser) {
  const payload = encode(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12 }));
  return `${payload}.${sign(payload)}`;
}

export function readSession(req: { headers: Record<string, string | string[] | undefined> }) {
  const cookieHeader = req.headers.cookie;
  const cookie = Array.isArray(cookieHeader) ? cookieHeader.join(";") : cookieHeader || "";
  const token = cookie.split(";").map(item => item.trim()).find(item => item.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const data = JSON.parse(decode(payload)) as AppUser & { exp: number };
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: data.email, name: data.name, role: data.role } satisfies AppUser;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: { setHeader: (name: string, value: string) => void }, token: string) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${token}; Path=/; Max-Age=43200; HttpOnly; Secure; SameSite=None`);
}

export function clearSessionCookie(res: { setHeader: (name: string, value: string) => void }) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None`);
}
