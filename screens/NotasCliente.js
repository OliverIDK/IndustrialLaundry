import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, database } from "../src/config/fb";
import { AnimatedCircularProgress } from "react-native-circular-progress";

const obtenerProgreso = (estado, metodoEntrega) => {
  const ESTADOS_DELIVERY = [
    "Recibido",
    "En Lavado",
    "En Secado",
    "En Planchado y/o Doblado",
    "Listo para entrega",
    "En camino",
    "Entregado",
  ];

  const ESTADOS_PICKUP = [
    "Recibido",
    "En Lavado",
    "En Secado",
    "En Planchado y/o Doblado",
    "Listo para entrega",
    "Entregado",
  ];

  const estados =
    metodoEntrega === "Delivery" ? ESTADOS_DELIVERY : ESTADOS_PICKUP;
  const index = estados.indexOf(estado);
  if (index === -1) return 0;

  const porcentajePorEstado = 100 / (estados.length - 1);
  return Math.round(index * porcentajePorEstado);
};

const NotasCliente = ({ navigation }) => {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const notasRef = collection(database, "notas");
        const qNotas = query(notasRef, where("cliente.uid", "==", user.uid));
        const notasSnap = await getDocs(qNotas);

        const notasData = notasSnap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((nota) => nota.estado !== "Entregado");

        setNotas(notasData);
      } catch (error) {
        console.error("Error al cargar notas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotas();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#004aad" />
      </View>
    );
  }

  if (notas.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "#555" }}>
          No tienes notas activas.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.notaItem}
            onPress={() => navigation.navigate("Steps", { nota: item })}
          >
            <View style={styles.notaContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notaId}>#{item.idNota}</Text>
                <Text style={styles.label}>Fecha:</Text>
                <Text style={styles.value}>
                  {new Date(item.fecha).toLocaleDateString()}
                </Text>

                <Text style={styles.label}>Entrega:</Text>
                <Text style={styles.value}>{item.metodoEntrega}</Text>

                <Text style={styles.label}>Total:</Text>
                <Text style={styles.total}>
                  ${item.subtotal?.toFixed(2) || "0.00"}
                </Text>
              </View>

              <View style={styles.progresoContainer}>
                <AnimatedCircularProgress
                  size={55}
                  width={5}
                  fill={obtenerProgreso(item.estado, item.metodoEntrega)}
                  tintColor="#004AAD"
                  backgroundColor="#dcdcdc"
                  rotation={0}
                />
                <Text style={styles.estadoTexto}>{item.estado}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default NotasCliente;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  notaItem: {
    padding: 18,
    backgroundColor: "#f8f9fa",
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  notaContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  notaId: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#004AAD",
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  value: {
    fontSize: 14,
    color: "#222",
    fontWeight: "bold",
  },
  total: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginTop: 2,
  },
  progresoContainer: {
    alignItems: "center",
    marginLeft: 20,
  },
  estadoTexto: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#004AAD",
    textAlign: "center",
    maxWidth: 70,
  },
});
