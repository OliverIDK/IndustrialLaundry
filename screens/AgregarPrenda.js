import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { database } from '../src/config/fb'; // Asegúrate de que esta ruta sea correcta
import { collection, addDoc } from 'firebase/firestore'; // Para agregar documentos
import { TextInput } from "react-native-paper";

const AgregarPrenda = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState("Blancos");

  const handlePress = (value) => {
    setTipo(value);
  };

  const handleAgregar = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "Por favor ingresa un nombre para la prenda.");
      return;
    }

    try {
      // Agregar la prenda a la colección "prendas" en Firebase
      await addDoc(collection(database, 'prendas'), {
        nombre: nombre,
        tipo: tipo,
      });

      Alert.alert("Éxito", `Prenda "${nombre}" de tipo "${tipo}" agregada.`);

      // Limpiar los campos después de agregar
      setNombre('');
      setTipo("Blancos");

      // Regresar a la pantalla anterior
      navigation.goBack();
    } catch (error) {
      console.error("Error al agregar la prenda: ", error);
      Alert.alert("Error", "Hubo un problema al agregar la prenda. Intenta nuevamente.");
    }
  };

  return (
    <View style={styles.container}>

      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <TouchableOpacity style={styles.fotoUser}>
            <Image
              source={require("../src/Assets/Imagenes/cargar.png")}
              style={styles.avatarImage}
            />
      
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Nombre de la prenda</Text>
      <TextInput
        mode="outlined"
        placeholder={"Ej. Toalla mano"}
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
        outlineStyle={{
          borderRadius: 16,
          borderColor: "#f1f1f1",
        }}
      />
      <Text style={styles.label}>Selecciona el tipo de prenda</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, tipo === "Blancos" && styles.selectedButton]}
          onPress={() => handlePress("Blancos")}
        >
          <Text style={[styles.buttonText, tipo === "Blancos" && styles.selectedText]}>Blancos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, tipo === "Mantelería" && styles.selectedButton]}
          onPress={() => handlePress("Mantelería")}
        >
          <Text style={[styles.buttonText, tipo === "Mantelería" && styles.selectedText]}>Mantelería</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        mode="contained"
        onPress={handleAgregar}
        style={styles.botonGuardar}
      >
        <Text style={styles.textoButton}>Guardar producto</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
  input: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#f1f1f1",
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderColor: '#aaa',
    borderRadius: 5,
    marginHorizontal: 10,
    borderWidth: 1,
  },
  selectedButton: {
    backgroundColor: '#EAF1FF',
    borderColor: '#004AAD',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 18,
    color: '#000',
  },
  selectedText: {
    fontSize: 18,
    color: '#004AAD',
  },
  botonGuardar: {
    backgroundColor: "#004AAD",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
  },
  textoButton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  fotoUser: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#C5E0FF",
    width: 150,
    height: 125,
    alignItems: "center",
    justifyContent: "center",
  },
   avatarImage: {
    marginTop: 7,
    width: 152,
    resizeMode: "contain",
  },

});

export default AgregarPrenda;
