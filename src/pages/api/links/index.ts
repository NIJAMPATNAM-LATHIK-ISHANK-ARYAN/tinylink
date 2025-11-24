// src/pages/api/links/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET — return all links
  if (req.method === "GET") {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        code: true,
        url: true,
        clicks: true,
        lastClicked: true,
        createdAt: true,
      },
    });

    return res.status(200).json(links);
  }

  // POST — create link
  if (req.method === "POST") {
    const { url, code } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Missing url or code" });
    }

    const newLink = await prisma.link.create({
      data: {
        url,
        code: code || undefined,
      },
    });

    return res.status(201).json(newLink);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
