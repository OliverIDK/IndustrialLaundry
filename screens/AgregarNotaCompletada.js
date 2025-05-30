import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as Animatable from "react-native-animatable";
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Guardando nota...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animatable.View
        animation="bounceIn"
        duration={1500}
        delay={300}
        style={styles.checkIcon}
        useNativeDriver
      >
        <Animatable.Text
          animation="pulse"
          easing="ease-out"
          iterationCount="infinite"
          style={styles.checkText}
        >
          ✓
        </Animatable.Text>
      </Animatable.View>

      <Text style={styles.title}>Nota Registrada!</Text>
      <Text style={styles.idNota}>
        ID Nota: <Text style={styles.idNotaBold}>{idNota}</Text>
      </Text>

      <View style={styles.rowInfo}>
        <View>
          <Text style={styles.label}>Cliente</Text>
          <Text style={styles.value}>{cliente.nombre}</Text>
        </View>
        <View>
          <Text style={styles.label}>Fecha</Text>
          <Text style={styles.value}>
            {new Date(fecha).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.basket}>
        <Text style={styles.basketTitle}>Laundry Basket</Text>
        <Text style={styles.basketSubtitle}>{tipoLavadoNombre}</Text>

        {prendas.map((p, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemText}>
              {p.cantidad} x {p.nombre}
            </Text>
            <Text style={styles.itemPrice}>
              ${parseFloat(p.precio * p.cantidad).toFixed(2)}
            </Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalText}>${subtotal.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.pop(4)}>
        <Text style={styles.buttonText}>Volver al inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AgregarNotaCompletada;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    paddingTop:200,
    padding: 24,
    alignItems: "center",
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  checkIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: "#0075FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  checkText: {
    fontSize: 40,
    color: "#0075FF",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  idNota: {
    color: "#888",
    marginBottom: 20,
  },
  idNotaBold: {
    color: "#0075FF",
    fontWeight: "bold",
  },
  rowInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
  },
  label: {
    color: "#888",
    fontSize: 13,
  },
  value: {
    fontWeight: "600",
    fontSize: 15,
  },
  basket: {
    width: "100%",
    marginBottom: 30,
  },
  basketTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  basketSubtitle: {
    color: "#888",
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemText: {
    fontSize: 15,
  },
  itemPrice: {
    fontSize: 15,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    marginTop: 10,
    paddingTop: 10,
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#0057D8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    elevation: 2, 
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
