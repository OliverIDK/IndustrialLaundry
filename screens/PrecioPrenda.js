import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  Alert,
} from "react-native";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { database } from "../src/config/fb";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AcordeonPrecios = () => {
  const [expanded, setExpanded] = useState({});
  const [tiposLavado, setTiposLavado] = useState([]);
  const [prendas, setPrendas] = useState([]);
  const [precios, setPrecios] = useState({}); // precios confirmados
  const [preciosEditados, setPreciosEditados] = useState({}); // cambios pendientes

  useEffect(() => {
    const unsubPrendas = onSnapshot(
      collection(database, "prendas"),
      (snapshot) => {
        setPrendas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );

    const unsubTipos = onSnapshot(
      collection(database, "tipos_lavado"),
      (snapshot) => {
        setTiposLavado(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    );

    const unsubPrecios = onSnapshot(
      collection(database, "precios"),
      (snapshot) => {
        const preciosData = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          preciosData[`${data.tipoLavadoId}_${data.prendaId}`] = {
            id: doc.id,
            precio: data.precio,
          };
        });
        setPrecios(preciosData);
      }
    );

    return () => {
      unsubPrendas();
      unsubTipos();
      unsubPrecios();
    };
  }, []);

  const handleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Solo actualiza estado local de precios editados (no guarda a BD)
  const handlePrecioChange = (tipoLavadoId, prendaId, nuevoPrecio) => {
    const key = `${tipoLavadoId}_${prendaId}`;
    const precio = nuevoPrecio; // guardamos como string para que se vea en input
    setPreciosEditados((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        tipoLavadoId,
        prendaId,
        precio,
      },
    }));
  };

  // Confirmar y guardar el cambio en Firestore
  const confirmarCambio = async (key) => {
    const data = preciosEditados[key];
    if (!data) return;

    const docId = precios[key]?.id || key;
    const precioNum = parseFloat(data.precio);
    if (isNaN(precioNum)) {
      Alert.alert("Error", "Precio inválido");
      return;
    }

    try {
      await setDoc(doc(database, "precios", docId), {
        tipoLavadoId: data.tipoLavadoId,
        prendaId: data.prendaId,
        precio: precioNum,
      });
      // Actualizar estado precios confirmado con nuevo valor
      setPrecios((prev) => ({
        ...prev,
        [key]: { id: docId, precio: precioNum },
      }));
      // Remover de editados porque ya se guardó
      setPreciosEditados((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      Alert.alert("Éxito", "Precio actualizado");
    } catch (error) {
      console.error("Error al actualizar precio:", error);
      Alert.alert("Error", "No se pudo actualizar el precio");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {tiposLavado.map((tipo) => (
        <View key={tipo.id}>
          <TouchableOpacity
            style={styles.header}
            onPress={() => handleExpand(tipo.id)}
          >
            <Text style={styles.headerText}>{tipo.nombre}</Text>
          </TouchableOpacity>

          {expanded[tipo.id] &&
            prendas.map((prenda) => {
              const key = `${tipo.id}_${prenda.id}`;

              // Precio original confirmado
              const precioConfirmado = precios[key]?.precio?.toString() || "";

              // Precio en edición (cadena)
              const precioEditado = preciosEditados[key]?.precio;

              // Mostrar el precio editado si existe, si no el confirmado
              const valorMostrar =
                precioEditado !== undefined ? precioEditado : precioConfirmado;

              // ¿Hay un cambio sin guardar?
              const hayCambio =
                precioEditado !== undefined && precioEditado !== precioConfirmado;

              return (
                <View key={key} style={styles.itemRow}>
                  <Text style={styles.itemText}>{prenda.nombre}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={valorMostrar}
                    onChangeText={(text) =>
                      handlePrecioChange(tipo.id, prenda.id, text)
                    }
                    placeholder="$"
                  />
                  {hayCambio && (
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={() => confirmarCambio(key)}
                    >
                      <Text style={styles.confirmButtonText}>✔️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
        </View>
      ))}
    </ScrollView>
  );
};

export default AcordeonPrecios;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  header: {
    padding: 12,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    marginBottom: 4,
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemText: {
    flex: 1,
    fontSize: 15,
  },
  input: {
    width: 80,
    padding: 6,
    backgroundColor: "#fff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    textAlign: "right",
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
