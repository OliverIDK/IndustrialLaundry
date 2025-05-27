import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { database } from "../src/config/fb";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from '@expo/vector-icons';
import { TextInput } from "react-native-paper";
import { useFonts } from "expo-font";

const Blancos = () => {
  const [notas, setNotas] = useState([]);
  const [tiposLavado, setTiposLavado] = useState({});
  const navigation = useNavigation();
  const [busqueda, setBusqueda] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const [fontsLoaded] = useFonts({
    'Quicksand-Regular': require('../src/Assets/fonts/Quicksand-Regular.ttf'),
    'Quicksand-SemiBold': require('../src/Assets/fonts/Quicksand-SemiBold.ttf'),
    'Raleway-Regular': require('../src/Assets/fonts/Raleway-Regular.ttf'),
    'Montserrat-Regular': require('../src/Assets/fonts/Montserrat-Regular.ttf'),
    'Poppins-Regular': require('../src/Assets/fonts/Poppins-Regular.ttf'),
  });

  const filtrarNotas = () => {
    if (busqueda.trim() === "") return notas;

    return notas.filter((nota) => {
      const nombreCliente = nota.cliente?.nombre?.toLowerCase() || "";
      return nombreCliente.includes(busqueda.toLowerCase());
    });
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

      <Text style={styles.texto}>
        Fecha: {formatearFecha(item.fecha)}
      </Text>

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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Buscar nota..."
        placeholder="Nombre del cliente"
        value={busqueda}
        onChangeText={setBusqueda}
        style={{
          marginBottom: 12,
          borderRadius: 25,
          backgroundColor: "#f1f1f1",
          marginTop: -15,
          width: '99%'
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
    borderColor: '#c0c0c0',
    borderWidth: 1.2,
  },
  tituloCliente: {
    fontSize: 16,
    fontWeight: "bold",
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
});
