import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(students);
  }
  res.setHeader("Allow", "GET");
  res.status(405).end("Method Not Allowed");
}
