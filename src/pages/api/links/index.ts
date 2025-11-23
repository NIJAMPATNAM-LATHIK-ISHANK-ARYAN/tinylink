// src/pages/api/links/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

const CODE_RE = /^[A-Za-z0-9]{6,8}$/;

function isValidUrl(u: unknown) {
  if (typeof u !== "string") return false;
  try {
    const url = new URL(u);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function generateCode(len = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { target, code: providedCode } = req.body ?? {};

    // Validate target URL
    if (!isValidUrl(target)) {
      return res.status(400).json({ error: "Invalid or missing target URL" });
    }

    let code: string;

    // If custom code provided
    if (providedCode) {
      if (typeof providedCode !== "string" || !CODE_RE.test(providedCode)) {
        return res.status(400).json({
          error: "Invalid code format. Code must be 6-8 alphanumeric characters.",
        });
      }
      code = providedCode;
    } else {
      // Generate unique code
      let tries = 0;
      const maxTries = 10;
      let candidate = generateCode(6);

      while (tries < maxTries) {
        const exist = await prisma.link.findUnique({ where: { code: candidate } });
        if (!exist) break;
        candidate = generateCode(6);
        tries++;
      }

      const finalCheck = await prisma.link.findUnique({ where: { code: candidate } });
      if (finalCheck) {
        return res.status(500).json({ error: "Could not generate unique code, try again." });
      }

      code = candidate;
    }

    try {
      const created = await prisma.link.create({
        data: {
          code,
          target,
        },
      });

      return res.status(201).json(created);
    } catch (err: any) {
      // Unique constraint violation (code exists)
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Code already exists" });
      }
      console.error("POST /api/links error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "GET") {
    const links = await prisma.link.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(links);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
