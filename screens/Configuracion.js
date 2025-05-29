import React, { useEffect, useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native"
import { signOut, getAuth } from "firebase/auth"
import { auth, database } from "../src/config/fb"
import { doc, getDoc } from "firebase/firestore"
import Constants from "expo-constants"

const appVersion =
  Constants.manifest?.version || Constants.expoConfig?.version || "1.0.0"

const Configuracion = ({ navigation }) => {
  const [usuario, setUsuario] = useState({})
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const obtenerUsuario = async () => {
      const user = getAuth().currentUser
      if (!user) return

      try {
        const docRef = doc(database, "usuarios", user.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setUsuario({
            id: user.uid,
            nombre: data.nombre || "",
            email: data.email || user.email || "",
            avatarUrl: data.avatarUrl || null,
            rol: data.rol || "",
            direccion: data.direccion || "",
            telefono: data.telefono || "",
          })
        } else {
          setUsuario({
            id: user.uid,
            nombre: "",
            email: user.email || "",
            avatarUrl: null,
            rol: "",
            direccion: "",
            telefono: "",
          })
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error)
      } finally {
        setCargando(false)
      }
    }

    obtenerUsuario()
  }, [])

  const cerrarSesion = async () => {
    try {
      await signOut(auth)
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  if (cargando) {
    return (
      <View style={styles.container}>
        <Text>Cargando datos...</Text>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={
            usuario.avatarUrl
              ? { uri: usuario.avatarUrl }
              : require("../src/Assets/Imagenes/usuario.png")
          }
          style={styles.profileImage}
        />
        <Text style={styles.greeting}>
          Hola, {usuario.nombre || "Usuario"}
        </Text>
        <Text style={styles.subtitle}>{usuario.rol}</Text>
        <Text style={styles.subtitle}>{usuario.email}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("EditarUsuario", {
            usuario,
          })
        }
      >
        <Text style={styles.buttonText}>Editar perfil</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.version}>Versión {appVersion}</Text>
        <Button title="Cerrar sesión" onPress={cerrarSesion} color="#ff3b30" />
      </View>
    </ScrollView>
  )
}

export default Configuracion

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: "#ccc",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  version: {
    fontSize: 12,
    marginBottom: 10,
    color: "#888",
  },
})
