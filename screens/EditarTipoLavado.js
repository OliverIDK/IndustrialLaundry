import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { database } from "../src/config/fb";

const EditarTipoLavado = ({ route, navigation }) => {
  const { tipo } = route.params;
  const [nombre, setNombre] = useState(tipo.nombre);

  const actualizarTipoLavado = async () => {
    if (nombre.trim() === "") {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }

    try {
      const tipoRef = doc(database, "tipos_lavado", tipo.id);
      await updateDoc(tipoRef, { nombre });
      Alert.alert("Éxito", "Tipo de lavado actualizado correctamente");
      navigation.goBack();
    } catch (error) {
      console.error("Error al actualizar tipo de lavado:", error);
      Alert.alert("Error", "No se pudo actualizar el tipo de lavado");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Tipo de Lavado</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del tipo de lavado"
        value={nombre}
        onChangeText={setNombre}
      />
      <Button
        title="Guardar Cambios"
        onPress={actualizarTipoLavado}
        color="#007bff"
      />
    </View>
  );
};

export default EditarTipoLavado;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
});
