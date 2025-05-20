import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
} from "react-native";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { database } from "../src/config/fb";

const generarID = () => {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 5; i++) {
    id += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return id;
};

const AgregarNotaCompletada = ({ route, navigation }) => {
  const {
    cliente,
    fecha,
    tipoLavadoId,
    tipoNota,
    prendas,
    subtotal,
    metodoEntrega,
    fechaEntrega,
    chofer,
  } = route.params;

  const [idNota, setIdNota] = useState("");
  const [guardando, setGuardando] = useState(true);
  const [tipoLavadoNombre, setTipoLavadoNombre] = useState("");

  useEffect(() => {
    const cargarTipoLavado = async () => {
      try {
        const tipoLavadoRef = doc(database, "tipos_lavado", tipoLavadoId);
        const tipoLavadoSnap = await getDoc(tipoLavadoRef);
        if (tipoLavadoSnap.exists()) {
          setTipoLavadoNombre(tipoLavadoSnap.data().nombre);
        } else {
          setTipoLavadoNombre("Desconocido");
        }
      } catch (error) {
        console.error("Error obteniendo tipo de lavado:", error);
        setTipoLavadoNombre("Error");
      }
    };

    const guardarNota = async () => {
      const idGenerado = generarID();
      setIdNota(idGenerado);

      const nuevaNota = {
        idNota: idGenerado,
        cliente,
        fecha,
        tipoLavadoId,
        tipoNota,
        prendas,
        subtotal,
        metodoEntrega,
        fechaEntrega,
        chofer,
        estado: "Recibido",
        creadaEn: new Date().toISOString(),
      };

      await addDoc(collection(database, "notas"), nuevaNota);
      setGuardando(false);
    };

    cargarTipoLavado().then(guardarNota);
  }, []);

  if (guardando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Guardando nota...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>¡Nota creada!</Text>
      <Text style={styles.id}>ID: {idNota}</Text>

      <View style={styles.resumen}>
        <Text>Cliente: {cliente.nombre}</Text>
        <Text>Fecha: {new Date(fecha).toLocaleDateString()}</Text>
        <Text>Tipo de lavado: {tipoLavadoNombre}</Text>
        <Text>Tipo de nota: {tipoNota}</Text>
        <Text>Entrega: {metodoEntrega}</Text>
        <Text>Fecha estimada de entrega: {fechaEntrega}</Text>
        <Text>Chofer: {chofer ? chofer.nombre : "Pickup"}</Text>
        <Text style={styles.separador}>Prendas:</Text>
        {prendas.map((p, idx) => (
          <Text key={idx}>
            {p.nombre} x{p.cantidad} = ${p.precio * p.cantidad}
          </Text>
        ))}
        <Text style={styles.total}>Subtotal: ${subtotal.toFixed(2)}</Text>
      </View>

      <Button title="Volver al inicio" onPress={() => navigation.pop(4)} />
    </View>
  );
};

export default AgregarNotaCompletada;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  id: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 20,
  },
  resumen: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 20,
  },
  total: {
    fontWeight: "bold",
    marginTop: 8,
  },
  separador: {
    marginTop: 10,
    fontWeight: "bold",
  },
});
