import { StyleSheet, Text, View, FlatList, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { database } from '../src/config/fb';
import { useNavigation } from '@react-navigation/native';

const Manteleria = () => {
  const [notas, setNotas] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const q = query(collection(database, 'notas'), where('tipoNota', '==', 'Manteleria'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotas(lista);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.nota}>
      <Text style={styles.id}>ID: {item.idNota}</Text>
      <Text>Cliente: {item.cliente?.nombre || '---'}</Text>
      <Text>Fecha: {item.fecha}</Text>
      <Text>Subtotal: ${item.subtotal?.toFixed(2) || 0}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Notas de Mantelería</Text>

      <FlatList
        data={notas}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.vacio}>No hay notas registradas.</Text>}
      />

      <Button title="Agregar Nota" onPress={() => navigation.navigate('AgregarNota')} />
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
    fontWeight: 'bold',
    marginBottom: 16,
  },
  nota: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  id: {
    fontWeight: 'bold',
  },
  vacio: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
