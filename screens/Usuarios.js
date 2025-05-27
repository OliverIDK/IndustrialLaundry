import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { database } from "../src/config/fb";
import { Menu, IconButton, TextInput } from "react-native-paper";
import { AntDesign } from '@expo/vector-icons';
import { useFonts } from "expo-font";

const eliminarUsuario = async (id) => {
  try {
    await deleteDoc(doc(database, "usuarios", id));
    console.log("Usuario eliminado con ID:", id);
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
  }
};

const agruparPorLetra = (lista) => {
  const agrupados = {};

  lista.forEach((usuario) => {
    const letra = usuario.nombre[0].toUpperCase();
    if (!agrupados[letra]) {
      agrupados[letra] = [];
    }
    agrupados[letra].push(usuario);
  });

  // Ordenar alfabéticamente las letras
  return Object.keys(agrupados)
    .sort()
    .map((letra) => ({
      letra,
      usuarios: agrupados[letra].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    }));
};

const Usuarios = ({ navigation }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleMenuId, setVisibleMenuId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const [fontsLoaded] = useFonts({
    'Quicksand-Regular': require('../src/Assets/fonts/Quicksand-Regular.ttf'),
    'Quicksand-SemiBold': require('../src/Assets/fonts/Quicksand-SemiBold.ttf'),
    'Raleway-Regular': require('../src/Assets/fonts/Raleway-Regular.ttf'),
    'Montserrat-Regular': require('../src/Assets/fonts/Montserrat-Regular.ttf'),
    'Poppins-Regular': require('../src/Assets/fonts/Poppins-Regular.ttf'),
  });

  useEffect(() => {
    const usuariosRef = collection(database, "usuarios");
    const unsubscribe = onSnapshot(
      usuariosRef,
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsuarios(lista);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener usuarios:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  if (!fontsLoaded) return null;

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  const usuariosAgrupados = agruparPorLetra(usuariosFiltrados);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={[styles.texto, { marginTop: 10 }]}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <TextInput
          mode="outlined"
          placeholder="Buscar usuario"
          value={busqueda}
          onChangeText={setBusqueda}
          style={styles.input}
          left={<TextInput.Icon icon="magnify" />}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          outlineStyle={{
            borderRadius: 25,
            borderColor: "#f1f1f1",
            ActiveOutlineColor: "#f1f1f1",
          }}
          theme={{
            colors: {
              background: "#f1f1f1",
              placeholder: "#f1f1f1",
              text: "#f1f1f1",
            },
          }}
        />

        {usuariosAgrupados.map((grupo) => (
          <View key={grupo.letra}>
            <Text style={styles.letraTitulo}>{grupo.letra}</Text>
            {grupo.usuarios.map((item) => (
              <View key={item.id} style={styles.usuarioCard}>
                <View style={styles.row}>
                  <Image
                    source={
                      item.avatarUrl
                        ? { uri: item.avatarUrl }
                        : require("../src/Assets/Imagenes/empleado.png")
                    }
                    style={styles.avatar}
                  />
                  <View style={styles.infoContainer}>
                    <Text style={styles.nombre}>{item.nombre}</Text>
                    <Text style={styles.rol}>{item.rol}</Text>
                  </View>
                  <Menu
                    visible={visibleMenuId === item.id}
                    onDismiss={() => setVisibleMenuId(null)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        size={24}
                        onPress={() => setVisibleMenuId(item.id)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        setVisibleMenuId(null);
                        navigation.navigate("EditarUsuario", { usuario: item });
                      }}
                      title="Editar"
                    />
                    <Menu.Item
                      onPress={() => {
                        setVisibleMenuId(null);
                        Alert.alert(
                          "¿Eliminar usuario?",
                          `¿Estás seguro de eliminar a "${item.nombre}"?`,
                          [
                            { text: "Cancelar", style: "cancel" },
                            {
                              text: "Eliminar",
                              style: "destructive",
                              onPress: () => eliminarUsuario(item.id),
                            },
                          ]
                        );
                      }}
                      title="Eliminar"
                    />
                  </Menu>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate("AgregarUsuarios")}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Usuarios;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 5,
    backgroundColor: "#fff",
  },
  input: {
    fontSize: 16,
    marginBottom: 20,
    fontFamily: "Quicksand-Regular",
  },
  usuarioCard: {
    padding: 10,
    marginBottom: 1,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nombre: {
    fontSize: 16,
    color: "#264653",
    fontFamily: "Quicksand-SemiBold",
  },
  rol: {
    fontSize: 14,
    color: "#6c757d",
    fontFamily: "Quicksand-Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  vacio: {
    textAlign: "center",
    color: "#999",
    marginTop: 30,
    fontStyle: "italic",
    fontFamily: "Quicksand-Regular",
  },
  texto: {
    fontFamily: "Quicksand-Regular",
  },
  boton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#004AAD",
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  letraTitulo: {
  fontSize: 14,
  fontWeight: "bold",
  marginTop: 2,
  marginBottom: 2,
  color: "#004AAD",
  fontFamily: "Quicksand-SemiBold",
},
});
