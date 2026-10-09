export const config = { runtime: "nodejs22.x" };

import { readSession } from "../server/auth-session";

function send(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export default function handler(req: any, res: any) {
  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
  const user = readSession({ headers: req.headers || {} });
  if (!user) return send(res, 401, { error: "Unauthenticated" });
  return send(res, 200, { user });
}
