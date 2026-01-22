import { db, FieldValue } from "./firebase.js";

/**
 * Firestore schema:
 * - groups/{groupId}:
 *    - rules: string
 *    - welcome: string
 *    - settings: { welcomeEnabled: boolean, helpOnJoin: boolean }
 *
 * - groups/{groupId}/faqs/{faqId}:
 *    - q: string
 *    - a: string
 *    - createdAt: timestamp
 *
 * - users/{userId}:
 *    - userId: number
 *    - chatId: number
 *    - username: string | null
 *    - firstName: string | null
 *    - startedAt: timestamp
 */

export async function upsertUserFromStart(ctx) {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id; // private chat id
  const username = ctx.from.username ?? null;
  const firstName = ctx.from.first_name ?? null;

  const ref = db().collection("users").doc(String(userId));
  await ref.set(
    {
      userId,
      chatId,
      username,
      firstName,
      startedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

export async function listAllUserChatIds() {
  const snap = await db().collection("users").get();
  const chatIds = [];
  snap.forEach((doc) => {
    const data = doc.data();
    if (data?.chatId) chatIds.push(data.chatId);
  });
  return chatIds;
}

// Group scoped
function groupDoc(groupId) {
  return db().collection("groups").doc(String(groupId));
}

export async function getSettings(groupId) {
  const doc = await groupDoc(groupId).get();
  const data = doc.exists ? doc.data() : null;
  return data?.settings ?? { welcomeEnabled: true, helpOnJoin: false };
}

export async function setSettings(groupId, patch) {
  const current = await getSettings(groupId);
  const next = { ...current, ...patch };
  await groupDoc(groupId).set({ settings: next }, { merge: true });
  return next;
}

export async function setRules(groupId, text) {
  await groupDoc(groupId).set({ rules: text }, { merge: true });
}

export async function getRules(groupId) {
  const doc = await groupDoc(groupId).get();
  const data = doc.exists ? doc.data() : null;
  return data?.rules ?? null;
}

export async function setWelcome(groupId, text) {
  await groupDoc(groupId).set({ welcome: text }, { merge: true });
}

export async function getWelcome(groupId) {
  const doc = await groupDoc(groupId).get();
  const data = doc.exists ? doc.data() : null;
  return data?.welcome ?? null;
}

export async function addFaq(groupId, faq) {
  const ref = groupDoc(groupId).collection("faqs").doc(); // auto id
  await ref.set({
    q: faq.q,
    a: faq.a,
    createdAt: FieldValue.serverTimestamp()
  });
  return ref.id;
}

export async function listFaqs(groupId) {
  const snap = await groupDoc(groupId).collection("faqs").orderBy("createdAt", "asc").get();
  const out = [];
  snap.forEach((d) => {
    const v = d.data();
    out.push({ id: d.id, q: v.q, a: v.a });
  });
  return out;
}

export async function getFaq(groupId, id) {
  const doc = await groupDoc(groupId).collection("faqs").doc(String(id)).get();
  return doc.exists ? doc.data() : null;
}

export async function deleteFaq(groupId, id) {
  await groupDoc(groupId).collection("faqs").doc(String(id)).delete();
}
