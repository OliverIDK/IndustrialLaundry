import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  onSnapshot,
  doc,
  getDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import { database } from "../src/config/fb";
import { TextInput } from "react-native-paper";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Alert } from "react-native";

const AgregarNotaPrendas = ({ route, navigation }) => {
  const { tipoLavadoId, cliente, fecha, tipoNota } = route.params;
  const [prendas, setPrendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState({});
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    const q = query(
      collection(database, "precios"),
      where("tipoLavadoId", "==", tipoLavadoId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const precios = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const prendasPromises = precios.map(async (precio) => {
          const prendaRef = doc(database, "prendas", precio.prendaId);
          const prendaSnap = await getDoc(prendaRef);

          if (!prendaSnap.exists()) return null;

          const prendaData = prendaSnap.data();

          // Filtrar por tipo de nota
          if (prendaData.tipo !== tipoNota) return null;

          return {
            ...precio,
            prendaId: precio.prendaId,
            nombre: prendaData.nombre,
            tipo: prendaData.tipo,
          };
        });

        const prendasConNombre = (await Promise.all(prendasPromises)).filter(
          Boolean
        );

        // Filtrar duplicados por prendaId
        const prendasFiltradas = prendasConNombre.filter(
          (item, index, self) =>
            index === self.findIndex((p) => p.prendaId === item.prendaId)
        );

        setPrendas(prendasFiltradas);

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar prendas con precio:", error);
        setLoading(false);
      }
    });

    // Limpiar el listener al desmontar
    return () => unsubscribe();
  }, [tipoLavadoId, tipoNota]);

  const incrementar = (id, precio) => {
    const cantidad = (cantidadSeleccionada[id] || 0) + 1;
    setCantidadSeleccionada((prev) => ({ ...prev, [id]: cantidad }));
    setSubtotal((prev) => prev + precio);
  };

  const decrementar = (id, precio) => {
    const cantidadActual = cantidadSeleccionada[id] || 0;
    if (cantidadActual > 0) {
      const cantidad = cantidadActual - 1;
      setCantidadSeleccionada((prev) => ({ ...prev, [id]: cantidad }));
      setSubtotal((prev) => prev - precio);
    }
  };

  const handleCantidadManual = (text, id, precio) => {
    let valor = parseInt(text);
    if (isNaN(valor) || valor < 0) valor = 0;

    const cantidadAnterior = cantidadSeleccionada[id] || 0;
    const diferencia = valor - cantidadAnterior;

    setCantidadSeleccionada((prev) => ({ ...prev, [id]: valor }));
    setSubtotal((prev) => prev + diferencia * precio);
  };

  const continuar = () => {
  const seleccion = prendas
    .filter((p) => cantidadSeleccionada[p.id] > 0)
    .map((p) => ({
      prendaId: p.prendaId,
      nombre: p.nombre,
      precio: p.precio,
      cantidad: cantidadSeleccionada[p.id],
    }));

  if (seleccion.length === 0) {
    Alert.alert("Aviso", "Debes seleccionar al menos una prenda para continuar.");
    return;
  }

  navigation.navigate("AgregarNotaEntrega", {
    cliente,
    fecha,
    tipoLavadoId,
    tipoNota,
    prendas: seleccion,
    subtotal,
  });
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Cargando prendas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Selecciona las prendas</Text>
      <FlatList
        data={prendas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.nombre}>{item.nombre}</Text>
                <Text style={styles.precio}>Precio: ${item.precio}</Text>
              </View>
              <View style={styles.controles}>
                <TouchableOpacity
                  style={styles.botonCircular}
                  onPress={() => decrementar(item.id, item.precio)}
                >
                  <AntDesign name="minus" size={20} color="#004AAD" />
                </TouchableOpacity>

                <TextInput
                  mode="outlined"
                  keyboardType="numeric"
                  dense
                  style={styles.inputCantidad}
                  value={(cantidadSeleccionada[item.id] || 0).toString()}
                  outlineStyle={{
                    borderRadius: 20,
                    borderColor: "#fff",
                    textAlign: "center", // ← Centrado horizontal
                    textAlignVertical: "center", // ← Centrado vertical (solo Android)
                  }}
                  onChangeText={(text) => {
                    const nuevaCantidad = parseInt(text) || 0;
                    const diferencia =
                      nuevaCantidad - (cantidadSeleccionada[item.id] || 0);
                    setCantidadSeleccionada((prev) => ({
                      ...prev,
                      [item.id]: nuevaCantidad,
                    }));
                    setSubtotal((prev) => prev + diferencia * item.precio);
                  }}
                />

                <TouchableOpacity
                  style={styles.botonCircular}
                  onPress={() => incrementar(item.id, item.precio)}
                >
                  <AntDesign name="plus" size={20} color="#004AAD" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
      {/* Footer fijo */}
      <View style={styles.footer}>
        <View style={{ alignItems: "flex-start" }}>
          <Text style={styles.subtotal}>Subtotal:</Text>
          <Text style={styles.priceSubtotal}>${subtotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.botonContinuar, { alignItems: "flex-end" }]}
          onPress={continuar}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.textoContinuar}>Continuar</Text>
            <AntDesign
              name="right"
              size={18}
              color="white"
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AgregarNotaPrendas;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    elevation: 1,
    height: 60,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "600",
  },
  precio: {
    fontSize: 14,
    color: "#555",
  },
  controles: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inputCantidad: {
    backgroundColor: "#fff",
    width: 40,
    fontSize: 18,
    marginHorizontal: 4,
  },
  botonCircular: {
    padding: 4,
    borderRadius: 50,
    backgroundColor: "#edf5ff",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Espacio para no tapar contenido con el footer
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 0.1,
    borderTopColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    elevation: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: 100,
  },
  subtotal: {
    fontSize: 20,
    color: "#333",
  },
  priceSubtotal: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#333",
  },
  botonContinuar: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 2,
    width: 150,
  },
  textoContinuar: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
});
