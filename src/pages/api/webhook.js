import { getBot } from "../../bot/bot.js";

export default async function handler(req, res) {
  if (req.method === "HEAD") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    res.status(200).send("OK");
    return;
  }

  if (req.method !== "POST") {
    res.status(200).send("OK");
    return;
  }

  try {
    const update = req.body;
    if (!update) {
      res.status(400).send("Missing update body");
      return;
    }

    const bot = await getBot(); // ✅ init নিশ্চিত
    await bot.handleUpdate(update);

    res.status(200).send("OK");
  } catch (err) {
    console.error("WEBHOOK_ERROR:", err);
    res.status(200).send("OK"); // ✅ Telegram retries কমাতে 200 দিচ্ছি
  }
}
