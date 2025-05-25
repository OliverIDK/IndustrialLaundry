import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { database, auth } from "../src/config/fb"; // Verifica que esta ruta sea correcta

const { width } = Dimensions.get("window");

const images = [
  require("../src/Assets/Imagenes/2.jpg"),
  require("../src/Assets/Imagenes/3.jpg"),
  require("../src/Assets/Imagenes/4.jpg"),
];

const Cliente = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef();

  const [tiposLavado, setTiposLavado] = useState([]);
  const [notasEntregadas, setNotasEntregadas] = useState([]);

  const imageWidth = 300; 
  const imageHeight = 200; 

  // Carga tipos de lavado una vez
  const fetchTiposLavado = async () => {
    try {
      const q = query(collection(database, "tipos_lavado"));
      onSnapshot(q, (snapshot) => {
        const tipos = [];
        snapshot.forEach((doc) => {
          tipos.push({ id: doc.id, ...doc.data() });
        });
        setTiposLavado(tipos);
      });
    } catch (error) {
      console.error("Error al obtener tipos de lavado:", error);
    }
  };

  useEffect(() => {
    fetchTiposLavado();

    // Suscripción en tiempo real a notas entregadas del usuario logueado
    const user = auth.currentUser;
    if (!user) return;

    const notasRef = collection(database, "notas");
    const q = query(
      notasRef,
      where("cliente.uid", "==", user.uid),
      where("estado", "==", "Entregado")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notasData = [];
        snapshot.forEach((doc) => {
          notasData.push({ idNota: doc.id, ...doc.data() });
        });
        setNotasEntregadas(notasData);
      },
      (error) => {
        console.error("Error en escucha de notas entregadas:", error);
      }
    );

    return () => unsubscribe(); // Limpieza al desmontar
  }, []);

  // Carrusel automático cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (imageWidth + 16),
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const onScroll = (event) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / (imageWidth + 16)
    );
    setCurrentIndex(slide);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Carrusel */}
      <View style={styles.carruselWrapper}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          ref={scrollViewRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.carrusel}
          contentContainerStyle={{ paddingHorizontal: (width - imageWidth) / 2 }}
          snapToInterval={imageWidth + 16}
          decelerationRate="fast"
        >
          {images.map((img, i) => (
            <Image
              key={i}
              source={img}
              style={[
                styles.carruselImagen,
                { width: imageWidth, height: imageHeight },
              ]}
              resizeMode="contain"
            />
          ))}
        </ScrollView>

        <View style={styles.indicadores}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                styles.indicador,
                i === currentIndex ? styles.indicadorActivo : null,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Servicios */}
      <View style={styles.serviciosContainer}>
        <Text style={styles.sectionTitle}>Servicios</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tiposLavado.length === 0 ? (
            <Text>Cargando servicios...</Text>
          ) : (
            tiposLavado.map((servicio) => (
              <View key={servicio.id} style={styles.servicioCard}>
                <Text style={styles.servicioNombre}>{servicio.nombre}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Historial */}
      <View style={styles.historialContainer}>
        <Text style={styles.sectionTitle}>Historial de notas entregadas</Text>
        {notasEntregadas.length === 0 && (
          <Text style={{ color: "#666" }}>No hay notas entregadas aún.</Text>
        )}
        {notasEntregadas.map((nota) => (
          <View key={nota.idNota} style={styles.notaCard}>
            <Text style={styles.notaId}>Nota: {nota.idNota}</Text>
            <Text>Fecha Entrega: {nota.fechaEntrega || nota.fecha}</Text>
            <Text style={styles.notaSubtotal}>
              Subtotal: ${nota.subtotal?.toFixed(2) || nota.subtotal || "0.00"}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Cliente;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  carruselWrapper: {
    height: 220,
    marginBottom: 20,
  },
  carrusel: {
    flex: 1,
  },
  carruselImagen: {
    borderRadius: 10,
    marginRight: 16,
  },
  indicadores: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  indicador: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginHorizontal: 6,
  },
  indicadorActivo: {
    backgroundColor: "#2196f3",
  },
  serviciosContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  servicioCard: {
    width: 120,
    height: 60,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  historialContainer: {
    marginBottom: 30,
  },
  notaCard: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  notaId: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  notaSubtotal: {
    marginTop: 6,
    fontWeight: "600",
  },
});
