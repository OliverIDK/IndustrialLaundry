import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Button,
  Alert
} from 'react-native'
import React, { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc
} from 'firebase/firestore'
import { database } from '../src/config/fb'

// Función para enviar notificación al backend
const enviarNotificacion = async (uid, estado) => {
  try {
    const response = await fetch('https://005e5364-527c-403d-b670-2d6b9e6b61d5-00-1uk2rcqp51d99.kirk.replit.dev/enviar-notificacion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uid: uid,
        status: estado
      })
    })

    const data = await response.json()
    console.log('Notificación enviada:', data)
  } catch (error) {
    console.error('Error enviando notificación:', error)
  }
}

const NotasChofer = () => {
  const [notas, setNotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [notaSeleccionada, setNotaSeleccionada] = useState(null)

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const notasRef = collection(database, 'notas')
        const q = query(
          notasRef,
          where('estado', 'in', ['Listo para entrega', 'En camino'])
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setNotas(data)
      } catch (error) {
        console.error('Error al obtener notas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotas()
  }, [])

  const cambiarEstado = async (nuevoEstado) => {
    if (!notaSeleccionada) return

    try {
      const notaRef = doc(database, 'notas', notaSeleccionada.id)
      await updateDoc(notaRef, { estado: nuevoEstado })

      // Enviar notificación al cliente
      const uidCliente = notaSeleccionada?.cliente?.id
      if (uidCliente) {
        await enviarNotificacion(uidCliente, nuevoEstado)
      }

      // Actualizar estado en local
      setNotas(prev =>
        prev.map(n =>
          n.id === notaSeleccionada.id ? { ...n, estado: nuevoEstado } : n
        )
      )

      Alert.alert('Éxito', `Estado actualizado a "${nuevoEstado}"`)
      setModalVisible(false)
      setNotaSeleccionada(null)
    } catch (error) {
      console.error('Error actualizando estado:', error)
      Alert.alert('Error', 'No se pudo actualizar el estado')
    }
  }

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notas del Chofer</Text>
      <FlatList
        data={notas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.notaItem}
            onPress={() => {
              setNotaSeleccionada(item)
              setModalVisible(true)
            }}
          >
            <Text style={styles.nombre}>{item.cliente?.nombre}</Text>
            <Text style={styles.direccion}>{item.cliente?.direccion}</Text>
            <Text style={styles.estado}>{item.estado}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal para cambiar estado */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false)
          setNotaSeleccionada(null)
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cambiar estado de la nota</Text>
            <Text style={styles.modalSubtitle}>
              Cliente: {notaSeleccionada?.cliente?.nombre}
            </Text>
            <Text style={styles.modalSubtitle}>
              Estado actual: {notaSeleccionada?.estado}
            </Text>

            {notaSeleccionada?.estado === 'Listo para entrega' && (
              <Button
                title="Marcar como En camino"
                onPress={() => cambiarEstado('En camino')}
              />
            )}

            {(notaSeleccionada?.estado === 'Listo para entrega' ||
              notaSeleccionada?.estado === 'En camino') && (
              <Button
                title="Marcar como Entregado"
                onPress={() => cambiarEstado('Entregado')}
                color="green"
              />
            )}

            <Button
              title="Cancelar"
              onPress={() => {
                setModalVisible(false)
                setNotaSeleccionada(null)
              }}
              color="red"
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default NotasChofer

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12
  },
  notaItem: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  direccion: {
    fontSize: 14
  },
  estado: {
    fontSize: 14,
    color: '#555'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    width: '80%',
    borderRadius: 8,
    elevation: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 10
  }
})
