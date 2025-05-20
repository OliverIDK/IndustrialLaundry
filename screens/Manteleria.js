import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { database } from "../src/config/fb";
import { useNavigation } from "@react-navigation/native";

const Manteleria = () => {
  const [notas, setNotas] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const q = query(
      collection(database, "notas"),
      where("tipoNota", "==", "Mantelería")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotas(lista);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.nota}>
      <Text style={styles.id}>ID: {item.idNota}</Text>
      <Text>Cliente: {item.cliente?.nombre || "---"}</Text>
      <Text>Fecha: {item.fecha}</Text>
      <Text>Subtotal: ${item.subtotal?.toFixed(2) || 0}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Notas de Mantelería</Text>

      <FlatList
        data={notas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.vacio}>No hay notas registradas.</Text>
        }
        numColumns={2}
        columnWrapperStyle={styles.fila}
        contentContainerStyle={{ paddingBottom: 20 }}
        key={"2cols"}
      />
      <Button
        title="Agregar Nota"
        onPress={() => navigation.navigate("AgregarNota")}
      />
    </View>
  );
};

export default Manteleria;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  fila: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  nota: {
    flexBasis: "48%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
  },
  id: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  vacio: {
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
});
