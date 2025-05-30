import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker, AnimatedRegion } from 'react-native-maps';
import { onValue, ref } from 'firebase/database';
import { realtimeDB } from '../src/config/fb';

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
  const [mapType, setMapType] = useState('standard'); // 'standard' o 'satellite'
  const mapRef = useRef(null);

  const carritoCoord = useRef(
    new AnimatedRegion({
      latitude: puntosRuta[0].latitude,
      longitude: puntosRuta[0].longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  ).current;

  useEffect(() => {
    const coordRef = ref(realtimeDB, 'carrito/ubicacion');

    const unsubscribe = onValue(coordRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Datos recibidos de Realtime DB:', data);

      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const { latitude, longitude } = data;

        carritoCoord.timing({
          latitude,
          longitude,
          duration: 1000,
          useNativeDriver: false,
        }).start();

        if (mapRef.current) {
          mapRef.current.animateCamera(
            {
              center: { latitude, longitude },
              zoom: 16,
            },
            { duration: 1000 }
          );
        }
      } else {
        console.warn('Datos inválidos para carrito:', data);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setRegion({
      latitude: puntosRuta[0].latitude,
      longitude: puntosRuta[0].longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, []);

  const toggleMapType = () => {
    setMapType((prev) => (prev === 'standard' ? 'satellite' : 'standard'));
  };

  return (
    <View style={styles.container}>
      {region ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            mapType={mapType}
            showsUserLocation={true}
            showsMyLocationButton={true} // Android: botón nativo centrar ubicación
            zoomControlEnabled={true}    // Android: botones nativos de zoom
            showsCompass={true}          // brújula nativa iOS y Android
          >
            <Polyline coordinates={puntosRuta} strokeWidth={4} strokeColor="blue" />
            <Marker.Animated coordinate={carritoCoord} />
          </MapView>

          <TouchableOpacity style={styles.btnMapType} onPress={toggleMapType} activeOpacity={0.7}>
            <Text style={styles.btnText}>
              {mapType === 'standard' ? 'Satélite' : 'Mapa'}
            </Text>
          </TouchableOpacity>
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
  btnMapType: {
    position: 'absolute',
    bottom: 40,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // negro semi-transparente
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  btnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
