import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Button,
  TouchableOpacity,
} from "react-native";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { database } from "../src/config/fb";
import { SwipeListView } from "react-native-swipe-list-view";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const eliminarProducto = async (id) => {
  try {
    await deleteDoc(doc(database, "inventario", id));
    console.log("Producto eliminado con ID:", id);
  } catch (error) {
    console.error("Error al eliminar producto:", error);
  }
};

const Inventario = ({ navigation }) => {
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

  const renderItem = (data) => {
    const producto = data.item;
    const iconoStock =
      producto.cantidad_actual <= 3 ? (
        <MaterialIcons name="trending-down" size={28} color="red" />
      ) : (
        <MaterialIcons name="trending-up" size={28} color="green" />
      );

    return (
      <View style={styles.rowFront}>
        <View>
          <Text style={styles.nombre}>{producto.nombre}</Text>
          <Text>Cantidad: {producto.cantidad_actual}</Text>
          <Text>Medida: {producto.medida}</Text>
        </View>
        <View>{iconoStock}</View>
      </View>
    );
  };

  const renderHiddenItem = (data) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: "#fff" }]}
        onPress={() =>
          navigation.navigate("EditarProducto", { producto: data.item })
        }
      >
        <AntDesign name="edit" size={24} color="#4a73ff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: "#fff" }]}
        onPress={() =>
          Alert.alert(
            "¿Eliminar producto?",
            `¿Estás seguro de que deseas eliminar "${data.item.nombre}"?`,
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Eliminar",
                style: "destructive",
                onPress: () => eliminarProducto(data.item.id),
              },
            ]
          )
        }
      >
        <FontAwesome name="trash-o" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

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
      <SwipeListView
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-150}
        disableRightSwipe
      />
      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate("AgregarProducto")}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Inventario;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  rowFront: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 80, // <-- altura fija
    borderColor: "#ccc",
    borderWidth: 0.3,
  },
  rowBack: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#e9ecfd",
    marginBottom: 10,
    borderRadius: 10,
    paddingRight: 12,
    height: 80, // <-- misma altura
    gap: 10,
    
  },
  backButton: {
    width: 50,
    height: 50, // altura fija, pero centrado verticalmente
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#fff",
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
