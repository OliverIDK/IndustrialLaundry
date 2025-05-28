import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Button, Image, Animated } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

const puntosRuta = [
  { latitude: 20.65189410225203, longitude: -105.21876069886645 },
  { latitude: 20.653639628175085, longitude: -105.21806374350523 },
  { latitude: 20.648502419839954, longitude: -105.20322532831635 },
  { latitude: 20.653083572748642, longitude: -105.20140901930594 },
  { latitude: 20.652635078660293, longitude: -105.20010976575853 },
  { latitude: 20.65460855936473, longitude: -105.19977975591098 },
  { latitude: 20.654122639042935, longitude: -105.19863597225545 },
  { latitude: 20.653987581936242, longitude: -105.19792025005509 },
];

const Mapa = () => {
  const [region, setRegion] = useState(null);
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);

  const animLat = useRef(new Animated.Value(puntosRuta[0].latitude)).current;
  const animLng = useRef(new Animated.Value(puntosRuta[0].longitude)).current;

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso de ubicación denegado');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
    setLocation(coords);
    setRegion({
      ...coords,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  useEffect(() => {
    getLocation();
  }, []);

  const iniciarRecorrido = async () => {
    for (let i = 0; i < puntosRuta.length; i++) {
      const point = puntosRuta[i];

      // Animar lat y lng
      await new Promise((resolve) => {
        Animated.parallel([
          Animated.timing(animLat, {
            toValue: point.latitude,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animLng, {
            toValue: point.longitude,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]).start(() => resolve());
      });

      // Animar el mapa para centrar en el nuevo punto
      if (mapRef.current) {
        mapRef.current.animateCamera({
          center: {
            latitude: point.latitude,
            longitude: point.longitude,
          },
          zoom: 16, // Ajusta el zoom a lo que necesites
        }, { duration: 1000 });
      }
    }
  };

  return (
    <View style={styles.container}>
      {region ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            onRegionChangeComplete={setRegion}
          >
            <Polyline coordinates={puntosRuta} strokeWidth={4} strokeColor="blue" />
          </MapView>

          <AnimatedCarrito lat={animLat} lng={animLng} mapRef={mapRef} region={region} />

          <View style={styles.buttonContainer}>
            <Button title="Iniciar recorrido" onPress={iniciarRecorrido} />
          </View>
        </>
      ) : (
        <Text style={styles.text}>Cargando mapa...</Text>
      )}
    </View>
  );
};

const AnimatedCarrito = ({ lat, lng, mapRef, region }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = async () => {
      if (!mapRef.current || !region) return;

      const coord = {
        latitude: lat.__getValue(),
        longitude: lng.__getValue(),
      };

      try {
        const point = await mapRef.current.pointForCoordinate(coord);
        setPosition({ x: point.x - 25, y: point.y - 25 }); // Ajusta para centrar el carrito
      } catch (error) {
        console.log('Error al convertir coordenadas:', error);
      }
    };

    // Actualiza posición al cambiar lat o lng
    const listenerLat = lat.addListener(updatePosition);
    const listenerLng = lng.addListener(updatePosition);

    updatePosition(); // inicial

    return () => {
      lat.removeListener(listenerLat);
      lng.removeListener(listenerLng);
    };
  }, [lat, lng, mapRef, region]);

  return (
    <View
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: 50,
        height: 50,
        zIndex: 1000,
      }}
    >
      <Image
        source={require('../src/Assets/Imagenes/camion.png')}
        style={{ width: 50, height: 50 }}
      />
    </View>
  );
};

export default Mapa;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  text: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 1000,
  },
});
