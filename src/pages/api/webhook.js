import { createBot } from "../../bot/bot.js";

const bot = createBot();

export default async function handler(req, res) {
  // Telegram sometimes checks endpoint with HEAD
  if (req.method === "HEAD") {
    res.status(200).end();
    return;
  }

  // For browser test / health check
  if (req.method === "GET") {
    res.status(200).send("OK");
    return;
  }

  // Telegram sends updates via POST
  if (req.method !== "POST") {
    // Avoid 405 that Telegram reports as "Wrong response"
    res.status(200).send("OK");
    return;
  }

  try {
    const update = req.body;

    if (!update) {
      res.status(400).send("Missing update body");
      return;
    }

    await bot.handleUpdate(update);
    res.status(200).send("OK");
  } catch (err) {
    console.error("WEBHOOK_ERROR:", err);
    // Telegram prefers 200, but we return 500 for debugging
    res.status(500).send("Internal error");
  }
}
