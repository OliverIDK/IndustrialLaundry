import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import AntDesign from "react-native-vector-icons/AntDesign";
import { doc, updateDoc } from "firebase/firestore";
import { database } from "../src/config/fb"; // Asegúrate que esta ruta es correcta

const EditarProducto = ({ route, navigation }) => {
  const producto = route.params?.producto;

  const [nombre, setNombre] = useState(producto?.nombre || "");
  const [cantidad, setCantidad] = useState(producto?.cantidad_actual || 0);
  const [medida, setMedida] = useState(producto?.medida || "unidades");

  const incrementar = () => setCantidad((prev) => prev + 1);
  const decrementar = () => setCantidad((prev) => (prev > 0 ? prev - 1 : 0));

  const guardarCambios = async () => {
    if (!producto?.id) {
      alert("Producto sin ID válido.");
      return;
    }

    try {
      const productoRef = doc(database, "inventario", producto.id);
      await updateDoc(productoRef, {
        nombre: nombre.trim(),
        cantidad_actual: cantidad,
        medida,
      });
      alert("Producto actualizado correctamente.");
      navigation.goBack();
    } catch (error) {
      console.error("Error actualizando producto:", error);
      alert("Ocurrió un error al guardar.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Producto</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        mode="outlined"
        placeholder={"Ej. Suavitel"}
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
        outlineStyle={{
          borderRadius: 16,
          borderColor: "#f1f1f1",
        }}
      />

      <Text style={styles.label}>Medida</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={medida}
          onValueChange={(itemValue) => setMedida(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Galones" value="galones" />
          <Picker.Item label="Litros" value="litros" />
          <Picker.Item label="Unidades" value="unidades" />
        </Picker>
      </View>

      <Text style={styles.label}>Cantidad</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.botonCircular} onPress={decrementar}>
          <AntDesign name="minus" size={20} color="#004AAD" />
        </TouchableOpacity>

        <TextInput
          mode="outlined"
          keyboardType="numeric"
          value={cantidad.toString()}
          onChangeText={(text) => setCantidad(Number(text) || 0)}
          style={styles.inputCantidad}
          outlineStyle={{
            borderRadius: 20,
            borderColor: "#fff",
            textAlign: "center", // ← Centrado horizontal
            textAlignVertical: "center", // ← Centrado vertical (solo Android)
          }}
        />

        <TouchableOpacity style={styles.botonCircular} onPress={incrementar}>
          <AntDesign name="plus" size={20} color="#004AAD" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        mode="contained"
        onPress={guardarCambios}
        style={styles.botonGuardar}
      >
        <Text style={styles.textoButton}> Guardar cambios</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditarProducto;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
    height: '100%',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#f1f1f1",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#f1f1f1",
    backgroundColor: "#f1f1f1",
    borderRadius: 16,
    marginBottom: 10,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    paddingHorizontal: 10,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  botonCircular: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#edf5ff",
  },
  inputCantidad: {
    width: 70,
    textAlign: "center",
     backgroundColor: "#fff",
     fontSize: 25,
  },
  botonGuardar: {
    marginTop: 50,
    backgroundColor: "#004AAD",
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
  },
    textoButton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
