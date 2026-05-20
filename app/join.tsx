import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Popup } from '../components/Popup';

import { useRouter } from "expo-router";

import { useSocket } from "../utils/socketContext";

export default function Join() {
  const [isPopupVisible, setPopupVisible] = useState(false);

  const router = useRouter();

  const { socket } = useSocket();

  const [nickname, setNickname] = useState("");
  const [gameCode, setGameCode] = useState(""); // State for lobby code

  const handleJoinGame = () => {
    if (nickname.trim() === "" || gameCode.trim() === "") {
      Alert.alert("Both fields are required");
      return;
    }

    if(socket) {
      socket.emit('joinGame', {gameCode, nickname});

      socket.on("playerList", (players) => {
        console.log("Player list updated:", players);
        router.push({ pathname: "/lobby", params: { gameCode, nickname } });
      });

      socket.on("error", (errorMessage) => {
        Alert.alert(errorMessage);
      });
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.joinBox}>
        <Text style={styles.luckyTextHeader}>JOIN</Text>
        <View style={styles.inputContainer}>
          <SafeAreaView>
            <Text style={styles.luckyText}>Lobby</Text>
            <TextInput
              style={styles.input}
              onChangeText={setGameCode}
              value={gameCode}
            />
            <View style={styles.inputContainer2}>
              <Text style={styles.luckyText}>Användare</Text>
              <TextInput
                style={styles.input}
                onChangeText={setNickname}
                value={nickname}
              />
            </View>
          </SafeAreaView>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>BACK</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinGame}
          >
            <Text style={styles.buttonText}>JOIN</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoButtonContainer}>
        <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setPopupVisible(true)}
        >
            <View style={styles.infoButtonContainer}>
                <FontAwesome6 name="circle-info" size={48} color="#515050" />
            </View>
        </TouchableOpacity>
      </View>
      {isPopupVisible && (
        <Popup
            title="Welcome" 
            info={`This is the join page`}
            onClose={() => setPopupVisible(false)}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F2ED",
  },
  backButton: {
    width: 145,
    height: 58,
    backgroundColor: "#EA9734",
    borderRadius: 10,
    justifyContent: "center",
    fontFamily: "LuckiestGuy",
  },
  joinButton: {
    width: 145,
    height: 58,
    backgroundColor: "#3487EA",
    borderRadius: 10,
    justifyContent: "center",
    fontFamily: "LuckiestGuy",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#FAF7FF",
    fontSize: 24,
    fontFamily: "OpenSans-Regular",
  },
  luckyText: {
    fontFamily: "LuckiestGuy",
    marginBottom: 6,
    fontSize: 30,
    color: "#515050",
  },
  luckyTextHeader: {
    fontFamily: "LuckiestGuy",
    marginTop: 32,
    fontSize: 30,
    color: "#EA9734",
  },
  joinBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    width: 360,
    height: 473,
    borderRadius: 15,
    backgroundColor: "#C5EB9F",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: 306,
    height: 58,
    marginTop: 65,
    marginBottom: 37,
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: 215,
    width: 240,
    marginTop: 35,
  },
  input: {
    width: 240,
    height: 50,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.60)",
  },
  inputContainer2: {
    marginTop: 35,
  },
  infoButtonContainer: {
    position: 'absolute', // Position the container absolutely
    bottom: 20,           // Distance from the bottom edge of the screen
    right: 20,             // Distance from the left edge of the screen
    zIndex: 1000,         // Ensure it stays above other content
  },
  infoButton: {
      width: 50,
      height: 50,
  },
  
});
