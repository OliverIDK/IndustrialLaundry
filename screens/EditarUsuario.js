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
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode as atob } from "base-64";

import { doc, updateDoc } from "firebase/firestore";
import { database } from "../src/config/fb";
import { supabase } from "../src/config/sp";

const EditarUsuario = ({ route, navigation }) => {
  const { usuario } = route.params;

  const [rol, setRol] = useState(usuario.rol || "");
  const [nombre, setNombre] = useState(usuario.nombre || "");
  const [avatarUri, setAvatarUri] = useState(usuario.avatarUrl || null);
  const [direccion, setDireccion] = useState(usuario.direccion || "");
  const [telefono, setTelefono] = useState(usuario.telefono || "");
  const [uploading, setUploading] = useState(false);

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

  const subirAvatarSupabase = async (uri, uid) => {
  try {
    setUploading(true);

    const fileExt = uri.split(".").pop();
    const fileName = `${uid}.${fileExt}`;

    // Eliminar imagen anterior si existe
    const { error: deleteError } = await supabase.storage
      .from("avatars")
      .remove([fileName]);

    if (deleteError && deleteError.message !== "The resource was not found") {
      console.warn("No se pudo eliminar la imagen anterior:", deleteError.message);
    }

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, binary, {
        cacheControl: "3600",
        upsert: true,
        contentType: `image/${fileExt}`,
      });

    if (uploadError) throw uploadError;

    // Obtener URL pública y agregar parámetro para evitar caché
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`; // Esto fuerza al navegador a cargar la nueva imagen

    return publicUrl;
  } catch (error) {
    Alert.alert("Error", "No se pudo subir la imagen");
    console.error(error);
    return null;
  } finally {
    setUploading(false);
  }
};


  const handleGuardar = async () => {
    if (!nombre.trim() || !rol.trim()) {
      Alert.alert("Validación", "Por favor completa todos los campos");
      return;
    }

    setUploading(true);

    try {
      let avatarUrl = usuario.avatarUrl || null;

      // Si la imagen cambió, súbela y elimina la anterior
      if (
        avatarUri &&
        avatarUri !== usuario.avatarUrl &&
        !avatarUri.startsWith("https://")
      ) {
        avatarUrl = await subirAvatarSupabase(
          avatarUri,
          usuario.uid,
          usuario.avatarUrl
        );
      }

      let datosActualizar = {
        nombre: nombre.trim(),
        rol: rol.trim(),
        avatarUrl,
      };

      if (rol === "Cliente") {
        datosActualizar.direccion = direccion.trim();
        datosActualizar.telefono = telefono.trim();
      }

      const usuarioRef = doc(database, "usuarios", usuario.uid);
      await updateDoc(usuarioRef, datosActualizar);

      Alert.alert("Éxito", "Usuario actualizado correctamente");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el usuario");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Correo (no editable)</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={usuario.email || ""}
          editable={false}
        />

        <Text style={styles.label}>Contraseña (no editable)</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={"********"}
          editable={false}
          secureTextEntry
        />

        <Text style={styles.label}>Avatar</Text>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          <Image
            source={
              avatarUri
                ? { uri: avatarUri }
                : require("../src/Assets/Imagenes/empleado.png")
            }
            style={styles.image}
          />
          <Text style={styles.cambiarTexto}>Tocar para cambiar imagen</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre completo"
        />

        <Text style={styles.label}>Rol</Text>
        <Picker selectedValue={rol} style={styles.input} onValueChange={setRol}>
          <Picker.Item label="Lavador" value="Lavador" />
          <Picker.Item label="Auxiliar" value="Auxiliar" />
          <Picker.Item label="Supervisor" value="Supervisor" />
          <Picker.Item label="Cliente" value="Cliente" />
          <Picker.Item label="Chofer" value="Chofer" />
          <Picker.Item label="Administrador" value="Administrador" />
        </Picker>

        {rol === "Cliente" && (
          <>
            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={styles.input}
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Dirección"
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={telefono}
              onChangeText={setTelefono}
              placeholder="Teléfono"
              keyboardType="phone-pad"
            />
          </>
        )}

        <View style={{ marginTop: 20, marginBottom: 40 }}>
          <Button title="Guardar cambios" onPress={handleGuardar} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditarUsuario;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#eee",
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ccc",
  },
  cambiarTexto: {
    marginTop: 8,
    color: "#007bff",
    fontSize: 14,
  },
});
