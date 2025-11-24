import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { target, code } = req.body;
const url = target;  // map incoming field

if (!url) {
  return res.status(400).json({ error: "Missing url or code" });
}

  try {
    const newLink = await prisma.link.create({
      data: {
        url,
        code,
      },
    });

    return res.status(201).json(newLink);
  } catch (err) {
    return res.status(400).json({ error: "Code already exists" });
  }
}
