import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  // ensure socket server is initialized (so we can emit)
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/socket`).catch(() => {});

  const io = (res.socket.server as any).io;

  const { provider, providerTx, invoiceId, amount } = req.body;
  if (!provider || !providerTx || !invoiceId || !amount) {
    return res.status(400).json({ error: "provider, providerTx, invoiceId, and amount are required" });
  }

  try {
    // idempotency: check if this providerTx already processed
    const existing = await prisma.payment.findFirst({
      where: { providerTx: providerTx },
    });

    if (existing) {
      // already processed -> return success
      return res.status(200).json({ ok: true, note: "already_processed" });
    }

    // ensure invoice exists
    const invoice = await prisma.invoice.findUnique({ where: { id: Number(invoiceId) } });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId: Number(invoiceId),
        provider,
        providerTx,
        amount: Number(amount),
      },
    });

    // mark invoice as PAID
    await prisma.invoice.update({
      where: { id: Number(invoiceId) },
      data: { status: "PAID" },
    });

    // emit real-time update so dashboards refresh
    if (io) {
      const updatedInvoice = await prisma.invoice.findUnique({ where: { id: Number(invoiceId) } });
      io.emit("invoices:update", updatedInvoice);
    }

    return res.status(200).json({ ok: true, payment });
  } catch (err: any) {
    console.error("webhook error:", err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
