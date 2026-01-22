import { Bot } from "grammy";
import { registerUserHandlers } from "./user.js";
import { registerAdminHandlers } from "./admin.js";

let botSingleton = null;
let botInitPromise = null;

export async function getBot() {
  if (!botSingleton) {
    const token = process.env.BOT_TOKEN;
    if (!token) throw new Error("BOT_TOKEN missing");

    const admins = (process.env.ADMIN_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);

    botSingleton = new Bot(token);

    registerUserHandlers(botSingleton, { admins });
    registerAdminHandlers(botSingleton, { admins });

    botSingleton.catch((err) => console.error("BOT_ERROR:", err));
  }

  // ✅ Ensure init runs once (needed for serverless)
  if (!botInitPromise) {
    botInitPromise = botSingleton.init();
  }
  await botInitPromise;

  return botSingleton;
}
