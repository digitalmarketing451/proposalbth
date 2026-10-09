import { readSession } from "./_auth";

export default function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const user = readSession(req);
  if (!user) return res.status(401).json({ error: "Unauthenticated" });
  return res.status(200).json({ user });
}
