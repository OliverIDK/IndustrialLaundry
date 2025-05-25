import { StyleSheet, Text, View,Alert,Button,TouchableOpacity } from 'react-native'
import React, {useState,useEffect} from 'react';
import * as Location from "expo-location"

const GPS = (props) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });
  // Función para solicitar permisos y obtener la ubicación
  const getLocation = async () => {
    // Solicitar permisos de ubicación
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'No se puede acceder a la ubicación.');
      return;
    }

    // Obtener la ubicación actual
    const location = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  useEffect(() => {
    getLocation();
  }, [props]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        Latitud: {location.latitude ? location.latitude : 'Cargando...'}
      </Text>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        Longitud: {location.longitude ? location.longitude : 'Cargando...'}
      </Text>
      <Button title="Mostrar GPS" onPress={getLocation} />
      <TouchableOpacity style={{backgroundColor: 'blue', marginTop: 10, borderRadius: 30, height: 50,width:150}}
      onPress={()=> props.navigation.navigate('Mapa', {
        lat: parseFloat(location.latitude), 
        lon: parseFloat(location.longitude)})}>
          <Text style={{fontSize: 20, fontWeight: 'bold', color:'white', margin: 'auto'}}>Mostrar Mapa</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GPS;