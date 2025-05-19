import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { database } from "../src/config/fb";
import { useNavigation } from "@react-navigation/native";

const AgregarTipoLavado = () => {
  const [nombre, setNombre] = useState("");
  const navigation = useNavigation();

  const guardarTipo = async () => {
    if (nombre.trim() === "") {
      Alert.alert("Error", "El nombre no puede estar vacío.");
      return;
    }

    try {
      await addDoc(collection(database, "tipos_lavado"), {
        nombre,
      });
      Alert.alert("Éxito", "Tipo de lavado agregado correctamente.");
      navigation.goBack();
    } catch (error) {
      console.error("Error al guardar tipo de lavado:", error);
      Alert.alert("Error", "No se pudo guardar el tipo.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Tipo de Lavado</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del tipo de lavado"
        value={nombre}
        onChangeText={setNombre}
      />
      <TouchableOpacity style={styles.boton} onPress={guardarTipo}>
        <Text style={styles.botonTexto}>Agregar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AgregarTipoLavado;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  boton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  botonTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
