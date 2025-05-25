import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, database } from '../src/config/fb';

const NotasCliente = ({ navigation }) => {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Obtener notas filtrando por cliente.uid
        const notasRef = collection(database, 'notas');
        const qNotas = query(notasRef, where('cliente.uid', '==', user.uid));
        const notasSnap = await getDocs(qNotas);

        const notasData = notasSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotas(notasData);
      } catch (error) {
        console.error('Error al cargar notas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotas();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#004aad" />
      </View>
    );
  }

  if (notas.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No tienes notas asignadas.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notas}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 20 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.notaItem}
          onPress={() => navigation.navigate('Steps', { nota: item })}
        >
          <Text style={styles.notaId}>Nota ID: {item.idNota}</Text>
          <Text>Estado: {item.estado}</Text>
          <Text>Fecha: {new Date(item.fecha).toLocaleDateString()}</Text>
          <Text>Método entrega: {item.metodoEntrega}</Text>
          <Text>Subtotal: ${item.subtotal?.toFixed(2) || '0.00'}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default NotasCliente;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notaItem: {
    padding: 15,
    backgroundColor: '#e3e3e3',
    marginBottom: 15,
    borderRadius: 10,
  },
  notaId: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
