import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com` 
};

const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);

// 1. [사용자용] 비밀번호 검증 함수
export const checkAppPassword = async (inputPassword: string): Promise<boolean> => {
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
  const passwordRef = ref(rtdb, 'admin_settings');
  await set(passwordRef, {
    app_password: newPassword,
    updated_at: new Date().toISOString()
  });
};
