import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ImageBackground,
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
import { AntDesign } from "@expo/vector-icons";
import { TextInput } from "react-native-paper";
import { useFonts } from "expo-font";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Modal, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";

const Blancos = () => {
  const toggleEstado = (estado) => {
    if (estadosSeleccionados.includes(estado)) {
      setEstadosSeleccionados(estadosSeleccionados.filter((e) => e !== estado));
    } else {
      setEstadosSeleccionados([...estadosSeleccionados, estado]);
    }
  };

  const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);
  const ESTADOS = [
    "Recibido",
    "En Lavado",
    "En Secado",
    "En Planchado y/o Doblado",
    "Listo para entrega",
    "En camino",
    "Entregado",
  ];
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState(""); // "" = sin filtro
  const [mostrarFiltroEstado, setMostrarFiltroEstado] = useState(false);
  const [notas, setNotas] = useState([]);
  const [tiposLavado, setTiposLavado] = useState({});
  const navigation = useNavigation();
  const [busqueda, setBusqueda] = useState("");
  const [isFocused, setIsFocused] = useState(false);
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

  const filtrarNotas = () => {
    let resultado = notas;

    if (busqueda.trim() !== "") {
      resultado = resultado.filter((nota) => {
        const nombreCliente = nota.cliente?.nombre?.toLowerCase() || "";
        return nombreCliente.includes(busqueda.toLowerCase());
      });
    }

    if (estadosSeleccionados.length > 0) {
      resultado = resultado.filter((nota) =>
        estadosSeleccionados.includes(nota.estado)
      );
    }

    return resultado;
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

    if (index === -1) return 0; // Estado no encontrado

    const porcentajePorEstado = 100 / (estados.length - 1); // -1 para que el último sea 100%
    return Math.round(index * porcentajePorEstado);
  };

  // Obtener tipos de lavado
  useEffect(() => {
    const q = collection(database, "tipos_lavado");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tipos = {};
      snapshot.forEach((doc) => {
        tipos[doc.id] = doc.data().nombre;
      });
      setTiposLavado(tipos);
    });

    return () => unsubscribe();
  }, []);

  // Obtener notas de tipo "Blancos"
  useEffect(() => {
    const q = query(
      collection(database, "notas"),
      where("tipoNota", "==", "Blancos")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotas(lista);
    });

    return () => unsubscribe();
  }, []);

  // Formato de fecha
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "---";
    const fecha = new Date(fechaString);
    if (isNaN(fecha)) return fechaString;
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  // Render de cada nota
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.nota}>
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

      {/* Estado visual con progreso circular */}
      <View style={styles.estadoContainer}>
        <TouchableOpacity
          onPress={() => {
            setNotaSeleccionada(item);
            setEstadoSeleccionado(item.estado);
            setModalVisible(true);
          }}
        >
          <AnimatedCircularProgress
            size={40}
            width={4}
            fill={obtenerProgreso(item.estado, item.metodoEntrega)}
            tintColor="#004AAD"
            backgroundColor="#e0e0e0"
            rotation={0}
          />
        </TouchableOpacity>
        <Text style={styles.estadoTextoExterno}>{item.estado}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <TextInput
          mode="outlined"
          placeholder="Buscar nota"
          value={busqueda}
          onChangeText={setBusqueda}
          style={{
            flex: 1,
            borderRadius: 25,
            backgroundColor: "#f1f1f1",
            marginTop: -15,
          }}
          left={<TextInput.Icon icon="magnify" />}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          outlineStyle={{
            borderRadius: 25,
            borderColor: "#f1f1f1",
            ActiveOutlineColor: "#f1f1f1",
          }}
          theme={{
            colors: {
              background: "#f1f1f1",
              placeholder: "#888",
              text: "#000",
            },
          }}
        />

        {/* Botón de filtro al lado */}
        <TouchableOpacity
          onPress={() => setModalFiltroVisible(true)}
          style={{
            marginLeft: 15,
            marginRight: 15,
            marginTop: -12,
            padding: 5,
          }}
        >
          <ImageBackground
            source={require("../src/Assets/Imagenes/filtrar.png")}
            style={{
              width: 25,
              height: 25,
              justifyContent: "center",
              alignItems: "center",
              margin: 2,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Modal
          visible={modalFiltroVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalFiltroVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setModalFiltroVisible(false)}
          >
            <Pressable
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 20,
                width: "80%",
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
                Filtrar por estado
              </Text>

              {ESTADOS.map((estado, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => toggleEstado(estado)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 5,
                  }}
                >
                  <View
                    style={{
                      height: 20,
                      width: 20,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: "#004AAD",
                      backgroundColor: estadosSeleccionados.includes(estado)
                        ? "#004AAD"
                        : "white",
                      marginRight: 10,
                    }}
                  />
                  <Text style={{ fontSize: 14 }}>{estado}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={{
                  backgroundColor: "#004AAD",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  marginTop: 15,
                }}
                onPress={() => setModalFiltroVisible(false)}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Aplicar filtros
                </Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
      <FlatList
        data={filtrarNotas()}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
            onPress={() => setModalVisible(false)} // 👉 cerrar al hacer clic fuera
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
              onPress={() => {}} // 👉 evitar que el clic dentro cierre el modal
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
                {(notaSeleccionada.metodoEntrega === "Delivery"
                  ? [
                      "Recibido",
                      "En Lavado",
                      "En Secado",
                      "En Planchado y/o Doblado",
                      "Listo para entrega",
                      "En camino",
                      "Entregado",
                    ]
                  : [
                      "Recibido",
                      "En Lavado",
                      "En Secado",
                      "En Planchado y/o Doblado",
                      "Listo para entrega",
                      "Entregado",
                    ]
                ).map((estado, idx) => (
                  <Picker.Item key={idx} label={estado} value={estado} />
                ))}
              </Picker>

              <TouchableOpacity
                style={{
                  backgroundColor: "#004AAD",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  marginTop: 15,
                }}
                onPress={async () => {
                  try {
                    const docRef = doc(database, "notas", notaSeleccionada.id);
                    await updateDoc(docRef, {
                      estado: estadoSeleccionado,
                    });
                    setModalVisible(false);
                  } catch (e) {
                    console.error("Error al actualizar estado:", e);
                  }
                }}
              >
                <Text
                  style={{ color: "white", fontFamily: "Quicksand-Regular" }}
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

export default Blancos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    padding: 8,
    backgroundColor: "#fff",
  },
  fila: {
    justifyContent: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  nota: {
    flexBasis: "49%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    minHeight: 150,
    justifyContent: "space-between",
    borderColor: "#c0c0c0",
    borderWidth: 1.2,
  },
  tituloCliente: {
    fontSize: 16,
    color: "#1d3557",
    marginBottom: 8,
    fontFamily: "Quicksand-Medium",
  },
  texto: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
    fontFamily: "Quicksand-Regular",
  },
  prendasContainer: {
    marginTop: 8,
  },
  prendaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  prendaNombre: {
    fontSize: 14,
    color: "#000",
    fontFamily: "Quicksand-Regular",
  },
  cantidad: {
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
  },
  vacio: {
    textAlign: "center",
    marginTop: 30,
    fontStyle: "italic",
    color: "#888",
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
  estadoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8, // o usa marginRight en el círculo si gap no funciona
  },
  estadoTextoExterno: {
    fontSize: 12,
    color: "#004AAD",
    fontFamily: "Quicksand-Medium",
  },
});
