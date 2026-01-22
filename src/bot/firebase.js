import admin from "firebase-admin";

function normalizePrivateKey(key) {
  if (!key) return key;

  // Remove wrapping quotes if user pasted with "..."
  key = key.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // Convert escaped newlines to real newlines
  key = key.replace(/\\n/g, "\n");

  return key;
}

function getFirebaseApp() {
  if (admin.apps.length) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase env vars missing: FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY");
  }

  privateKey = normalizePrivateKey(privateKey);

  // Helpful sanity check
  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error("FIREBASE_PRIVATE_KEY looks invalid (missing BEGIN PRIVATE KEY). Check Vercel env formatting.");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return admin.app();
}

export function db() {
  getFirebaseApp();
  return admin.firestore();
}

export const FieldValue = admin.firestore.FieldValue;
