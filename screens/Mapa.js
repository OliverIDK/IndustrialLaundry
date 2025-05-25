import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect,useState } from 'react'
import MapView, { Marker } from 'react-native-maps';

const Mapa = (props) => {
    const [region, setRegion] = useState({
        latitude: props.route.params.lat,
        longitude: props.route.params.lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    useEffect(() => {
        setRegion
    }, [props])
  return (
        <MapView
        style={{flex: 1}}
        region={region}
        onRegionChangeComplete={region=> setRegion(region)}
        >
            <Marker coordinate={{
                latitude:props.route.params.lat,
                longitude:props.route.params.lon
            }}
            
            />
        </MapView>
  )
}

export default Mapa

const styles = StyleSheet.create({})