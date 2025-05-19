import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { database } from '../src/config/fb'; // Asegúrate de que esta ruta sea correcta
import { collection, addDoc } from 'firebase/firestore'; // Para agregar documentos

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
      <Text style={styles.label}>Nombre de la prenda</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese el nombre de la prenda"
        value={nombre}
        onChangeText={setNombre}
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

      <TouchableOpacity style={styles.addButton} onPress={handleAgregar}>
        <Text style={styles.addButtonText}>Agregar Prenda</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ADD8E6',  // Azul claro
    borderRadius: 5,
    marginHorizontal: 10,
  },
  selectedButton: {
    backgroundColor: '#4682B4',  // Azul oscuro
  },
  buttonText: {
    fontSize: 18,
    color: '#000',
  },
  selectedText: {
    fontSize: 18,
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#4682B4',  // Azul oscuro
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default AgregarPrenda;
