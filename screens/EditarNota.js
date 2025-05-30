import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { database } from "../src/config/fb";
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";

const EditarNota = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { nota } = route.params;

  const [clientes, setClientes] = useState([]);
  const [prendas, setPrendas] = useState(nota.prendas || []);

  useEffect(() => {
    const cargarClientes = async () => {
      const querySnapshot = await getDocs(collection(database, "clientes"));
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setClientes(lista);
    };

    cargarClientes();
  }, []);

  const actualizarNota = async () => {
    try {
      await updateDoc(doc(database, "notas", nota.id), {
        prendas,
      });
      Alert.alert("Nota actualizada");
      navigation.goBack();
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const eliminarNota = async () => {
    Alert.alert("Confirmar", "¿Estás seguro que deseas eliminar esta nota?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(database, "notas", nota.id));
            Alert.alert("Nota eliminada");
            navigation.goBack();
          } catch (error) {
            console.error("Error al eliminar:", error);
          }
        },
      },
    ]);
  };

  const modificarCantidad = (index, cambio) => {
    const nuevasPrendas = [...prendas];
    let cantidadActual = parseInt(nuevasPrendas[index].cantidad) || 0;
    cantidadActual += cambio;
    if (cantidadActual < 0) cantidadActual = 0;
    nuevasPrendas[index].cantidad = cantidadActual;
    setPrendas(nuevasPrendas);
  };

  return (
    <View style={styles.container}>
        <Text style={styles.titulo}>{nota.idNota}</Text>
      <Text style={styles.label}>Cliente:</Text>
      <TextInput
        value={nota.cliente?.nombre || ""}
        editable={false}
        style={styles.disabledInput}
      />

      <Text style={styles.label}>Fecha:</Text>
      <TextInput
        value={new Date(nota.fecha).toLocaleDateString()}
        editable={false}
        style={styles.disabledInput}
      />

      <Text style={styles.label}>Metodo de Entrega:</Text>
      <TextInput
        value={nota.metodoEntrega || ""}
        editable={false}
        style={styles.disabledInput}
      />

      <Text style={styles.label}>Estado:</Text>
      <TextInput
        value={nota.estado || ""}
        editable={false}
        style={styles.disabledInput}
      />
      <Text style={styles.label}>Tipo de Nota:</Text>
      <TextInput
        value={nota.tipoNota || ""}
        editable={false}
        style={styles.disabledInput}
      />

      <Text style={styles.label}>Cantidad de Prendas:</Text>
      <FlatList
        data={prendas}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.prendaRow}>
            <Text style={styles.prendaNombre}>{item.nombre}</Text>
            <TouchableOpacity
              style={styles.botonCantidad}
              onPress={() => modificarCantidad(index, -1)}
            >
              <Text style={styles.botonTexto}>-</Text>
            </TouchableOpacity>
            <Text style={styles.cantidadTexto}>{item.cantidad}</Text>
            <TouchableOpacity
              style={styles.botonCantidad}
              onPress={() => modificarCantidad(index, 1)}
            >
              <Text style={styles.botonTexto}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.botonGuardar} onPress={actualizarNota}>
        <Text style={styles.textoBoton}>Guardar Cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonEliminar} onPress={eliminarNota}>
        <Text style={styles.textoBoton}>Eliminar Nota</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontWeight: "bold", marginTop: 10 },
  disabledInput: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  prendaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 4,
  },
  prendaNombre: { flex: 1 },
  cantidadTexto: { width: 30, textAlign: "center" },
  botonCantidad: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#004AAD",
    justifyContent: "center",
    alignItems: "center",
  },
  botonTexto: { color: "white", fontSize: 18 },
  botonGuardar: {
    backgroundColor: "#004AAD",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  botonEliminar: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  textoBoton: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  titulo: {
  fontSize: 20,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: 20,
},

});

export default EditarNota;
