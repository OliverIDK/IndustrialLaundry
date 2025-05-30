import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { database } from "../src/config/fb";
import { useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native-paper";
import { useFonts } from "expo-font";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Picker } from "@react-native-picker/picker";
import { AntDesign } from "@expo/vector-icons";

const NotasAuxiliar = () => {
  const [notas, setNotas] = useState([]);
  const [tiposLavado, setTiposLavado] = useState({});
  const navigation = useNavigation();
  const [busqueda, setBusqueda] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);

  const [fontsLoaded] = useFonts({
    "Quicksand-Regular": require("../src/Assets/fonts/Quicksand-Regular.ttf"),
    "Quicksand-SemiBold": require("../src/Assets/fonts/Quicksand-SemiBold.ttf"),
    "Raleway-Regular": require("../src/Assets/fonts/Raleway-Regular.ttf"),
    "Montserrat-Regular": require("../src/Assets/fonts/Montserrat-Regular.ttf"),
    "Poppins-Regular": require("../src/Assets/fonts/Poppins-Regular.ttf"),
  });

  useEffect(() => {
    const tiposLavadoRef = collection(database, "tipos_lavado");
    const unsubscribeTipos = onSnapshot(tiposLavadoRef, (snapshot) => {
      const tipos = {};
      snapshot.forEach((doc) => {
        tipos[doc.id] = doc.data().nombre;
      });
      setTiposLavado(tipos);
    });

    const estadosFiltro = ["En Planchado y/o Doblado", "En Secado"];
    const notasRef = query(
      collection(database, "notas"),
      where("estado", "in", estadosFiltro)
    );
    const unsubscribeNotas = onSnapshot(notasRef, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotas(lista);
    });

    return () => {
      unsubscribeTipos();
      unsubscribeNotas();
    };
  }, []);

  const filtrarNotas = () => {
    if (busqueda.trim() === "") return notas;
    return notas.filter((nota) => {
      const nombreCliente = nota.cliente?.nombre?.toLowerCase() || "";
      return nombreCliente.includes(busqueda.toLowerCase());
    });
  };

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

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "---";
    const fecha = new Date(fechaString);
    if (isNaN(fecha)) return fechaString;
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  const renderItem = ({ item }) => {
    if (item.placeholder) {
      return (
        <View
          style={[
            styles.nota,
            { backgroundColor: "transparent", elevation: 0 },
          ]}
        />
      );
    }

    return (
      <TouchableOpacity
        style={styles.nota}
        onPress={() => {
          setNotaSeleccionada(item);
          setEstadoSeleccionado(item.estado);
          setModalVisible(true);
        }}
      >
        <Text style={styles.tituloCliente}>
          {item.cliente?.nombre || "Cliente"}
        </Text>

        <Text style={styles.texto}>Fecha: {formatearFecha(item.fecha)}</Text>

        <Text style={styles.texto}>
          Lavado: {tiposLavado[item.tipoLavadoId] || "Sin especificar"}
        </Text>

        <View style={styles.prendasContainer}>
          {Array.isArray(item.prendas) &&
            item.prendas.map((prenda, index) => (
              <View key={index} style={styles.prendaRow}>
                <Text style={styles.prendaNombre}>{prenda.nombre}</Text>
                <Text style={styles.cantidad}>{prenda.cantidad}</Text>
              </View>
            ))}
        </View>

        {/* Relleno flexible para empujar el estado al fondo */}
        <View style={{ flexGrow: 1 }} />

        <View style={styles.estadoContainer}>
          <AnimatedCircularProgress
            size={40}
            width={4}
            fill={obtenerProgreso(item.estado, item.metodoEntrega)}
            tintColor="#004AAD"
            backgroundColor="#e0e0e0"
            rotation={0}
          />
          <Text style={styles.estadoTextoExterno}>{item.estado}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const datos = filtrarNotas();
  if (datos.length % 2 !== 0) {
    datos.push({ id: "placeholder", placeholder: true });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={datos}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        ListEmptyComponent={
          <Text style={styles.vacio}>No hay notas registradas.</Text>
        }
        numColumns={2}
        columnWrapperStyle={styles.fila}
        contentContainerStyle={{ paddingBottom: 100 }}
        key={"2cols"}
      />

      {notaSeleccionada && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setModalVisible(false)}
          >
            <Pressable
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 20,
                width: "80%",
                alignItems: "center",
                elevation: 5,
              }}
              onPress={() => {}}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Quicksand-SemiBold",
                  marginBottom: 10,
                }}
              >
                Cambiar estado
              </Text>

              <Picker
                selectedValue={estadoSeleccionado}
                onValueChange={(itemValue) => setEstadoSeleccionado(itemValue)}
                style={{ width: "100%" }}
              >
                {["En Planchado y/o Doblado", "Listo para entrega"].map(
                  (estado) => (
                    <Picker.Item key={estado} label={estado} value={estado} />
                  )
                )}
              </Picker>

              <TouchableOpacity
                style={{
                  marginTop: 20,
                  backgroundColor: "#004AAD",
                  paddingVertical: 10,
                  paddingHorizontal: 25,
                  borderRadius: 25,
                }}
                onPress={async () => {
                  try {
                    const notaRef = doc(database, "notas", notaSeleccionada.id);
                    await updateDoc(notaRef, { estado: estadoSeleccionado });
                    setModalVisible(false);
                  } catch (error) {
                    console.error("Error al actualizar estado:", error);
                  }
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Guardar
                </Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      )}
      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate("AgregarNota")}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default NotasAuxiliar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: 15,
  },
  nota: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    flex: 1,
    marginHorizontal: 8,
    minWidth: 150,
  },
  tituloCliente: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  texto: {
    fontSize: 14,
  },
  prendasContainer: {
    marginTop: 10,
  },
  prendaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  prendaNombre: {
    fontSize: 13,
    color: "#555",
  },
  cantidad: {
    fontSize: 13,
    color: "#555",
  },
estadoContainer: {
  marginTop: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  flexWrap: "wrap",
},
estadoTextoExterno: {
  maxWidth: 80,
  fontSize: 12,
  color: "#004AAD",
  fontWeight: "bold",
  textAlign: "center",
},

  vacio: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 30,
    color: "#777",
  },
  fila: {
    justifyContent: "space-between",
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
  },
});
