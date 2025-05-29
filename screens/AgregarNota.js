import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../src/config/fb';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';

const AgregarNota = ({ navigation }) => {
  const [clientes, setClientes] = useState([]);
  const [tiposLavado, setTiposLavado] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fecha] = useState(new Date());

  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [tipoLavadoSeleccionado, setTipoLavadoSeleccionado] = useState('');
  const [tipoNotaSeleccionado, setTipoNotaSeleccionado] = useState('');

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
      cliente,
      tipoLavadoId: tipoLavadoSeleccionado,
      tipoNota: tipoNotaSeleccionado,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Nueva Nota</Text>

      <Text style={styles.label}>Fecha de la nota:</Text>
      <TextInput
        mode="outlined"
        value={format(fecha, 'dd/MM/yyyy')}  // Ejemplo de formato día/mes/año
        style={styles.input}
        editable={false}
        left={<TextInput.Icon icon="calendar" />}
      />

      <Text style={styles.label}>Cliente:</Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: '#f1f1f1',
          backgroundColor: '#f1f1f1',
          borderRadius: 16,
          marginBottom: 10,
          overflow: 'hidden', // para que el borderRadius funcione
        }}
      >
        <Picker
          selectedValue={clienteSeleccionado}
          onValueChange={(itemValue) => setClienteSeleccionado(itemValue)}
          style={{ paddingHorizontal: 10 }} // opcional para mejor visual
        >
          <Picker.Item label="Selecciona cliente" value="" />
          {clientes.map(cliente => (
            <Picker.Item key={cliente.id} label={cliente.nombre} value={cliente.id} />
          ))}
        </Picker>
      </View>



      <Text style={styles.label}>Tipo de lavado:</Text>
      <View style={styles.lavadoContainer}>
        {tiposLavado.map((tipo) => (
          <TouchableOpacity
            key={tipo.id}
            style={[
              styles.lavadoButton,
              tipoLavadoSeleccionado === tipo.id && styles.selectedButton,
            ]}
            onPress={() => setTipoLavadoSeleccionado(tipo.id)}
          >
            <Text style={[
              styles.lavadoText,
              tipoLavadoSeleccionado === tipo.id && styles.selectedText
            ]}>{tipo.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Tipo de nota:</Text>
      <View style={styles.notaContainer}>
        {['Blancos', 'Mantelería'].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.notaButton,
              tipoNotaSeleccionado === tipo && styles.selectedButton,
            ]}
            onPress={() => setTipoNotaSeleccionado(tipo)}
          >
            <Text
              style={[
                styles.lavadoText,
                tipoNotaSeleccionado === tipo && styles.selectedText,
              ]}
            >
              {tipo}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button
        mode="contained"
        onPress={continuar}
        style={styles.button}
        icon="arrow-right"
      >
        Continuar
      </Button>
    </View>
  );
};

export default AgregarNota;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
  },
  lavadoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  lavadoButton: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    margin: 5,
    width: 110,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notaContainer:{
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notaButton:{
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    margin: 5,
    width: 130,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    borderColor: '#004AAD',
    backgroundColor: '#EAF1FF',
  },
  lavadoText: {
    color: '#555',
  },
  selectedText: {
    color: '#004AAD',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#004AAD',
    borderRadius: 8,
    paddingVertical: 8,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
});
