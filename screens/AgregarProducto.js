import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { database } from '../src/config/fb'; // ajusta esta ruta según tu estructura de carpetas

const AgregarProducto = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [medida, setMedida] = useState('');
  const [cantidadActual, setCantidadActual] = useState('');

  const handleGuardar = async () => {
    if (!nombre || !medida || !cantidadActual) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }

    try {
      const cantidad = parseInt(cantidadActual);
      if (isNaN(cantidad)) {
        Alert.alert('Cantidad inválida', 'La cantidad debe ser un número.');
        return;
      }

      await addDoc(collection(database, 'inventario'), {
        nombre,
        medida,
        cantidad_actual: cantidad,
        creado_en: new Date(),
      });

      Alert.alert('Éxito', 'Producto agregado al inventario.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al agregar producto:', error);
      Alert.alert('Error', 'No se pudo guardar el producto. Inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Producto</Text>

      <Text style={styles.label}>Nombre del producto</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej: Detergente"
      />

      <Text style={styles.label}>Medida</Text>
      <TextInput
        style={styles.input}
        value={medida}
        onChangeText={setMedida}
        placeholder="Ej: Litros, kg, unidades"
      />

      <Text style={styles.label}>Cantidad actual</Text>
      <TextInput
        style={styles.input}
        value={cantidadActual}
        onChangeText={setCantidadActual}
        placeholder="Ej: 10"
        keyboardType="numeric"
      />

      <Button title="Guardar" onPress={handleGuardar} />
    </View>
  );
};

export default AgregarProducto;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 8,
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 6,
  },
});
