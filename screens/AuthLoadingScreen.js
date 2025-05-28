import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "../src/config/fb";
import { doc, getDoc, setDoc } from "firebase/firestore";
import * as Notifications from "expo-notifications";

const { height, width } = Dimensions.get("window");
const BUBBLE_COUNT = 8;

const Bubble = ({ source, duration }) => {
  const translateY = useRef(new Animated.Value(height + 50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const [startX, setStartX] = useState(0);
  const size = Math.random() * 20 + 30;

  useEffect(() => {
    const animate = () => {
      setStartX(30 + Math.random() * (width - 90));

      translateY.setValue(height + Math.random() * 50);
      translateX.setValue(0);
      opacity.setValue(0.8);
      scale.setValue(1);

      const bubbleAnimation = Animated.timing(translateY, {
        toValue: -150,
        duration,
        useNativeDriver: true,
      });

      const opacityOut = Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        delay: duration - 300,
        useNativeDriver: true,
      });

      const explode = Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 150,
          delay: duration - 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]);

      const horizontalWiggle = Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: 10,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: -10,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      Animated.parallel([
        bubbleAnimation,
        opacityOut,
        explode,
        horizontalWiggle,
      ]).start(() => {
        animate();
      });
    };

    animate();
  }, [translateY, translateX, opacity, scale, duration]);

  return (
    <Animated.Image
      source={source}
      style={[
        styles.bubble,
        {
          left: startX,
          width: size,
          height: size,
          transform: [{ translateY }, { translateX }, { scale }],
          opacity,
        },
      ]}
      resizeMode="contain"
    />
  );
};

async function saveTokenIfNotExists(uid) {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Permiso para notificaciones no otorgado");
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;

    const tokenRef = doc(database, "tokens", uid);
    const tokenSnap = await getDoc(tokenRef);

    if (!tokenSnap.exists()) {
      await setDoc(tokenRef, { uid, token: pushToken });
      console.log("Token guardado para usuario cliente:", uid);
    } else {
      console.log("Token ya registrado para usuario cliente:", uid);
    }
  } catch (error) {
    console.error("Error guardando token de notificación:", error);
  }
}

const AuthLoadingScreen = ({ navigation }) => {
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [logoScale]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(database, "usuarios", user.uid));
          if (userDoc.exists()) {
            const datos = userDoc.data();
            console.log("Usuario autenticado con rol:", datos.rol);

            switch (datos.rol) {
              case "Administrador":
                navigation.reset({ index: 0, routes: [{ name: "TabGroupAdmin" }] });
                break;
              case "Auxiliar":
                navigation.reset({ index: 0, routes: [{ name: "TabGroupAuxiliar" }] });
                break;
              case "Lavador":
                navigation.reset({ index: 0, routes: [{ name: "TabGroupLavador" }] });
                break;
              case "Supervisor":
                navigation.reset({ index: 0, routes: [{ name: "TabGroupSupervisor" }] });
                break;
              case "Chofer":
                navigation.reset({ index: 0, routes: [{ name: "TabGroupChofer" }] });
                break;
              case "Cliente":
                await saveTokenIfNotExists(user.uid);
                navigation.reset({ index: 0, routes: [{ name: "TabGroupCliente" }] });
                break;
              default:
                console.warn("Rol no reconocido:", datos.rol);
                navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            }
          } else {
            console.warn("No existe el documento del usuario");
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          }
        } catch (error) {
          console.error("Error al obtener el usuario:", error);
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }
      } else {
        console.log("No hay usuario autenticado");
        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }, 3000);
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  const bubbles = Array.from({ length: BUBBLE_COUNT }).map((_, i) => {
    const duration = i === 0
      ? 2500
      : 3000 + Math.random() * 3000;

    const source =
      i % 2 === 0
        ? require("../src/Assets/Imagenes/buble1.png")
        : require("../src/Assets/Imagenes/buble2.png");

    return <Bubble key={i} source={source} duration={duration} />;
  });

  return (
    <View style={styles.container}>
      {bubbles}
      <Animated.Image
        source={require("../src/Assets/Imagenes/logo.png")}
        style={[styles.logo, { transform: [{ scale: logoScale }] }]}
        resizeMode="contain"
      />
    </View>
  );
};

export default AuthLoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#004aad",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    zIndex: 2,
  },
  bubble: {
    position: "absolute",
    bottom: 0,
    zIndex: 1,
    
  },
});
