import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { database } from "../src/config/fb";
import { Menu, IconButton } from "react-native-paper";

const eliminarUsuario = async (id) => {
  try {
    await deleteDoc(doc(database, "usuarios", id));
    console.log("Usuario eliminado con ID:", id);
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
  }
};

const Usuarios = ({ navigation }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleMenuId, setVisibleMenuId] = useState(null);

  const abrirMenu = (id) => setVisibleMenuId(id);
  const cerrarMenu = () => setVisibleMenuId(null);

  useEffect(() => {
    const usuariosRef = collection(database, "usuarios");
    const unsubscribe = onSnapshot(
      usuariosRef,
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsuarios(lista);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener usuarios:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usuarios</Text>

      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.usuarioCard}>
            <View style={styles.row}>
              <Image
                source={
                  item.avatarUrl
                    ? { uri: item.avatarUrl }
                    : require("../src/Assets/Imagenes/empleado.png")
                }
                style={styles.avatar}
              />

              <View style={styles.infoContainer}>
                <Text style={styles.nombre}>{item.nombre}</Text>
                <Text style={styles.rol}>{item.rol}</Text>
              </View>

              <Menu
                visible={visibleMenuId === item.id}
                onDismiss={cerrarMenu}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={24}
                    onPress={() => abrirMenu(item.id)}
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    cerrarMenu();
                    navigation.navigate("EditarUsuario", { usuario: item });
                  }}
                  title="Editar"
                />
                <Menu.Item
                  onPress={() => {
                    cerrarMenu();
                    Alert.alert(
                      "¿Eliminar usuario?",
                      `¿Estás seguro de eliminar a "${item.nombre}"?`,
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Eliminar",
                          style: "destructive",
                          onPress: () => eliminarUsuario(item.id),
                        },
                      ]
                    );
                  }}
                  title="Eliminar"
                />
              </Menu>
            </View>
          </View>
        )}
      />

      <Button
        title="Agregar Usuario"
        onPress={() => navigation.navigate("AgregarUsuarios")}
      />
    </View>
  );
};

export default Usuarios;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  usuarioCard: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
  },
  rol: {
    fontSize: 14,
    color: "#555",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
