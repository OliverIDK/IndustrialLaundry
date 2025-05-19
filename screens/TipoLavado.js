import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Button
} from "react-native";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { database } from "../src/config/fb";
import { Menu, IconButton } from "react-native-paper";

const eliminarTipo = async (id) => {
  try {
    await deleteDoc(doc(database, "tipos_lavado", id));
    console.log("Tipo de lavado eliminado:", id);
  } catch (error) {
    console.error("Error al eliminar tipo de lavado:", error);
  }
};

const TipoLavado = ({ navigation }) => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleMenuId, setVisibleMenuId] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(database, "tipos_lavado"),
      (snapshot) => {
        const datos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTipos(datos);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener tipos:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const abrirMenu = (id) => setVisibleMenuId(id);
  const cerrarMenu = () => setVisibleMenuId(null);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando tipos de lavado...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tipos de Lavado</Text>
      <FlatList
        data={tipos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.nombre}>{item.nombre}</Text>
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
                    navigation.navigate("EditarTipoLavado", { tipo: item });
                  }}
                  title="Editar"
                />
                <Menu.Item
                  onPress={() => {
                    cerrarMenu();
                    Alert.alert(
                      "¿Eliminar tipo de lavado?",
                      `¿Estás seguro que deseas eliminar "${item.nombre}"?`,
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Eliminar",
                          style: "destructive",
                          onPress: () => eliminarTipo(item.id),
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
        title="Agregar Tipo de Lavado"
        onPress={() => navigation.navigate("AgregarTipoLavado")}
        color="#007bff"
      />
    </View>
  );
};

export default TipoLavado;

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
  item: {
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
});
