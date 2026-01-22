import {
  addFaq, listFaqs, deleteFaq,
  setRules, setWelcome,
  getSettings, setSettings,
  listAllUserChatIds
} from "./storage.js";
import { adminPanelKeyboard } from "./ui.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function registerAdminHandlers(bot, { admins }) {
  const isAdmin = (ctx) => admins.includes(ctx.from?.id);

  // Group admin panel
  bot.command("adminpanel", async (ctx) => {
    if (!isAdmin(ctx)) return;
    const chatId = ctx.chat.id;
    const settings = await getSettings(chatId);
    await ctx.reply("🛠 Admin Panel (this group)", { reply_markup: adminPanelKeyboard(settings) });
  });

  // Broadcast: /broadcast text...
  bot.command("broadcast", async (ctx) => {
    if (!isAdmin(ctx)) return;
    if (ctx.chat?.type !== "private") {
      await ctx.reply("⚠️ Broadcast শুধু বটের private chat এ চালাও (spam avoid করতে)।");
      return;
    }

    const text = ctx.message.text.replace(/^\/broadcast(@\w+)?\s*/i, "").trim();
    if (!text) {
      await ctx.reply("Usage:\n/broadcast আপনার মেসেজ");
      return;
    }

    const chatIds = await listAllUserChatIds();
    if (!chatIds.length) {
      await ctx.reply("No users found (nobody has started the bot yet).");
      return;
    }

    await ctx.reply(`📣 Broadcasting to ${chatIds.length} users...`);

    let ok = 0, fail = 0;

    // Throttle to respect Telegram limits (safe-ish)
    for (const chatId of chatIds) {
      try {
        await ctx.api.sendMessage(chatId, text);
        ok++;
      } catch (e) {
        fail++;
      }
      await sleep(60); // 60ms delay
    }

    await ctx.reply(`✅ Done.\nSuccess: ${ok}\nFailed: ${fail}`);
  });

  // Buttons
  bot.callbackQuery("ADMIN_ADDFAQ", async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.reply("➕ Add FAQ\nSend like this:\n/addfaq Question | Answer");
    await ctx.answerCallbackQuery();
  });

  // Shortcut command /addfaq Q | A
  bot.command("addfaq", async (ctx) => {
    if (!isAdmin(ctx)) return;
    const chatId = ctx.chat.id;

    const payload = ctx.message.text.replace(/^\/addfaq(@\w+)?\s*/i, "");
    const parts = payload.split("|").map((s) => s.trim());
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      await ctx.reply("Usage:\n/addfaq Question | Answer");
      return;
    }
    const id = await addFaq(chatId, { q: parts[0], a: parts.slice(1).join(" | ") });
    await ctx.reply(`✅ Added FAQ (id: ${id})`);
  });

  bot.callbackQuery("ADMIN_LISTFAQ", async (ctx) => {
    if (!isAdmin(ctx)) return;
    const chatId = ctx.chat.id;
    const faqs = await listFaqs(chatId);
    if (!faqs.length) await ctx.reply("No FAQs yet.");
    else {
      const lines = faqs.map(f => `• ${f.id}\nQ: ${f.q}\nA: ${f.a}`).join("\n\n");
      await ctx.reply(lines);
    }
    await ctx.answerCallbackQuery();
  });

  bot.command("delfaq", async (ctx) => {
    if (!isAdmin(ctx)) return;
    const chatId = ctx.chat.id;
    const parts = ctx.message.text.split(" ");
    const id = parts[1];
    if (!id) {
      await ctx.reply("Usage: /delfaq <faqId>");
      return;
    }
    await deleteFaq(chatId, id);
    await ctx.reply(`✅ Deleted FAQ ${id}`);
  });

  bot.callbackQuery("ADMIN_SETRULES", async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.reply("📜 Set Rules:\nSend like this:\n/setrules Your rules text...");
    await ctx.answerCallbackQuery();
  });

  bot.command("setrules", async (ctx) => {
    if (!isAdmin(ctx)) return;
    const chatId = ctx.chat.id;
    const text = ctx.message.text.replace(/^\/setrules(@\w+)?\s*/i, "").trim();
    if (!text) return ctx.reply("Usage: /setrules Your rules...");
    await setRules(chatId, text);
    await ctx.reply("✅ Rules updated.");
  });

  bot.callbackQuery("ADMIN_SETWELCOME", async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.reply("👋 Set Welcome:\nSend like this:\n/setwelcome Welcome {name}!");
    await ctx.answerCallbackQuery();
  });

  bot.command("setwelcome", async (ctx) => {
    if (!isAdmin(ctx)) return;
    const chatId = ctx.chat.id;
    const text = ctx.message.text.replace(/^\/setwelcome(@\w+)?\s*/i, "").trim();
    if (!text) return ctx.reply("Usage: /setwelcome Welcome {name}!");
    await setWelcome(chatId, text);
    await ctx.reply("✅ Welcome updated.");
  });

  bot.callbackQuery("ADMIN_TOGGLE_WELCOME", async (ctx) => {
    if (!isAdmin(ctx)) return;
    const chatId = ctx.chat.id;
    const s = await getSettings(chatId);
    const next = await setSettings(chatId, { welcomeEnabled: !s.welcomeEnabled });
    await ctx.editMessageReplyMarkup({ reply_markup: adminPanelKeyboard(next) });
    await ctx.answerCallbackQuery({ text: "Updated." });
  });

  bot.callbackQuery("ADMIN_TOGGLE_HELPONJOIN", async (ctx) => {
    if (!isAdmin(ctx)) return;
    const chatId = ctx.chat.id;
    const s = await getSettings(chatId);
    const next = await setSettings(chatId, { helpOnJoin: !s.helpOnJoin });
    await ctx.editMessageReplyMarkup({ reply_markup: adminPanelKeyboard(next) });
    await ctx.answerCallbackQuery({ text: "Updated." });
  });
}
