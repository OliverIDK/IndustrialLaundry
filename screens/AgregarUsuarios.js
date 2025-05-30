import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode as atob } from "base-64";
import { TextInput } from "react-native-paper";
import Icon from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

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
  const [showPassword, setShowPassword] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesita permiso para acceder a la galería.");
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
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, binary, {
          cacheControl: "3600",
          upsert: true,
          contentType: `image/${fileExt}`,
        });

      if (error) throw error;

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

  const validarEmail = (email) => {
  // Expresión regular básica para validar email
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const handleRegistrar = async () => {
  // Validar campos obligatorios
  if (!email || !nombre || !password || (rol === "Cliente" && (!direccion || !telefono))) {
    Alert.alert("Error", "Por favor, rellena todos los campos obligatorios");
    return;
  }

  // Validar formato de email
  if (!validarEmail(email)) {
    Alert.alert("Error", "Por favor, ingresa un correo electrónico válido");
    return;
  }

  // Validar contraseña mínima 6 caracteres (puedes ajustar esta regla)
  if (password.length < 6) {
    Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
    return;
  }

  // Validar teléfono solo si el rol es Cliente
  if (rol === "Cliente") {
    const telefonoSinEspacios = telefono.replace(/\s/g, "");
    if (!/^\d{10}$/.test(telefonoSinEspacios)) {
      Alert.alert("Error", "El teléfono debe tener exactamente 10 dígitos");
      return;
    }
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    let avatarUrl = null;
    if (avatarUri) {
      avatarUrl = await subirAvatarSupabase(avatarUri, uid);
    }

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
    <ScrollView contentContainerStyle={{ backgroundColor: '#fff' }}>
      <View style={styles.container}>

        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity style={styles.fotoUser} onPress={pickImage}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Image
                source={require("../src/Assets/Imagenes/usuario.png")}
                style={styles.avatarImage}
              />
            )}
          </TouchableOpacity>
        </View>


        <Text style={styles.label}>Rol</Text>
        <View style={{
          borderWidth: 1,
          borderColor: '#f1f1f1',
          backgroundColor: '#f1f1f1',
          borderRadius: 16,
          marginBottom: 10,
          overflow: 'hidden', // importante para que el borderRadius funcione
        }}>
          <Picker
            selectedValue={rol}
            onValueChange={(itemValue) => setRol(itemValue)}
            style={{ paddingHorizontal: 10 }} // opcional, mejora visual
          >
            <Picker.Item label="Lavador" value="Lavador" />
            <Picker.Item label="Auxiliar" value="Auxiliar" />
            <Picker.Item label="Supervisor" value="Supervisor" />
            <Picker.Item label="Cliente" value="Cliente" />
            <Picker.Item label="Chofer" value="Chofer" />
            <Picker.Item label="Administrador" value="Administrador" />
          </Picker>
        </View>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput

          mode="outlined"
          left={<TextInput.Icon icon="account" color={'#8e8e8e'} />}
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
          outlineStyle={{
            borderRadius: 16,
            borderColor: '#f1f1f1',
          }}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email" color={'#8e8e8e'} />}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          outlineStyle={{
            borderRadius: 16,
            borderColor: '#f1f1f1',
          }}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          mode="outlined"
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock" color={'#8e8e8e'} />}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword(!showPassword)}
              color="#8e8e8e"
            />
          }
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          outlineStyle={{
            borderRadius: 16,
            borderColor: '#f1f1f1',
          }}
        />

        {rol === "Cliente" && (
          <>
            <Text style={styles.label}>Dirección</Text>
            <TextInput

              mode="outlined"
              left={<TextInput.Icon icon="home" color={'#8e8e8e'} />}
              value={direccion}
              onChangeText={setDireccion}
              style={styles.input}
              outlineStyle={{
                borderRadius: 16,
                borderColor: '#f1f1f1',
              }}
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" color="#8e8e8e" />}
              value={telefono}
              onChangeText={setTelefono}
              style={styles.input}
              outlineStyle={{
                borderRadius: 16,
                borderColor: '#f1f1f1',
              }}
            />
          </>
        )}


        {uploading && <ActivityIndicator size="large" color="#0000ff" />}

        <TouchableOpacity style={styles.button} onPress={handleRegistrar}>
          <Text style={styles.buttonText}>REGISTRAR</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>

  );
}

export default AgregarUsuarios;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#f1f1f1",

  },
  fotoUser: {
    borderRadius: 100,
    overflow: "hidden",
    backgroundColor: "#3D6DFF",
    width: 125,
    height: 125,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "102%",
    height: "102%",
    resizeMode: "cover",
  },
  button: {
    backgroundColor: "#3D6DFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerText: {
    textAlign: "center",
    color: "#666",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  
  },
});
