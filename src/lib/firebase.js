import { initializeApp } from "firebase/app";
import { Capacitor } from "@capacitor/core";

const firebaseConfig = {
  apiKey: "AIzaSyC5h22PuYyzKZWqG85Caycet5JpsOtHVSw",
  authDomain: "trend-beauty-57cf2.firebaseapp.com",
  projectId: "trend-beauty-57cf2",
  storageBucket: "trend-beauty-57cf2.firebasestorage.app",
  messagingSenderId: "215792460326",
  appId: "1:215792460326:web:27a4f2a919bb59285c3ce7",
  measurementId: "G-R0PML914JW",
};

const app = initializeApp(firebaseConfig);

// iOS native'de Service Worker yok, Firebase Messaging web SDK'sı çalışmaz
const isNative = Capacitor.isNativePlatform();

export let messaging = null;

if (!isNative) {
  const { getMessaging, onMessage } = await import("firebase/messaging");
  messaging = getMessaging(app);

  onMessage(messaging, (payload) => {
    console.log("Yeni bildirim:", payload);
    new Notification(payload.notification.title, {
      body: payload.notification.body,
    });
  });
}

export async function requestNotificationPermission() {
  // iOS native'de bu fonksiyon çağrılmamalı
  // Push notification @capacitor/push-notifications ile yönetiliyor
  if (isNative) {
    console.log("Native platform - Capacitor push notifications kullanılıyor");
    return null;
  }

  console.log("BİLDİRİM İZNİ BAŞLADI");
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const { getMessaging, getToken } = await import("firebase/messaging");
    const token = await getToken(getMessaging(app), {
      vapidKey: "BPZ6Q5GYViaAoa-v6Gx_XtpHJuCElgPt41aDq8kotIozNVj7WuHwwB-b17DioDM4OlL5BTwA45-eGVG15hv9_gg",
    });
    console.log("FCM TOKEN:", token);
    await fetch("https://trendbeauty-server.onrender.com/save-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return token;
  }
}
