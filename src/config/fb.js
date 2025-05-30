import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // ✅ Importar Realtime Database
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.apiKey,
  authDomain: Constants.expoConfig.extra.authDomain,
  projectId: Constants.expoConfig.extra.projectId,
  storageBucket: Constants.expoConfig.extra.storageBucket,
  messagingSenderId: Constants.expoConfig.extra.messagingSenderId,
  appId: Constants.expoConfig.extra.appId,
  databaseURL: Constants.expoConfig.extra.databaseURL, // ✅ Asegúrate de que esté en app.json también
};

const app = initializeApp(firebaseConfig);

export const database = getFirestore(app);
export const realtimeDB = getDatabase(app); // ✅ Exportar Realtime Database

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
