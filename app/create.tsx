import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker, Polygon, Region } from "react-native-maps";
import * as Location from "expo-location";
import { StatusBar } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { height } = Dimensions.get("window");

export default function Create() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [squareSize, setSquareSize] = useState<number>(0.0003);
  const [latitude, setLatitude] = useState<number>(63.822351);
  const [longitude, setLongitude] = useState<number>(20.310929);
  const [region, setRegion] = useState<Region>({
    latitude: 63.822351,
    longitude: 20.310929,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });
    })();
  }, []);

  const squareCoordinates = [
    { latitude: latitude + squareSize / 2, longitude: longitude - squareSize * 1.1 },
    { latitude: latitude + squareSize / 2, longitude: longitude + squareSize * 1.1 },
    { latitude: latitude - squareSize / 2, longitude: longitude + squareSize * 1.1 },
    { latitude: latitude - squareSize / 2, longitude: longitude - squareSize * 1.1 },
  ];

  const sizes = [
    { label: "30x30", value: 0.0003 },
    { label: "50x50", value: 0.0005 },
    { label: "100x100", value: 0.001 },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EF98BC" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>CREATE</Text>
      </View>

      {/* Karta */}
      <MapView style={styles.map} region={region} rotateEnabled={false} pitchEnabled={false}>
        <Polygon coordinates={squareCoordinates} strokeColor="#3487EA" strokeWidth={3} fillColor="transparent" />
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>

      {/* Canvas storlek */}
      <View style={styles.sizeSection}>
        <Text style={styles.sizeLabel}>CANVAS SIZE</Text>
        <View style={styles.sizeButtons}>
          {sizes.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[styles.sizeButton, squareSize === s.value && styles.sizeButtonActive]}
              onPress={() => setSquareSize(s.value)}
            >
              <Text style={[styles.sizeButtonText, squareSize === s.value && styles.sizeButtonTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Knappar */}
      <View style={[styles.buttons, { marginBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.buttonText}>BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push({ pathname: "/create2", params: { size: squareSize, latitude, longitude } })}
        >
          <Text style={styles.buttonText}>NEXT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6F0",
  },
  header: {
    width: "100%",
    height: height * 0.15,
    backgroundColor: "#EF98BC",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 12,
  },
  headerText: {
    color: "#515050",
    fontSize: 50,
    fontFamily: "LuckiestGuy",
  },
  map: {
    width: "100%",
    height: height * 0.45,
  },
  sizeSection: {
    paddingHorizontal: 48,
    paddingTop: 20,
    gap: 12,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  sizeLabel: {
    color: "#515050",
    fontSize: 20,
    fontFamily: "LuckiestGuy",
  },
  sizeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#515050",
    backgroundColor: "#FAF7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  sizeButtonActive: {
    backgroundColor: "#515050",
  },
  sizeButtonText: {
    color: "#515050",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    textAlign: "center",
  },
  sizeButtonTextActive: {
    color: "#FAF7FF",
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backButton: {
    width: 145,
    height: 58,
    backgroundColor: "#EA9734",
    borderRadius: 10,
    justifyContent: "center",
  },
  nextButton: {
    width: 145,
    height: 58,
    backgroundColor: "#3487EA",
    borderRadius: 10,
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    color: "#FAF7FF",
    fontWeight: "bold",
    fontSize: 24,
    fontFamily: "LuckiestGuy",
  },
});