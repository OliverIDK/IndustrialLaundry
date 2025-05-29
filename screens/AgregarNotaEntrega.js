import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { database } from "../src/config/fb";
import AntDesign from "@expo/vector-icons/AntDesign";

const AgregarNotaEntrega = ({ route, navigation }) => {
  const { cliente, fecha, tipoLavadoId, tipoNota, prendas, subtotal } =
    route.params;

  const [metodoEntrega, setMetodoEntrega] = useState("Pick up");
  const [fechaEntrega] = useState(new Date());
  const [choferes, setChoferes] = useState([]);
  const [choferSeleccionado, setChoferSeleccionado] = useState("");
  const [nombreTipoLavado, setNombreTipoLavado] = useState(
    "Cargando tipo de lavado..."
  );

  useEffect(() => {
    const obtenerTipoLavado = async () => {
      if (!tipoLavadoId) {
        setNombreTipoLavado("ID de tipo de lavado no recibido");
        return;
      }
      try {
        const docRef = doc(database, "tipos_lavado", tipoLavadoId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNombreTipoLavado(docSnap.data().nombre || "Sin nombre");
        } else {
          setNombreTipoLavado(
            `Tipo de lavado no encontrado (id: ${tipoLavadoId})`
          );
        }
      } catch (error) {
        console.error("Error al obtener tipo de lavado:", error);
        setNombreTipoLavado("Error al cargar tipo de lavado");
      }
    };

    obtenerTipoLavado();
  }, [tipoLavadoId]);

  useEffect(() => {
    const obtenerChoferes = async () => {
      try {
        const q = query(
          collection(database, "usuarios"),
          where("rol", "==", "Chofer")
        );
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map((doc) => ({
          uid: doc.id,
          nombre: doc.data().nombre,
        }));
        setChoferes(lista);
        if (lista.length > 0) setChoferSeleccionado(lista[0].uid);
      } catch (error) {
        console.error("Error al cargar choferes:", error);
      }
    };
    obtenerChoferes();
  }, []);

  const fechaObj = new Date(fecha);
  const fechaFormateada = fechaObj.toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const continuar = () => {
    if (metodoEntrega === "Delivery" && !choferSeleccionado) {
      alert("Por favor selecciona un chofer para continuar.");
      return;
    }

    const chofer =
      metodoEntrega === "Delivery"
        ? choferes.find((c) => c.uid === choferSeleccionado)
        : null;

    navigation.navigate("AgregarNotaCompletada", {
      cliente,
      fecha,
      tipoLavadoId,
      tipoNota,
      prendas,
      subtotal,
      metodoEntrega,
      fechaEntrega: fechaEntrega.toISOString().split("T")[0],
      chofer,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Entrega</Text>

      <Text style={styles.label}>Forma Entrega</Text>
      <View style={styles.entregaOptions}>
        {["Pick up", "Delivery"].map((opcion) => (
          <TouchableOpacity
            key={opcion}
            style={[
              styles.entregaButton,
              metodoEntrega === opcion && styles.selectedEntregaButton, // Estilo para botón seleccionado
            ]}
            onPress={() => setMetodoEntrega(opcion)}
          >
            <Text
              style={[
                styles.entregaText,
                metodoEntrega === opcion && styles.selectedEntregaText, // Estilo para texto seleccionado
              ]}
            >
              {opcion}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Fecha estimada de entrega</Text>
      <Text style={styles.fechaTexto}>
        {fechaEntrega.toLocaleString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>

      {metodoEntrega === "Delivery" && (
        <>
          <Text style={styles.label}>Asignar chofer:</Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#f1f1f1",
              backgroundColor: "#f1f1f1",
              borderRadius: 16,
              marginBottom: 10,
              overflow: "hidden", // para que el borderRadius funcione
            }}
          >
            <Picker
              selectedValue={choferSeleccionado}
              onValueChange={(itemValue) => setChoferSeleccionado(itemValue)}
            >
              {choferes.map((chofer) => (
                <Picker.Item
                  key={chofer.uid}
                  label={chofer.nombre}
                  value={chofer.uid}
                />
              ))}
            </Picker>
          </View>
        </>
      )}

      <View style={styles.ticket}>
        <Text style={styles.label}>Resumen:</Text>
        <Text>Cliente: {cliente?.nombre ?? "Sin nombre"}</Text>
        <Text>Fecha: {fechaFormateada}</Text>
        <Text>Tipo de lavado: {nombreTipoLavado}</Text>
        <Text>Tipo de nota: {tipoNota}</Text>
        {prendas.map((p, idx) => (
          <Text key={idx}>
            {p.nombre} x{p.cantidad} = ${p.precio * p.cantidad}
          </Text>
        ))}
        <Text style={styles.total}>Subtotal: ${subtotal.toFixed(2)}</Text>
      </View>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <TouchableOpacity
          style={styles.botonContinuar}
          onPress={continuar}
          disabled={metodoEntrega === "Delivery" && !choferSeleccionado}
        >
          <Text style={styles.textoContinuar}>Finalizar Nota</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AgregarNotaEntrega;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
  entregaOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  fechaTexto: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  ticket: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  total: {
    fontWeight: "bold",
    marginTop: 8,
  },
  entregaButton: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    margin: 5,
    width: 130,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    // Color cuando NO está seleccionado
  },

  selectedEntregaButton: {
    backgroundColor: "#EAF1FF",
    borderColor: "#004AAD", // Color cuando está seleccionado
  },

  entregaText: {
    color: "#555", // o negro si prefieres
    fontWeight: "normal",
  },

  selectedEntregaText: {
    color: "#004AAD",
    fontWeight: "bold",
  },
  botonContinuar: {
    marginTop: 100,
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 2,
    width: '100%',
  },
  textoContinuar: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
