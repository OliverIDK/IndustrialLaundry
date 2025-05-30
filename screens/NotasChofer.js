import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Pressable,
} from "react-native";
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { database } from "../src/config/fb";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedCircularProgress } from "react-native-circular-progress";

const enviarNotificacion = async (uid, estado) => {
  try {
    const response = await fetch(
      "https://005e5364-527c-403d-b670-2d6b9e6b61d5-00-1uk2rcqp51d99.kirk.replit.dev/enviar-notificacion",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, status: estado }),
      }
    );
    const data = await response.json();
    console.log("Notificación enviada:", data);
  } catch (error) {
    console.error("Error enviando notificación:", error);
  }
};

const NotasChofer = () => {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    // Query para notas asignadas al chofer con estado Listo para entrega o En camino
    const q = query(
      collection(database, "notas"),
      where("estado", "in", ["Listo para entrega", "En camino"]),
      where("chofer.uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotas(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error al escuchar notas:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Animación circular para loading
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setFill((oldFill) => (oldFill >= 100 ? 0 : oldFill + 10));
    }, 300);

    return () => clearInterval(interval);
  }, [loading]);

  const abrirModal = (nota) => {
    setNotaSeleccionada(nota);
    setNuevoEstado(nota.estado);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setNotaSeleccionada(null);
    setNuevoEstado("");
  };

  const cambiarEstado = async () => {
    if (!notaSeleccionada || !nuevoEstado) {
      Alert.alert(
        "Atención",
        "Selecciona un nuevo estado antes de actualizar."
      );
      return;
    }

    try {
      const notaRef = doc(database, "notas", notaSeleccionada.id);
      await updateDoc(notaRef, { estado: nuevoEstado });

      if (notaSeleccionada?.cliente?.uid) {
        await enviarNotificacion(notaSeleccionada.cliente.uid, nuevoEstado);
      }

      Alert.alert("Éxito", `Estado actualizado a "${nuevoEstado}"`);
      cerrarModal();
    } catch (error) {
      console.error("Error actualizando estado:", error);
      Alert.alert(
        "Error",
        "No se pudo actualizar el estado. Intenta de nuevo."
      );
    }
  };

if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <Text>Cargando...</Text>
      <AnimatedCircularProgress
        size={100}
        width={10}
        fill={fill}
        tintColor="#004AAD"
        backgroundColor="#e4e4e4"
        rotation={0}
      />
    </View>
  );
}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notas asignadas</Text>

      {notas.length === 0 ? (
        <Text style={styles.noNotasText}>No tienes notas asignadas.</Text>
      ) : (
        <FlatList
          data={notas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.notaItem}
              onPress={() => abrirModal(item)}
            >
              <Text style={styles.nombre}>{item.cliente?.nombre}</Text>
              <Text style={styles.direccion}>{item.cliente?.direccion}</Text>
              <Text style={styles.estado}>Estado: {item.estado}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={cerrarModal}
      >
        <Pressable style={styles.modalOverlay} onPress={cerrarModal}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <TouchableOpacity style={styles.closeIcon} onPress={cerrarModal}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Cambiar estado de la nota</Text>

            <Text style={styles.modalText}>
              Cliente: {notaSeleccionada?.cliente?.nombre || "N/A"}
            </Text>
            <Text style={styles.modalText}>
              Estado actual: {notaSeleccionada?.estado || "N/A"}
            </Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={nuevoEstado}
                onValueChange={(value) => setNuevoEstado(value)}
                style={styles.picker}
                dropdownIconColor="#004AAD"
              >
                <Picker.Item
                  label="Listo para entrega"
                  value="Listo para entrega"
                />
                <Picker.Item label="En camino" value="En camino" />
                <Picker.Item label="Entregado" value="Entregado" />
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.btnActualizar}
              onPress={cambiarEstado}
            >
              <Text style={styles.btnText}>Actualizar estado</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default NotasChofer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
  },
  noNotasText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginTop: 30,
  },
  notaItem: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    marginVertical: 6,
    borderRadius: 10,
    elevation: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "600",
  },
  direccion: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  estado: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    width: "85%",
    borderRadius: 12,
    elevation: 6,
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    fontSize: 15,
    marginBottom: 8,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e4e4e4",
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: "#e4e4e4",
  },
  picker: {
    height: 55,
    width: "100%",
    color: "#000",
  },
  btnActualizar: {
    marginTop: 20,
    backgroundColor: "#004AAD",
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#555",
  },
});
