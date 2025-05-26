import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode as atob } from "base-64";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, database } from "../src/config/fb";
import { supabase } from "../src/config/sp";

const AgregarUsuarios = ({ navigation }) => {
  const [rol, setRol] = useState("Lavador");
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [avatarUri, setAvatarUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Función para seleccionar imagen
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Se necesita permiso para acceder a la galería."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  // Función para subir imagen a Supabase y devolver URL pública
  const subirAvatarSupabase = async (uri, uid) => {
    try {
      setUploading(true);
      const fileExt = uri.split(".").pop();
      const fileName = `${uid}.${fileExt}`;

      // Leer archivo base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convertir base64 a Uint8Array
      const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      // Subir al bucket 'avatars'
      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, binary, {
          cacheControl: "3600",
          upsert: true,
          contentType: `image/${fileExt}`,
        });

      if (error) throw error;

      // Obtener URL pública
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      Alert.alert("Error", "No se pudo subir la imagen");
      console.error(error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleRegistrar = async () => {
    if (!email || !nombre || !password) {
      Alert.alert("Error", "Rellena todos los campos obligatorios");
      return;
    }

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      let avatarUrl = null;
      if (avatarUri) {
        avatarUrl = await subirAvatarSupabase(avatarUri, uid);
      }

      // Crear documento Firestore
      const usuarioData = {
        uid,
        email,
        nombre,
        rol,
      };

      if (rol === "Cliente") {
        usuarioData.direccion = direccion;
        usuarioData.telefono = telefono;
      }

      if (avatarUrl) {
        usuarioData.avatarUrl = avatarUrl;
      }

      await setDoc(doc(database, "usuarios", uid), usuarioData);

      Alert.alert("Éxito", "Usuario registrado correctamente");
      navigation.goBack();
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      Alert.alert("Error", error.message);
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

      {rol === "Cliente" && (
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

      <View style={{ marginVertical: 10 }}>
        <Button title="Seleccionar Avatar" onPress={pickImage} />
        {avatarUri && (
          <Image
            source={{ uri: avatarUri }}
            style={{ width: 100, height: 100, marginTop: 10, borderRadius: 50 }}
          />
        )}
      </View>

      {uploading && <ActivityIndicator size="large" color="#0000ff" />}

      <Button title="Registrar Usuario" onPress={handleRegistrar} />
    </View>
  );
};

export default AgregarUsuarios;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
});
