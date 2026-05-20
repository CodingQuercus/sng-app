import React, { useState } from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { JoinPopup } from "../components/JoinPopup";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Popup } from "../components/Popup";

const { height, width } = Dimensions.get("window");

type GameCreated = {
    gameCode: string;
    nickname: string;
    role: string;
};

export default function Index() {
  const router = useRouter();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isJoinPopupVisible, setJoinPopupVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.joinButton} onPress={() => setJoinPopupVisible(true)}>
          <Text style={styles.buttonText}>JOIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.createButton} onPress={() => router.push("/create")}>
          <Text style={styles.buttonText}>CREATE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rulesButton} onPress={() => router.push("/rules")}>
          <Text style={styles.buttonText}>RULES</Text>
        </TouchableOpacity>
      </View>

      {isJoinPopupVisible && (
        <JoinPopup title="Join" info="" onClose={() => setJoinPopupVisible(false)} />
      )}

      <View style={styles.infoButtonContainer}>
        <TouchableOpacity onPress={() => setPopupVisible(true)}>
          <FontAwesome6 name="circle-info" size={48} color="#515050" />
        </TouchableOpacity>
      </View>

      {isPopupVisible && (
        <Popup
          title="Welcome"
          info={`This is the start page where you can join another user's game or create your own and invite your friends!\n\nFirst time playing Sketch'N'Guess? Read the rules and you will be good to go.\n\nHave fun!`}
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
  logo: {
    width: width * 0.7,
    height: height * 0.35,
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 20,
    paddingTop: 20,
  },
  joinButton: {
    width: 200,
    height: 58,
    backgroundColor: "#3487EA",
    borderRadius: 10,
    justifyContent: "center",
  },
  createButton: {
    width: 200,
    height: 58,
    backgroundColor: "#EA9734",
    borderRadius: 10,
    justifyContent: "center",
  },
  rulesButton: {
    width: 200,
    height: 58,
    backgroundColor: "#E96FA6",
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
  infoButtonContainer: {
    position: "absolute",
    bottom: height * 0.02,
    right: width * 0.04,
    zIndex: 1000,
  },
});