import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Button,
  Modal,
  TextInput,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { database } from "../src/config/fb";
import { IconButton } from "react-native-paper";

const PrecioPrenda = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [conPrecio, setConPrecio] = useState([]);
  const [sinPrecio, setSinPrecio] = useState([]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [precioEditado, setPrecioEditado] = useState("");
  const [precioSeleccionado, setPrecioSeleccionado] = useState(null);

  useEffect(() => {
    const unsubscribePrendas = onSnapshot(
      collection(database, "prendas"),
      (prendasSnapshot) => {
        const prendas = prendasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const unsubscribeTipos = onSnapshot(
          collection(database, "tipos_lavado"),
          (tiposSnapshot) => {
            const tipos = tiposSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            const unsubscribePrecios = onSnapshot(
              collection(database, "precios"),
              (preciosSnapshot) => {
                const precios = preciosSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));

                const preciosMap = new Set(
                  precios.map((p) => `${p.prendaId}_${p.tipoLavadoId}`)
                );

                const conPrecioTemp = [];
                const sinPrecioTemp = [];

                for (const prenda of prendas) {
                  for (const tipo of tipos) {
                    const key = `${prenda.id}_${tipo.id}`;
                    if (preciosMap.has(key)) {
                      const precioItem = precios.find(
                        (p) =>
                          p.prendaId === prenda.id && p.tipoLavadoId === tipo.id
                      );
                      conPrecioTemp.push({
                        id: precioItem.id, // ID del documento en 'precios'
                        prenda,
                        tipo,
                        precio: precioItem.precio,
                      });
                    } else {
                      sinPrecioTemp.push({
                        prenda,
                        tipo,
                      });
                    }
                  }
                }

                setConPrecio(conPrecioTemp);
                setSinPrecio(sinPrecioTemp);
                setLoading(false);
              }
            );

            return () => unsubscribePrecios();
          }
        );

        return () => unsubscribeTipos();
      }
    );

    return () => unsubscribePrendas();
  }, []);

  const abrirModalEdicion = (item) => {
    setPrecioSeleccionado(item);
    setPrecioEditado(item.precio.toString());
    setModalVisible(true);
  };

  const guardarNuevoPrecio = async () => {
    if (!precioSeleccionado || precioEditado === "") return;

    try {
      const precioRef = doc(database, "precios", precioSeleccionado.id);
      await updateDoc(precioRef, {
        precio: parseFloat(precioEditado),
      });
      setModalVisible(false);
    } catch (error) {
      console.error("Error al actualizar precio:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Precios Asignados</Text>
      <FlatList
        data={conPrecio}
        keyExtractor={(item, index) =>
          `${item.prenda.id}_${item.tipo.id}_${index}`
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>
              {item.prenda.nombre} - {item.tipo.nombre}: ${item.precio}
            </Text>
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => abrirModalEdicion(item)}
            />
          </View>
        )}
      />

      <Text style={styles.title}>Sin Precio</Text>
      <FlatList
        data={sinPrecio}
        keyExtractor={(item, index) =>
          `${item.prenda.id}_${item.tipo.id}_${index}`
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>
              {item.prenda.nombre} - {item.tipo.nombre}
            </Text>
            <Button
              title="Asignar Precio"
              color="#2196f3"
              onPress={() =>
                navigation.navigate("AgregarPrecio", {
                  prendaId: item.prenda.id,
                  tipoLavadoId: item.tipo.id,
                  prendaNombre: item.prenda.nombre,
                  tipoNombre: item.tipo.nombre,
                })
              }
            />
          </View>
        )}
      />

      {/* Modal para editar precio */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Precio</Text>
            <TextInput
              value={precioEditado}
              onChangeText={setPrecioEditado}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              <Button
                title="Guardar"
                onPress={guardarNuevoPrecio}
                color="#2196f3"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PrecioPrenda;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#2196f3",
  },
  item: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    flex: 1,
  },
  editButton: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editText: {
    fontSize: 24,
    color: "#2196f3",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    width: "100%",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  
});
