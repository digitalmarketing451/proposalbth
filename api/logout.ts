import { clearSessionCookie } from "./_auth";

export default function handler(req: any, res: any) {
  if (req.method !== "POST") { res.statusCode = 405; return res.end("Method not allowed"); }
  clearSessionCookie(res);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.end(JSON.stringify({ ok: true }));
}
