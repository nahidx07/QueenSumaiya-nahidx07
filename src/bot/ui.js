import { InlineKeyboard } from "grammy";

export function mainHelpKeyboard() {
  return new InlineKeyboard()
    .text("📌 FAQ", "HELP_FAQ")
    .row()
    .text("📜 Rules", "HELP_RULES")
    .text("👮 Contact Admin", "HELP_CONTACT")
    .row()
    .text("ℹ️ About", "HELP_ABOUT");
}

export function faqListKeyboard(faqs) {
  const kb = new InlineKeyboard();
  if (!faqs.length) {
    kb.text("⬅️ Back", "HELP_BACK");
    return kb;
  }
  for (const f of faqs.slice(0, 30)) {
    kb.text(truncate(f.q, 28), `FAQ_${f.id}`).row();
  }
  kb.text("⬅️ Back", "HELP_BACK");
  return kb;
}

export function adminPanelKeyboard(settings) {
  return new InlineKeyboard()
    .text("➕ Add FAQ", "ADMIN_ADDFAQ")
    .text("📋 List FAQs", "ADMIN_LISTFAQ")
    .row()
    .text("📜 Set Rules", "ADMIN_SETRULES")
    .text("👋 Set Welcome", "ADMIN_SETWELCOME")
    .row()
    .text(settings.welcomeEnabled ? "✅ Welcome: ON" : "❌ Welcome: OFF", "ADMIN_TOGGLE_WELCOME")
    .text(settings.helpOnJoin ? "✅ Help on Join: ON" : "❌ Help on Join: OFF", "ADMIN_TOGGLE_HELPONJOIN");
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
