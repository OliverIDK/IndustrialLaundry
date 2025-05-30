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
      "expo-font",
      [
        "expo-image-picker",
        {
          photosPermission: "Necesitamos acceso a tus fotos para que puedas seleccionar una imagen de perfil."
        }
      ]
    ],
    updates: {
      url: "https://u.expo.dev/f0a008ef-074d-45f4-a306-78c52b7b0eef"
    },
    runtimeVersion: "1.0.0",
    extra: {
      //Firebase
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      databaseURL: process.env.DATABASEURL,
      //Supabase
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "f0a008ef-074d-45f4-a306-78c52b7b0eef"
      }
    }
  }
};
