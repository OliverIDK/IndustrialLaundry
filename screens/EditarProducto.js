import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { doc, updateDoc } from 'firebase/firestore';
import { database } from '../src/config/fb';

const EditarProducto = ({ route, navigation }) => {
  const { producto } = route.params;

  const [nombre, setNombre] = useState(producto.nombre);
  const [cantidad, setCantidad] = useState(String(producto.cantidad_actual));
  const [medida, setMedida] = useState(producto.medida);

  const handleActualizar = async () => {
    if (!nombre || !cantidad || !medida) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    try {
      const docRef = doc(database, 'inventario', producto.id);
      await updateDoc(docRef, {
        nombre,
        cantidad_actual: parseFloat(cantidad),
        medida,
      });
      Alert.alert('Éxito', 'Producto actualizado correctamente.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar el producto.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Producto</Text>

      <TextInput
        label="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Cantidad"
        value={cantidad}
        onChangeText={setCantidad}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Medida"
        value={medida}
        onChangeText={setMedida}
        style={styles.input}
        mode="outlined"
      />

      <Button mode="contained" onPress={handleActualizar} style={styles.button}>
        Guardar Cambios
      </Button>
    </View>
  );
};

export default EditarProducto;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
