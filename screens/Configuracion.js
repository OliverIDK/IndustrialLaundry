import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Switch,
  Button,
  useColorScheme,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../src/config/fb";

const Configuracion = ({ navigation }) => {
  const sistemaTema = useColorScheme(); // 'light' o 'dark'
  const [modoOscuro, setModoOscuro] = useState(sistemaTema === "dark");

  useEffect(() => {
    // Aquí podrías guardar la preferencia en AsyncStorage si quieres que persista
  }, [modoOscuro]);

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: modoOscuro ? "#000" : "#fff" },
      ]}
    >
      <Text style={[styles.titulo, { color: modoOscuro ? "#fff" : "#000" }]}>
        Configuración
      </Text>

      <View style={styles.item}>
        <Text style={{ color: modoOscuro ? "#fff" : "#000" }}>
          Modo oscuro
        </Text>
        <Switch
          value={modoOscuro}
          onValueChange={setModoOscuro}
          thumbColor={modoOscuro ? "#fff" : "#000"}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
        />
      </View>

      <Button title="Cerrar sesión" onPress={cerrarSesion} />
    </View>
  );
};

export default Configuracion;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
});
