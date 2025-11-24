import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const codeStr = req.query.code as string;

  if (!codeStr) {
    return res.status(400).json({ error: "Missing code" });
  }

  // GET → fetch a single link
  if (req.method === "GET") {
    const link = await prisma.link.findFirst({
      where: { code: codeStr },
      select: {
        id: true,
        code: true,
        url: true,
        hitCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    return res.status(200).json(link);
  }

  // DELETE → remove link
  if (req.method === "DELETE") {
    try {
      await prisma.link.delete({
        where: { code: codeStr },
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(404).json({ error: "Link not found" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
