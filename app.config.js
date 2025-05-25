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
    updates: {
      url: "https://u.expo.dev/f0a008ef-074d-45f4-a306-78c52b7b0eef"
    },
    runtimeVersion: "1.0.0",
    extra: {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      eas: {
        projectId: "f0a008ef-074d-45f4-a306-78c52b7b0eef"
      }
    }
  }
};
