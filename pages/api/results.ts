import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ensure socket server is initialized
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/socket`).catch(() => {});

  const io = (res.socket.server as any).io;

  if (req.method === "GET") {
    const grades = await prisma.grade.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return res.json(grades);
  }

  if (req.method === "POST") {
    const { studentId, subject, term, score } = req.body;
    const gradeValue = Number(score);
    const gradeLetter = gradeValue >= 80 ? "A" : gradeValue >= 70 ? "B" : gradeValue >= 60 ? "C" : "D";

    const grade = await prisma.grade.create({
      data: {
        studentId,
        subject,
        term,
        score: gradeValue,
        grade: gradeLetter,
      },
    });

    // emit real-time update
    if (io) {
      io.emit("grades:update", grade);
    }

    return res.status(201).json(grade);
  }

  res.setHeader("Allow", "GET,POST");
  res.status(405).end("Method Not Allowed");
}
