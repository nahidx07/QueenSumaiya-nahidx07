import { mainHelpKeyboard, faqListKeyboard } from "./ui.js";
import {
  getRules,
  getWelcome,
  listFaqs,
  getFaq,
  getSettings,
  upsertUserFromStart
} from "./storage.js";

export function registerUserHandlers(bot, { admins }) {
  // /start (private)
  bot.command("start", async (ctx) => {
    if (ctx.chat?.type !== "private") return;

    // Save user for broadcast (Firestore)
    try {
      await upsertUserFromStart(ctx);
    } catch (err) {
      console.error("START_SAVE_ERROR:", err);
      await ctx.reply(
        "⚠️ /start save failed. Please check Vercel Logs.\n\n" +
          "Error: " +
          (err?.message || String(err))
      );
      return;
    }

    await ctx.reply(
      "👋 Hi! Help Board bot ready.\n\nGroup এ add করো, তারপর গ্রুপে /help দিলেই বোর্ড আসবে।",
      { reply_markup: mainHelpKeyboard() }
    );
  });

  // /help (group or private)
  bot.command("help", async (ctx) => {
    await ctx.reply("🧩 Help Board\nChoose an option:", {
      reply_markup: mainHelpKeyboard()
    });
  });

  // Welcome on join (group)
  bot.on("message:new_chat_members", async (ctx) => {
    const chatId = ctx.chat.id;
    const settings = await getSettings(chatId);
    if (!settings.welcomeEnabled) return;

    const welcome = await getWelcome(chatId);
    if (welcome) {
      for (const m of ctx.message.new_chat_members) {
        await ctx.reply(welcome.replaceAll("{name}", m.first_name ?? "there"));
      }
    }

    if (settings.helpOnJoin) {
      await ctx.reply("Need help? Open the Help Board:", {
        reply_markup: mainHelpKeyboard()
      });
    }
  });

  // Help board callbacks
  bot.callbackQuery("HELP_FAQ", async (ctx) => {
    const chatId = ctx.chat.id;
    const faqs = await listFaqs(chatId);
    await ctx.editMessageText("📌 FAQ List:", { reply_markup: faqListKeyboard(faqs) });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^FAQ_(.+)$/, async (ctx) => {
    const chatId = ctx.chat.id;
    const id = ctx.match[1];
    const faq = await getFaq(chatId, id);
    if (!faq) {
      await ctx.answerCallbackQuery({ text: "FAQ not found.", show_alert: true });
      return;
    }
    await ctx.reply(`❓ Q: ${faq.q}\n\n✅ A: ${faq.a}`);
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("HELP_RULES", async (ctx) => {
    const chatId = ctx.chat.id;
    const rules = await getRules(chatId);
    await ctx.reply(rules ? `📜 Rules:\n\n${rules}` : "📜 Rules not set yet.");
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("HELP_ABOUT", async (ctx) => {
    await ctx.reply("ℹ️ About\nThis bot provides a Help Board (FAQ/Rules) + Broadcast (admins).");
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("HELP_CONTACT", async (ctx) => {
    // simple version
    await ctx.reply("👮 Contact Admin\nAdmins are available. Please message them directly if needed.");
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("HELP_BACK", async (ctx) => {
    await ctx.editMessageText("🧩 Help Board\nChoose an option:", {
      reply_markup: mainHelpKeyboard()
    });
    await ctx.answerCallbackQuery();
  });
}
