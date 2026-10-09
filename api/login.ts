import { createSession, findAccount, setSessionCookie } from "./_auth";

function send(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export default function handler(req: any, res: any) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const user = findAccount(String(body.email || ""), String(body.password || ""));
  if (!user) return send(res, 401, { error: "Email atau password salah." });
  setSessionCookie(res, createSession(user));
  return send(res, 200, { user });
}
