import { webhookCallback } from "grammy";
import { createBot } from "../../bot/bot.js";

const bot = createBot();

// ✅ DO NOT disable bodyParser for grammY next-js adapter
export default async function handler(req, res) {
  // Optional: allow quick check in browser
  if (req.method === "GET") {
    res.status(200).send("OK");
    return;
  }

  // Telegram will POST JSON updates here
  return webhookCallback(bot, "next-js")(req, res);
}
