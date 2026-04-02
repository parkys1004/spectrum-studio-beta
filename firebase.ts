import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app",
  databaseURL: import.meta.env.VITE_FIREBASE_PROJECT_ID 
    ? `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com` 
    : "https://mock-project-default-rtdb.firebaseio.com"
};

let app;
let rtdb: any;

try {
  app = initializeApp(firebaseConfig);
  rtdb = getDatabase(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// 1. [사용자용] 비밀번호 검증 함수
export const checkAppPassword = async (inputPassword: string): Promise<boolean> => {
  if (!rtdb) {
    console.warn("Firebase is not initialized. Check your environment variables.");
    return false;
  }
  try {
    const passwordRef = ref(rtdb, 'admin_settings/app_password');
    const snapshot = await get(passwordRef);
    if (snapshot.exists()) {
      return snapshot.val() === inputPassword;
    }
    return false;
  } catch (error) {
    console.error("Firebase connection error:", error);
    return false;
  }
};

// 2. [관리자용] 비밀번호 변경 함수
export const updateAppPassword = async (newPassword: string): Promise<void> => {
  if (!rtdb) {
    console.warn("Firebase is not initialized. Check your environment variables.");
    return;
  }
  const passwordRef = ref(rtdb, 'admin_settings');
  await set(passwordRef, {
    app_password: newPassword,
    updated_at: new Date().toISOString()
  });
};
