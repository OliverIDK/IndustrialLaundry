import "dotenv/config";

export default {
  expo: {
    name: "IndustrialLaundry",
    slug: "IndustrialLaundry",
    version: "1.0.0",
    android: {
      package: "com.oliver_andres.IndustrialLaundry"
    },
    plugins: [
      "expo-font"
    ],
    extra: {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
    }
  }
};
