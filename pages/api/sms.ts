import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { to, message } = req.body;
  if (!to || !message) return res.status(400).json({ error: "Missing 'to' or 'message' in body" });

  // Lazy-require to avoid startup errors when env isn't set
  try {
    const Africastalking = require("africastalking");
    const at = Africastalking({
      apiKey: "atsk_18ed3bc71b098fac3d220258e9ac2baf536a98526de8aa148ac2df85a320d7539d61baee",
      username: "Collins wawire",
    });

    const sms = at.SMS;
    // ensure 'to' is array of numbers
    const recipients = Array.isArray(to) ? to : [to];

    const response = await sms.send({
      to: recipients,
      message,
      // from: optional sender id if configured
    });

    return res.status(200).json(response);
  } catch (err: any) {
    console.error("SMS send error:", err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
