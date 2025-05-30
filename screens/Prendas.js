import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { database } from "../src/config/fb";
import { Menu, IconButton } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";

const eliminarPrenda = async (id) => {
  try {
    await deleteDoc(doc(database, "prendas", id));
    console.log("Prenda eliminada con ID:", id);
  } catch (error) {
    console.error("Error al eliminar prenda:", error);
  }
};

const Prendas = ({ navigation }) => {
  const [prendas, setPrendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleMenuId, setVisibleMenuId] = useState(null);

  const abrirMenu = (id) => setVisibleMenuId(id);
  const cerrarMenu = () => setVisibleMenuId(null);

  useEffect(() => {
    const prendasRef = collection(database, "prendas");
    const unsubscribe = onSnapshot(
      prendasRef,
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPrendas(lista);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener prendas:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Limpia la suscripción
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando prendas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={prendas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }} // <--- Espacio adicional
        renderItem={({ item }) => (
          <View style={styles.producto}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View>
                <Text style={styles.nombre}>{item.nombre}</Text>
                <Text>Tipo: {item.tipo}</Text>
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
                    navigation.navigate("EditarPrenda", { prenda: item });
                  }}
                  title="Editar"
                />
                <Menu.Item
                  onPress={() => {
                    cerrarMenu();
                    Alert.alert(
                      "¿Eliminar prenda?",
                      `¿Estás seguro de que deseas eliminar "${item.nombre}"?`,
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Eliminar",
                          style: "destructive",
                          onPress: () => eliminarPrenda(item.id),
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

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate("AgregarPrenda")}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Prendas;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  producto: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    flexDirection: "column",
    borderColor: "#ccc",
    borderWidth: 1,
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
  boton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#004AAD",
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    elevation: 2,
  },
});
