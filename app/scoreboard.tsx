import React, { useState } from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Popup } from '../components/Popup';

export default function Scoreboard() {
  const [isPopupVisible, setPopupVisible] = useState(false);

  const router = useRouter();
  const [counter, setCounter] = React.useState(5);
  React.useEffect(() => {
    counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
  }, [counter]);

  return (
    <View style={styles.container}>
      <View style={styles.lobbyRoomContainer}>
        <View style={styles.lobbyRoomBar}>
          <View style={styles.iconContainer}></View>
          <Text style={styles.lobbyText}>HEJ123</Text>
        </View>
      </View>
      <View style={styles.headerTextContainer}>
        <Text style={styles.luckyTextHeader}>HIGHSCORES</Text>
      </View>
      <View style={styles.leaderBoardContainer}>
        <Text style={styles.leaderBoardText}>KartJanne</Text>
        <Text style={styles.leaderBoardText}>Hästen4</Text>
        <Text style={styles.leaderBoardText}>LeffeMedKniven_4</Text>
        <Text style={styles.leaderBoardText}>Zorrokungen</Text>
      </View>
      <View style={styles.countdownContainer}>
        <Text style={styles.countdownText}>{counter}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.buttonText}>LEAVE</Text>
        </TouchableOpacity>
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
            title="Scoreboard" 
            info={`BlaBla`}
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
  leaveButton: {
    width: "100%",
    height: 58,
    backgroundColor: "#F25959",
    borderRadius: 10,
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#FAF7FF",
    fontSize: 24,
    fontFamily: "OpenSans-Regular.ttf",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: 306,
    height: 58,
    marginTop: 25,
    marginBottom: 20,
  },
  leaderBoardContainer: {
    width: 388,
    height: 377,
    padding: 15,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#EA9734",
    backgroundColor: "#FAF7FF",
  },
  leaderBoardText: {
    fontSize: 24,
    marginBottom: 15,
    fontFamily: "LuckiestGuy",
    color: "#515050",
  },
  headerTextContainer: {
    display: "flex",
    justifyContent: "center",
    width: 388,
    height: 80,
    marginBottom: 5,
  },
  luckyTextHeader: {
    fontFamily: "LuckiestGuy",
    marginTop: 32,
    fontSize: 40,
    color: "#EA9734",
  },
  lobbyRoomContainer: {
    width: 281,
    height: 54,
    marginTop: 42,
  },
  lobbyRoomBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    width: 281,
    height: 54,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#3487EA",
    backgroundColor: "#FFFFFF",
  },
  iconContainer: {
    height: 38,
    width: 44,
    backgroundColor: "gray",
    marginRight: 10,
  },
  lobbyText: {
    fontSize: 30,
    color: "#E96FA6",
    fontFamily: "LuckiestGuy",
  },
  infoIconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    width: 60,
    marginLeft: 320,
    marginTop: 30,
  },
  countdownContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 228,
    height: 100,
    marginTop: 38,
  },
  countdownText: {
    color: "#515050",
    fontSize: 60,
    fontFamily: "LuckiestGuy",
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
