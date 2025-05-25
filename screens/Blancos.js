import { StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../src/config/fb';

const NotasCliente = () => {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarNotas = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.warn('No hay usuario autenticado');
          return;
        }

        const uid = user.uid;

        // Buscar notas donde el campo cliente.uid sea igual al uid del usuario
        const notasQuery = query(
          collection(db, 'notas'),
          where('cliente.uid', '==', uid)
        );

        const querySnapshot = await getDocs(notasQuery);
        const notasData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setNotas(notasData);
      } catch (error) {
        console.error('Error al cargar notas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarNotas();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando notas...</Text>
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
      renderItem={({ item }) => (
        <View style={styles.notaCard}>
          <Text style={styles.title}>Tipo de nota: {item.tipoNota}</Text>
          <Text>Estado: {item.estado}</Text>
          <Text>Fecha de entrega: {item.fechaEntrega}</Text>
        </View>
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
  notaCard: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
