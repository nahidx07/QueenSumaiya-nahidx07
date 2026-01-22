import admin from "firebase-admin";

function getFirebaseApp() {
  if (admin.apps.length) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase env vars missing (PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY)");
  }

  // Vercel env often escapes newlines; fix it:
  privateKey = privateKey.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey
    })
  });

  return admin.app();
}

export function db() {
  getFirebaseApp();
  return admin.firestore();
}

export const FieldValue = admin.firestore.FieldValue;
