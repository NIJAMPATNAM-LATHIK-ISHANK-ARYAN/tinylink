// src/pages/api/links/[code].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma"; // relative import from src/pages/api/links

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  if (!code || Array.isArray(code)) {
    return res.status(400).json({ error: "Invalid code param" });
  }

  const codeStr = code as string;

  if (req.method === "GET") {
    const link = await prisma.link.findFirst({
      where: { code: codeStr, deletedAt: null },
      select: {
        id: true,
        code: true,
        target: true,
        clicks: true,
        lastClicked: true,
        createdAt: true,
      },
    });

    if (!link) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(link);
  }

  if (req.method === "DELETE") {
    // Check existence
    const existing = await prisma.link.findUnique({ where: { code: codeStr } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    // Hard delete. If you prefer soft-delete, replace with update(deletedAt: new Date())
    await prisma.link.delete({ where: { code: codeStr } });

    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}