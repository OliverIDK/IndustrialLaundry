import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import MapView, { Polyline, Marker, AnimatedRegion } from 'react-native-maps';
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
  const mapRef = useRef(null);

  const carritoCoord = useRef(
    new AnimatedRegion({
      latitude: puntosRuta[0].latitude,
      longitude: puntosRuta[0].longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  ).current;

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso de ubicación denegado');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
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

      await new Promise((resolve) => {
        carritoCoord.timing({
          latitude: point.latitude,
          longitude: point.longitude,
          duration: 1000,
          useNativeDriver: false,
        }).start(() => resolve());
      });

      if (mapRef.current) {
        mapRef.current.animateCamera(
          {
            center: {
              latitude: point.latitude,
              longitude: point.longitude,
            },
            zoom: 16,
          },
          { duration: 1000 }
        );
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
            showsUserLocation={true}
          >
            <Polyline coordinates={puntosRuta} strokeWidth={4} strokeColor="blue" />

            {/* Marker animado sin imagen, solo pin por defecto */}
            <Marker.Animated coordinate={carritoCoord} />
          </MapView>

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
