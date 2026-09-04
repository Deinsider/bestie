import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ensure socket server is initialized
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/socket`).catch(() => {});

  const io = (res.socket.server as any).io;

  if (req.method === "GET") {
    const invoices = await prisma.invoice.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return res.json(invoices);
  }

  if (req.method === "POST") {
    const { studentId, description, amount } = req.body;
    const invoice = await prisma.invoice.create({
      data: {
        studentId,
        description,
        amount: Number(amount),
      },
    });

    if (io) {
      io.emit("invoices:update", invoice);
    }

    return res.status(201).json(invoice);
  }

  res.setHeader("Allow", "GET,POST");
  res.status(405).end("Method Not Allowed");
}
