import { webhookCallback } from "grammy";
import { createBot } from "../../bot/bot.js";

export const config = { api: { bodyParser: false } };

const bot = createBot();
export default webhookCallback(bot, "next-js");
