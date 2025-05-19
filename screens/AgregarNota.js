import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../src/config/fb';

const AgregarNota = ({ navigation }) => {
  const [clientes, setClientes] = useState([]);
  const [tiposLavado, setTiposLavado] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fecha] = useState(new Date());

  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [tipoLavadoSeleccionado, setTipoLavadoSeleccionado] = useState('');
  const [tipoNotaSeleccionado, setTipoNotaSeleccionado] = useState('Blancos');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientesQuery = query(collection(database, 'usuarios'), where('rol', '==', 'Cliente'));
        const clientesSnapshot = await getDocs(clientesQuery);
        const listaClientes = clientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClientes(listaClientes);

        const tiposLavadoSnapshot = await getDocs(collection(database, 'tipos_lavado'));
        const listaTiposLavado = tiposLavadoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTiposLavado(listaTiposLavado);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const continuar = () => {
    if (!clienteSeleccionado || !tipoLavadoSeleccionado) {
      alert('Por favor selecciona cliente y tipo de lavado.');
      return;
    }
    const cliente = clientes.find(c => c.id === clienteSeleccionado);

    navigation.navigate('AgregarNotaPrendas', {
      fecha: fecha.toISOString(),
      cliente,                  // <-- Aquí envío el objeto cliente completo
      tipoLavadoId: tipoLavadoSeleccionado,
      tipoNota: tipoNotaSeleccionado,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Nueva Nota</Text>

      <Text style={styles.label}>Fecha de la nota:</Text>
      <View style={styles.dateBox}>
        <Text>{fecha.toDateString()}</Text>
      </View>

      <Text style={styles.label}>Selecciona cliente:</Text>
      <Picker
        selectedValue={clienteSeleccionado}
        onValueChange={(itemValue) => setClienteSeleccionado(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="-- Selecciona cliente --" value="" />
        {clientes.map(cliente => (
          <Picker.Item key={cliente.id} label={cliente.nombre} value={cliente.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Selecciona tipo de lavado:</Text>
      <Picker
        selectedValue={tipoLavadoSeleccionado}
        onValueChange={(itemValue) => setTipoLavadoSeleccionado(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="-- Selecciona tipo de lavado --" value="" />
        {tiposLavado.map(tipo => (
          <Picker.Item key={tipo.id} label={tipo.nombre} value={tipo.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Tipo de nota:</Text>
      <Picker
        selectedValue={tipoNotaSeleccionado}
        onValueChange={(itemValue) => setTipoNotaSeleccionado(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Blancos" value="Blancos" />
        <Picker.Item label="Mantelería" value="Mantelería" />
      </Picker>

      <Button title="Continuar" onPress={continuar} />
    </View>
  );
};

export default AgregarNota;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { marginTop: 15, fontSize: 16 },
  picker: { height: 50, width: '100%' },
  dateBox: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 15,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
