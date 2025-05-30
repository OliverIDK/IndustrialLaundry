import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";

const estados = [
  "Recibido",
  "En Lavado",
  "En Secado",
  "En Planchado y/o Doblado",
  "Listo para entrega",
  "En camino",
  "Entregado",
];

const Steps = ({ route, navigation }) => {
  const { nota } = route.params;
  const estadoActualIndex = estados.includes(nota.estado)
    ? estados.indexOf(nota.estado)
    : 0;

  const handleVerMapa = () => {
    navigation.navigate("Mapa");
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 100,
        backgroundColor: "#fff",
      }}
    >
      {/* Información general de la nota */}
      <View style={styles.ticket}>
        <Text style={styles.ticketTitle}>Nota: {nota.idNota}</Text>
        <Text style={styles.textInfo}>Fecha Entrega: {nota.fechaEntrega}</Text>
        <Text style={styles.textInfo}>
          Método de Entrega: {nota.metodoEntrega}
        </Text>

        {nota.chofer && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.sectionTitle}>Chofer</Text>
            <Text style={styles.textInfo}>Nombre: {nota.chofer?.nombre}</Text>
          </View>
        )}

        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Prendas</Text>
          {nota.prendas?.map((prenda, index) => (
            <View key={index} style={styles.prendaRow}>
              <Text style={styles.prendaTexto}>
                {prenda.cantidad} x {prenda.nombre}
              </Text>
              <Text style={styles.precioTexto}>${prenda.precio}</Text>
            </View>
          ))}

          <View style={styles.lineSeparator} />

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Subtotal total:</Text>
            <Text style={styles.totalPrice}>${nota.subtotal}</Text>
          </View>
        </View>
      </View>

      {/* Pasos */}
      <View style={styles.stepsContainer}>
        {estados.map((estado, i) => {
          const isActive = i === estadoActualIndex;
          const isCompleted = i < estadoActualIndex;
          const size = isActive ? 36 : 28;

          return (
            <View key={i} style={styles.stepRow}>
              <View
                style={[
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: 2,
                    borderColor: isActive || isCompleted ? "#2196f3" : "#ccc",
                    backgroundColor:
                      isActive || isCompleted ? "#2196f3" : "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 2,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isActive || isCompleted ? "#fff" : "#000",
                    fontWeight: "bold",
                  }}
                >
                  {i + 1}
                </Text>
              </View>

              {i !== estados.length - 1 && (
                <View
                  style={[
                    styles.line,
                    i < estadoActualIndex && styles.lineCompleted,
                  ]}
                />
              )}

              <Text
                style={[
                  styles.stepText,
                  isActive
                    ? styles.stepTextActive
                    : { color: "#888", fontWeight: "normal" },
                ]}
              >
                {estado}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Botón Ver Mapa */}
      {nota.metodoEntrega === "Delivery" && (
        <TouchableOpacity style={styles.button} onPress={handleVerMapa}>
          <Text style={styles.buttonText}>Ver Mapa</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default Steps;

const circleSize = 30;
const circleSizeActive = 38;

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 30,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  ticketTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
    color: "#1f1f1f",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 16,
    color: "#333",
  },
  prendaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  prendaTexto: {
    fontSize: 15,
    color: "#444",
  },
  precioTexto: {
    fontSize: 15,
    color: "#444",
    fontWeight: "bold",
  },
  lineSeparator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 12,
    borderRadius: 1,
  },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  totalText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  totalPrice: {
    color: "#2196f3",
    fontWeight: "bold",
    fontSize: 18,
  },
  stepsContainer: {
    paddingTop: 20,
    marginLeft: circleSize / 2,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
  },
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  circleCompleted: {
    backgroundColor: "#2196f3",
    borderColor: "#2196f3",
  },
  circleActive: {
    backgroundColor: "#2196f3",
    borderColor: "#2196f3",
  },
  circleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  line: {
    position: "absolute",
    left: circleSize / 2 - 1.5,
    top: circleSize,
    width: 3,
    height: 40,
    backgroundColor: "#ccc",
    zIndex: 1,
    borderRadius: 2,
  },
  lineCompleted: {
    backgroundColor: "#2196f3",
  },
  stepText: {
    marginLeft: 20,
    fontSize: 16,
    color: "#666",
    flexShrink: 1,
  },
  stepTextActive: {
    color: "#2196f3",
    fontWeight: "bold",
    fontSize: 18, // opcional para que sobresalga más
  },
  stepTextCompleted: {
    color: "#2196f3",
  },
  button: {
    marginTop: 30,
    backgroundColor: "#2196f3",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
