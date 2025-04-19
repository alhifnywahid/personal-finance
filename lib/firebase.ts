import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCLK6w98i1w0mN4muWEy-AW1R2RLq2VCAg",
  authDomain: "keuanganku-3f1da.firebaseapp.com",
  projectId: "keuanganku-3f1da",
  storageBucket: "keuanganku-3f1da.firebasestorage.app",
  messagingSenderId: "532996546527",
  appId: "1:532996546527:web:381633b7983c3963b46e6a",
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { app, db, auth, googleProvider }
