import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, database } from '../src/config/fb';

const AgregarUsuarios = ({ navigation }) => {
  const [rol, setRol] = useState('Lavador');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');

  const handleRegistrar = async () => {
    if (!email || !nombre || !password) {
      Alert.alert('Error', 'Rellena todos los campos obligatorios');
      return;
    }

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Crear documento en Firestore con los datos del usuario
      const usuarioData = {
        uid,
        email,
        nombre,
        rol,
      };

      if (rol === 'Cliente') {
        usuarioData.direccion = direccion;
        usuarioData.telefono = telefono;
      }

      await setDoc(doc(database, 'usuarios', uid), usuarioData);

      Alert.alert('Éxito', 'Usuario registrado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Usuario</Text>

      <Text>Rol:</Text>
      <Picker
        selectedValue={rol}
        style={styles.input}
        onValueChange={(itemValue) => setRol(itemValue)}
      >
        <Picker.Item label="Lavador" value="Lavador" />
        <Picker.Item label="Auxiliar" value="Auxiliar" />
        <Picker.Item label="Supervisor" value="Supervisor" />
        <Picker.Item label="Cliente" value="Cliente" />
        <Picker.Item label="Chofer" value="Chofer" />
        <Picker.Item label="Administrador" value="Administrador" />
      </Picker>

      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Nombre"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {rol === 'Cliente' && (
        <>
          <TextInput
            placeholder="Dirección"
            style={styles.input}
            value={direccion}
            onChangeText={setDireccion}
          />
          <TextInput
            placeholder="Teléfono"
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
        </>
      )}

      <Button title="Registrar Usuario" onPress={handleRegistrar} />
    </View>
  );
};

export default AgregarUsuarios;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
});
