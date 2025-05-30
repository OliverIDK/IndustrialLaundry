import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
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

  const imageWidth = width * 0.9;
  const imageHeight = 200;

  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

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
          contentContainerStyle={{
            paddingHorizontal: (width - imageWidth) / 2,
          }}
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
            <Text style={{ color: "#777", fontStyle: "italic" }}>
              Cargando servicios...
            </Text>
          ) : (
            tiposLavado.map((servicio) => {
              const seleccionado = servicio.id === servicioSeleccionado;
              return (
                <TouchableOpacity
                  key={servicio.id}
                  style={[
                    styles.servicioCard,
                    seleccionado
                      ? styles.servicioCardSeleccionado
                      : styles.servicioCardNormal,
                  ]}
                  onPress={() => setServicioSeleccionado(servicio.id)}
                >
                  <Text
                    style={[
                      styles.servicioNombre,
                      seleccionado
                        ? styles.servicioNombreSeleccionado
                        : styles.servicioNombreNormal,
                    ]}
                  >
                    {servicio.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Historial */}
      <View style={styles.historialContainer}>
        <Text style={styles.sectionTitle}>Historial de notas entregadas</Text>
        {notasEntregadas.length === 0 ? (
          <Text style={{ color: "#777", fontStyle: "italic" }}>
            No hay notas entregadas aún.
          </Text>
        ) : (
          notasEntregadas.map((nota) => (
            <View key={nota.idNota} style={styles.notaCard}>
              <View style={styles.notaHeader}>
                <Text style={styles.notaId}>
                  #{nota.idNota.slice(-6).toUpperCase()}
                </Text>
                <Text style={styles.notaFecha}>
                  {nota.fechaEntrega || nota.fecha}
                </Text>
              </View>
              <Text style={styles.notaSubtotal}>
                Subtotal:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  ${nota.subtotal?.toFixed(2) || "0.00"}
                </Text>
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default Cliente;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  carruselWrapper: {
    height: 225,
    marginBottom: 10,
    width: "110%",
  },
  carrusel: {
    flex: 1,
  },
  carruselImagen: {
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#fff",
  },
  indicadores: {
    position: "absolute",
    bottom: 5,
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
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    color: "#333",
    marginTop:1,
  },
  servicioCard: {
    width: 140,
    height: 70,
    borderRadius: 12,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    
  },
  servicioCardNormal: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },
  servicioCardSeleccionado: {
    backgroundColor: "#EAF1FF",
    borderColor: "#2196f3",
  },

  servicioNombre: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  servicioNombreNormal: {
    color: "#666",
  },
  servicioNombreSeleccionado: {
    color: "#2196f3",
  },

  notaCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: "#2196F3",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    borderRightWidth: 0.5,
    borderRightColor: "#ccc",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  notaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  notaId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  notaFecha: {
    fontSize: 14,
    color: "#888",
  },
  notaSubtotal: {
    fontSize: 15,
    color: "#444",
    marginTop: 4,
  },
});
