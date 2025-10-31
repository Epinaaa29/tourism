import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

interface OpenStreetMapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  style?: any;
}

let MapView: any;
let Marker: any;
let PROVIDER_DEFAULT: any;

// Try to load react-native-maps, but handle gracefully if not available
try {
  const mapsModule = require('react-native-maps');
  MapView = mapsModule.default;
  Marker = mapsModule.Marker;
  PROVIDER_DEFAULT = mapsModule.PROVIDER_DEFAULT;
} catch (e) {
  console.log('react-native-maps not available, using fallback');
}

export function OpenStreetMapView({
  latitude,
  longitude,
  title,
  description,
  style,
}: OpenStreetMapViewProps) {
  const mapRef = useRef<any>(null);
  const [mapError, setMapError] = useState(false);
  
  // Check if we're in Expo Go (where react-native-maps won't work)
  const isExpoGo = Constants.executionEnvironment === 'storeClient';
  // Force static maps for now - MapView might load but not render properly in all environments
  const shouldUseStaticMap = !MapView || Platform.OS === 'web' || isExpoGo || true;
  
  const [useStatic, setUseStatic] = useState(shouldUseStaticMap);
  const zoom = 15;
  
  console.log('Expo Go:', isExpoGo);
  console.log('Should use static:', shouldUseStaticMap);
  
  const handlePress = () => {
    // Open in external maps app
    const url = Platform.select({
      ios: `maps://maps.google.com/maps?daddr=${latitude},${longitude}&directionsmode=driving`,
      android: `google.navigation:q=${latitude},${longitude}`,
      default: `https://maps.google.com/maps?q=${latitude},${longitude}`,
    });
    Linking.openURL(url!).catch(err => console.error('Failed to open maps:', err));
  };

  console.log('MapView available:', !!MapView);
  console.log('Using static map:', useStatic);

  // Use WebView with OpenStreetMap if MapView is not available or on error
  if (useStatic || mapError) {
    // Create HTML with embedded OpenStreetMap
    const mapHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body { margin: 0; padding: 0; }
            #map { width: 100%; height: 100vh; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map').setView([${latitude}, ${longitude}], ${zoom});
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(map);
            var marker = L.marker([${latitude}, ${longitude}]).addTo(map);
            marker.bindPopup('${title || "Location"}<br>${latitude.toFixed(6)}, ${longitude.toFixed(6)}').openPopup();
          </script>
        </body>
      </html>
    `;

    return (
      <TouchableOpacity 
        style={[styles.container, style]} 
        activeOpacity={1}
        onPress={handlePress}
      >
        <WebView
          source={{ html: mapHtml }}
          style={styles.webview}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </TouchableOpacity>
    );
  }

  // Use PROVIDER_DEFAULT which will use Apple Maps on iOS and Google Maps on Android by default
  const mapProvider = PROVIDER_DEFAULT;

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <MapView
        ref={mapRef}
        provider={mapProvider}
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        loadingEnabled={true}
        onMapReady={() => {
          console.log('Map loaded successfully');
        }}
        onError={(error: any) => {
          console.error('Map error:', error);
          setMapError(true);
        }}
      >
        <Marker
          coordinate={{
            latitude,
            longitude,
          }}
          title={title}
          description={description}
        />
      </MapView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  webview: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

