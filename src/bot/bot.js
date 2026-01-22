import { Bot } from "grammy";
import { registerUserHandlers } from "./user.js";
import { registerAdminHandlers } from "./admin.js";

export function createBot() {
  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN missing");

  const admins = (process.env.ADMIN_IDS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(Number);

  const bot = new Bot(token);

  registerUserHandlers(bot, { admins });
  registerAdminHandlers(bot, { admins });

  bot.catch((err) => console.error("BOT_ERROR:", err));
  return bot;
}
