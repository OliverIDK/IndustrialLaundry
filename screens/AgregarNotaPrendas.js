import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator, TextInput, Keyboard } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { database } from '../src/config/fb';

const AgregarNotaPrendas = ({ route, navigation }) => {
  const { tipoLavadoId, cliente, fecha, tipoNota } = route.params;
  const [prendas, setPrendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState({});
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    const fetchPrendasConPrecio = async () => {
      try {
        const preciosSnapshot = await getDocs(
          query(collection(database, 'precios'), where('tipoLavadoId', '==', tipoLavadoId))
        );

        const precios = preciosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const prendasPromises = precios.map(async precio => {
          const prendaSnap = await getDocs(
            query(collection(database, 'prendas'), where('__name__', '==', precio.prendaId))
          );
          const prendaDoc = prendaSnap.docs[0];

          if (!prendaDoc) {
            console.warn(`No se encontró prenda con ID: ${precio.prendaId}`);
            return null;
          }

          return {
            ...precio,
            prendaId: precio.prendaId,
            nombre: prendaDoc.data().nombre,
            tipo: prendaDoc.data().tipo,
          };
        });

        const prendasConNombre = (await Promise.all(prendasPromises)).filter(p => p !== null);
        setPrendas(prendasConNombre);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar prendas con precio:', error);
        setLoading(false);
      }
    };

    fetchPrendasConPrecio();
  }, [tipoLavadoId]);

  const incrementar = (id, precio) => {
    const cantidad = (cantidadSeleccionada[id] || 0) + 1;
    setCantidadSeleccionada(prev => ({ ...prev, [id]: cantidad }));
    setSubtotal(prev => prev + precio);
  };

  const decrementar = (id, precio) => {
    const cantidadActual = cantidadSeleccionada[id] || 0;
    if (cantidadActual > 0) {
      const cantidad = cantidadActual - 1;
      setCantidadSeleccionada(prev => ({ ...prev, [id]: cantidad }));
      setSubtotal(prev => prev - precio);
    }
  };

  const handleCantidadManual = (text, id, precio) => {
    let valor = parseInt(text);
    if (isNaN(valor) || valor < 0) valor = 0;

    const cantidadAnterior = cantidadSeleccionada[id] || 0;
    const diferencia = valor - cantidadAnterior;

    setCantidadSeleccionada(prev => ({ ...prev, [id]: valor }));
    setSubtotal(prev => prev + diferencia * precio);
  };

  const continuar = () => {
    const seleccion = prendas
      .filter(p => cantidadSeleccionada[p.id] > 0)
      .map(p => ({
        prendaId: p.prendaId,
        nombre: p.nombre,
        precio: p.precio,
        cantidad: cantidadSeleccionada[p.id],
      }));

    navigation.navigate('AgregarNotaEntrega', {
      cliente,
      fecha,
      tipoLavadoId,
      tipoNota,
      prendas: seleccion,
      subtotal,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Cargando prendas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Selecciona las prendas</Text>
      <FlatList
        data={prendas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.nombre}>{item.nombre}</Text>
                <Text style={styles.precio}>Precio: ${item.precio}</Text>
              </View>
              <View style={styles.controles}>
                <Button title="-" onPress={() => decrementar(item.id, item.precio)} />
                <TextInput
                  style={styles.inputCantidad}
                  keyboardType="numeric"
                  value={(cantidadSeleccionada[item.id] || 0).toString()}
                  onChangeText={(text) => {
                    const nuevaCantidad = parseInt(text) || 0;
                    const diferencia = nuevaCantidad - (cantidadSeleccionada[item.id] || 0);
                    setCantidadSeleccionada(prev => ({ ...prev, [item.id]: nuevaCantidad }));
                    setSubtotal(prev => prev + diferencia * item.precio);
                  }}
                />
                <Button title="+" onPress={() => incrementar(item.id, item.precio)} />
              </View>
            </View>
          </View>
        )}
      />
      <Text style={styles.subtotal}>Subtotal: ${subtotal.toFixed(2)}</Text>
      <Button title="Continuar" onPress={continuar} />
    </View>
  );
};

export default AgregarNotaPrendas;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titulo: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: '600',
  },
  precio: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  controles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputCantidad: {
    width: 50,
    height: 35,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  subtotal: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
itemInfo: {
  flex: 1,
},
precio: {
  fontSize: 14,
  color: '#555',
},
controles: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
inputCantidad: {
  width: 40,
  height: 50,
  textAlign: 'center',
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 4,
  marginHorizontal: 6,
  backgroundColor: '#fff',
},

});
