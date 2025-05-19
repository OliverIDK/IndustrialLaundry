import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert
} from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { database } from "../src/config/fb";
import { doc, deleteDoc } from "firebase/firestore";
import { Menu, IconButton, Provider } from "react-native-paper";

const eliminarProducto = async (id) => {
  try {
    await deleteDoc(doc(database, "inventario", id));
    console.log("Producto eliminado con ID:", id);
  } catch (error) {
    console.error("Error al eliminar producto:", error);
  }
};

const Inventario = ({ navigation }) => {
  const [visibleMenuId, setVisibleMenuId] = useState(null);

  const abrirMenu = (id) => setVisibleMenuId(id);
  const cerrarMenu = () => setVisibleMenuId(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const obtenerProductos = () => {
    const inventarioRef = collection(database, "inventario");
    onSnapshot(
      inventarioRef,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener productos:", error);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventario</Text>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.producto}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View>
                <Text style={styles.nombre}>{item.nombre}</Text>
                <Text>Cantidad: {item.cantidad_actual}</Text>
                <Text>Medida: {item.medida}</Text>
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
                    navigation.navigate("EditarProducto", { producto: item });
                  }}
                  title="Editar"
                />
                <Menu.Item
                  onPress={() => {
                    cerrarMenu();
                    Alert.alert(
                      "¿Eliminar producto?",
                      `¿Estás seguro de que deseas eliminar "${item.nombre}"?`,
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Eliminar",
                          style: "destructive",
                          onPress: () => eliminarProducto(item.id),
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
        title="Agregar Producto"
        onPress={() => navigation.navigate("AgregarProducto")}
      />
    </View>
  );
};

export default Inventario;

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
  producto: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  producto: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    flexDirection: "column",
  },
});
