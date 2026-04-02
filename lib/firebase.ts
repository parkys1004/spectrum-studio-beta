// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, doc, getDoc } from "firebase/firestore";

// Vite 환경에서는 process.env 대신 import.meta.env를 사용해야 합니다.
// Vercel에 배포하실 때 환경변수 이름을 VITE_FIREBASE_... 로 설정해주세요.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log("Firebase Config loaded:", {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? "SET" : "MISSING"
});

export const isFirebaseConfigured = !!firebaseConfig.apiKey;

// 앱이 이미 초기화되었는지 확인 후 연결
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const DATABASE_ID = "ai-studio-dbbbbaa2-1129-4959-b336-f0af63245a60";

// WebSocket 연결이 차단되는 환경(프록시, iframe 등)을 위해 Long Polling 강제 사용
// HMR(Hot Module Replacement) 환경에서 중복 초기화 에러 방지
let db;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, DATABASE_ID);
} catch (e) {
  // 이미 초기화된 경우 기존 인스턴스 사용
  db = getFirestore(app, DATABASE_ID);
}

export { db };

// 비밀번호 확인 함수
export const verifyPassword = async (inputPassword: string) => {
  try {
    const docRef = doc(db, "config", "globalconfig");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const correctPassword = docSnap.data().currentPassword;
      return inputPassword === correctPassword;
    } else {
      console.warn("설정 문서를 찾을 수 없습니다. 임시 비밀번호 '0000'을 허용합니다.");
      if (inputPassword === '0000') return true;
      throw new Error("DOCUMENT_MISSING");
    }
  } catch (error) {
    console.error("비밀번호 확인 중 오류 발생:", error);
    throw error;
  }
};
