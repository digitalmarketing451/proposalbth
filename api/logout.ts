export const config = { runtime: "nodejs" };

export default function handler(req: any, res: any) {
  if (req.method !== "POST") { res.statusCode = 405; return res.end("Method not allowed"); }
  res.setHeader("Set-Cookie", "bth_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None");
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.end(JSON.stringify({ ok: true }));
}
