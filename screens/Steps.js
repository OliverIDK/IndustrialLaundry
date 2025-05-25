import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';

const estados = [
  'Recibido',
  'En Lavado',
  'En secado',
  'Planchado y Doblado',
  'Listo para entrega',
  'En camino',
  'Entregado',
];

const Steps = ({ route, navigation }) => {
  const { nota } = route.params;
  const estadoActualIndex = estados.indexOf(nota.estado);

  const handleVerMapa = () => {
    Alert.alert('Ver Mapa', 'Funcionalidad de mapa aún no implementada.');
    // navigation.navigate('Mapa', { nota });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Información general de la nota */}
      <View style={styles.ticket}>
        <Text style={styles.ticketTitle}>Nota: {nota.idNota}</Text>
        <Text>Fecha Entrega: {nota.fechaEntrega}</Text>
        <Text>Método de Entrega: {nota.metodoEntrega}</Text>

        {nota.chofer && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.sectionTitle}>Chofer</Text>
            <Text>Nombre: {nota.chofer?.nombre}</Text>
          </View>
        )}

        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Prendas</Text>
          {nota.prendas?.map((prenda, index) => (
            <View key={index} style={styles.prendaRow}>
              <Text style={styles.prendaTexto}>
                {prenda.cantidad} x {prenda.nombre}
              </Text>
              <Text style={styles.precioTexto}>
                ${prenda.precio}
              </Text>
            </View>
          ))}
          {/* Subtotal total de la nota */}
          <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 8 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Subtotal total: ${nota.subtotal}</Text>
          </View>
        </View>
      </View>

      {/* Pasos del proceso */}
      <View style={styles.stepsContainer}>
        {estados.map((estado, i) => {
          const isActive = i === estadoActualIndex;
          const isCompleted = i < estadoActualIndex;

          return (
            <View key={i} style={styles.stepRow}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isActive && styles.circleActive,
                ]}
              >
                <Text style={styles.circleText}>{i + 1}</Text>
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
                  isActive && styles.stepTextActive,
                  isCompleted && styles.stepTextCompleted,
                ]}
              >
                {estado}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Botón Ver Mapa */}
      {nota.metodoEntrega === 'Delivery' && (
        <TouchableOpacity style={styles.button} onPress={handleVerMapa}>
          <Text style={styles.buttonText}>Ver Mapa</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default Steps;

const circleSize = 28;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  ticket: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    elevation: 2,
  },
  ticketTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  prendaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  prendaTexto: {
    fontSize: 16,
    color: '#333',
  },
  precioTexto: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  stepsContainer: {
    flexDirection: 'column',
    position: 'relative',
    marginLeft: circleSize / 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    borderWidth: 2,
    borderColor: '#aaa',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  circleCompleted: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  circleActive: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  circleText: {
    color: '#000',
    fontWeight: 'bold',
  },
  line: {
    position: 'absolute',
    left: circleSize / 2 - 1,
    top: circleSize,
    width: 4,
    height: 40,
    backgroundColor: '#aaa',
    zIndex: 1,
  },
  lineCompleted: {
    backgroundColor: '#4caf50',
  },
  stepText: {
    marginLeft: 20,
    fontSize: 16,
    color: '#555',
  },
  stepTextActive: {
    fontWeight: 'bold',
    color: '#2196f3',
  },
  stepTextCompleted: {
    color: '#4caf50',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#2196f3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
