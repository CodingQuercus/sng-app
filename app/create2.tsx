import React, { useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Alert, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "react-native";
import MapView, { Marker, Polygon, Region } from "react-native-maps";
import { useSocket } from "../utils/socketContext";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get("window");

type GameCreated = {
  gameCode: string,
  nickname: string,
  role: string,
}

export default function Create2() {
  const router = useRouter();
  const { socket } = useSocket();
  const insets = useSafeAreaInsets();

  const { size, latitude, longitude } = useLocalSearchParams();

  const mapLat = Number(latitude);
  const mapLon = Number(longitude);
  const mapSize = Math.round(Number(size) * 100000);

  const [selectedTime, setSelectedTime] = useState("3:00");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [selectedRounds, setSelectedRounds] = useState("5");
  const [showRoundsDropdown, setShowRoundsDropdown] = useState(false);
  const [nickname, setNickname] = useState("");

  const [region] = useState<Region>({
    latitude: mapLat,
    longitude: mapLon,
    latitudeDelta: Number(size),
    longitudeDelta: Number(size),
  });

  const squareCoordinates = [
    { latitude: mapLat + Number(size) / 2, longitude: mapLon - Number(size) * 1.19 },
    { latitude: mapLat + Number(size) / 2, longitude: mapLon + Number(size) * 1.19 },
    { latitude: mapLat - Number(size) / 2, longitude: mapLon + Number(size) * 1.19 },
    { latitude: mapLat - Number(size) / 2, longitude: mapLon - Number(size) * 1.19 },
  ];

  const times = ["3:00", "5:00", "10:00"];
  const rounds = ["5", "10", "15"];

  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  const handleCreateGame = () => {

    if (nickname.trim() === "") {
      Alert.alert("Please enter a nickname");
      return;
    }

    socket.emit("createGame", {
      nickname,
      size,
      mapLat,
      mapLon,
      timeInMinutes: convertTimeToMinutes(selectedTime),
      selectedRounds,
    });

    socket.on("gameCreated", ({ gameCode, nickname, role } : GameCreated) => {
      router.push({ pathname: "/lobby", params: { gameCode, nickname, role } });
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EF98BC" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>CREATE</Text>
      </View>

      {/* Karta */}
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Polygon coordinates={squareCoordinates} strokeColor="#3487EA" strokeWidth={3} fillColor="transparent" />
          <Marker coordinate={{ latitude: mapLat, longitude: mapLon }} />
        </MapView>
      </View>

      {/* Inställningar */}
      <View style={styles.settings}>
        <View style={styles.row}>
          <Text style={styles.label}>CANVAS SIZE</Text>
          <Text style={styles.value}>{mapSize}x{mapSize}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>DURATION</Text>
          <View>
            <TouchableOpacity style={styles.selectButton} onPress={() => setShowTimeDropdown(!showTimeDropdown)}>
              <Text style={styles.selectButtonText}>{selectedTime}</Text>
            </TouchableOpacity>
            {showTimeDropdown && (
              <View style={styles.dropdown}>
                {times.map((t) => (
                  <TouchableOpacity key={t} style={styles.dropdownItem} onPress={() => { setSelectedTime(t); setShowTimeDropdown(false); }}>
                    <Text style={styles.dropdownText}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>ROUNDS</Text>
          <View>
            <TouchableOpacity style={styles.selectButton} onPress={() => setShowRoundsDropdown(!showRoundsDropdown)}>
              <Text style={styles.selectButtonText}>{selectedRounds}</Text>
            </TouchableOpacity>
            {showRoundsDropdown && (
              <View style={styles.dropdown}>
                {rounds.map((r) => (
                  <TouchableOpacity key={r} style={styles.dropdownItem} onPress={() => { setSelectedRounds(r); setShowRoundsDropdown(false); }}>
                    <Text style={styles.dropdownText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.nicknameContainer}>
          <Text style={styles.label}>NICKNAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Nickname"
            value={nickname}
            onChangeText={setNickname}
          />
        </View>
      </View>

      {/* Knappar */}
      <View style={[styles.buttons, { marginBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.buttonText}>BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateGame}>
          <Text style={styles.buttonText}>CREATE</Text>
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
  mapWrapper: {
    width: "55%",
    height: height * 0.25,
    alignSelf: "center",
    marginTop: 16,
    borderWidth: 5,
    borderColor: "#3487EA",
    overflow: "hidden",
    borderRadius: 4,
  },
  map: {
    flex: 1,
  },
  settings: {
    paddingHorizontal: 32,
    paddingTop: 16,
    gap: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: "#515050",
    fontSize: 22,
    fontFamily: "LuckiestGuy",
  },
  value: {
    color: "#515050",
    fontWeight: "bold",
    fontSize: 22,
    fontFamily: "OpenSans-Regular",
  },
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#EA9734",
    minWidth: 70,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#FAF7FF",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "OpenSans-Regular",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: 44,
    backgroundColor: "#FAF7FF",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#EA9734",
    zIndex: 100,
    minWidth: 120,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dropdownText: {
    color: "#EA9734",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "OpenSans-Regular",
  },
  nicknameContainer: {
    gap: 4,
},
  input: {
    height: 50,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#EA9734",
    backgroundColor: "#FAF7FF",
    paddingLeft: 12,
    fontSize: 20,
    fontFamily: "OpenSans-Regular",
    color: "#515050",
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
  createButton: {
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