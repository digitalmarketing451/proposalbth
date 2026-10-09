import { createSession, findAccount, setSessionCookie } from "./_auth";

export default function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { email, password } = req.body || {};
  const user = findAccount(String(email || ""), String(password || ""));
  if (!user) return res.status(401).json({ error: "Email atau password salah." });
  setSessionCookie(res, createSession(user));
  return res.status(200).json({ user });
}
