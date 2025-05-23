"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getAnalytics } from "firebase/analytics"

// Kiểm tra xem chúng ta đang ở môi trường browser hay không
const isBrowser = typeof window !== "undefined"

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBCbLOZnNeVfrponD4Z2II4cFuhGIIFUYU",
  authDomain: "gym-project-44f52.firebaseapp.com",
  projectId: "gym-project-44f52",
  storageBucket: "gym-project-44f52.firebasestorage.app",
  messagingSenderId: "1031164850774",
  appId: "1:1031164850774:web:eb7fef064d7cf8a16d01f7",
  measurementId: "G-QW8PXEDDQT",
}

// Khởi tạo Firebase chỉ khi ở browser
let app, db, auth, analytics

if (isBrowser) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    db = getFirestore(app)
    auth = getAuth(app)
    // Chỉ khởi tạo analytics ở môi trường browser
    if (typeof window !== "undefined") {
      analytics = getAnalytics(app)
    }
    console.log("Firebase đã được khởi tạo thành công")
  } catch (error) {
    console.error("Lỗi khi khởi tạo Firebase:", error)
  }
}

export { app, db, auth, analytics }
