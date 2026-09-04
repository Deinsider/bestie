import type { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket.server.io) {
    console.log("Setting up Socket.IO server...");
    const io = new Server(res.socket.server as any, {
      path: "/api/socket_io",
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("New client connected", socket.id);
      socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
      });
    });
  }
  res.end();
}
