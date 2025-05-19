import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import { database } from "../src/config/fb";
import { collection, addDoc } from "firebase/firestore";

const AgregarPrecio = ({ route, navigation }) => {
  const { prendaId, tipoLavadoId, prendaNombre, tipoNombre } = route.params;
  const [precio, setPrecio] = useState("");

  const guardarPrecio = async () => {
    const numero = parseFloat(precio);
    if (isNaN(numero) || numero < 0) {
      Alert.alert("Error", "Ingresa un precio válido.");
      return;
    }

    try {
      await addDoc(collection(database, "precios"), {
        prendaId,
        tipoLavadoId,
        precio: numero,
      });

      Alert.alert("Éxito", "Precio guardado correctamente.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error al guardar precio:", error);
      Alert.alert("Error", "No se pudo guardar el precio.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Asignar precio para:
      </Text>
      <Text style={styles.nombre}>
        {prendaNombre} - {tipoNombre}
      </Text>

      <TextInput
        placeholder="Precio"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Guardar Precio" onPress={guardarPrecio} color="#2196f3" />
    </View>
  );
};

export default AgregarPrecio;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  nombre: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2196f3",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 6,
  },
});
