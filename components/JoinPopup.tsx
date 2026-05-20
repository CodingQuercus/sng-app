import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSocket } from "../utils/socketContext";

type PopupProps = {
  title: string;
  info: string;
  onClose: () => void;
}

export function JoinPopup({ onClose }: PopupProps) {
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;

  const { socket } = useSocket();
  const router = useRouter();

  const firstInputRef = useRef<TextInput>(null);
  const secondInputRef = useRef<TextInput>(null);

  const [nickname, setNickname] = useState("");
  const [gameCode, setGameCode] = useState("");

  const openAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const exitAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 0.8,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleJoinGame = () => {
    if (nickname.trim() === "" || gameCode.trim() === "") {
      Alert.alert("Both fields are required");
      return;
    }

    if (socket) {
      socket.emit("joinGame", { gameCode, nickname });
    }
  };

  useEffect(() => {
    openAnimation();
    const handlePlayerList = () => {
      exitAnimation();
      setTimeout(() => {
        onClose();
        router.push({ pathname: "/lobby", params: { gameCode, nickname } });
      }, 200);
    };

    const handleError = (errorMessage: string) => {
      Alert.alert(errorMessage);
    };

    if (socket) {
      socket.on("playerList", handlePlayerList);
      socket.on("error", handleError);
    }

    return () => {
      if (socket) {
        socket.off("playerList", handlePlayerList);
        socket.off("error", handleError);
      }
    };
  }, [socket, router, gameCode, nickname]);

  return (
    <View
      style={styles.overlay}
    >
      <Animated.View style={[styles.joinBox, { opacity: fadeAnimation, transform: [{ scale: scaleAnimation }] }]}>
        <View style={styles.joinBox}>
          <Text style={styles.luckyTextHeader}>JOIN</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.luckyText}>LOBBY CODE:</Text>
            <TextInput
              style={styles.input}
              onChangeText={setGameCode}
              placeholder="Lobby Code"
              value={gameCode}
              multiline={false}
              ref={firstInputRef}
              returnKeyType="next"
              onSubmitEditing={() => {
                if (secondInputRef.current) {
                  secondInputRef.current.focus();
                } else {
                  console.error("secondInputRef is not accessible");
                }
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.luckyText}>NICKNAME:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nickname"
              onChangeText={setNickname}
              value={nickname}
              ref={secondInputRef}
            />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                exitAnimation();
                setTimeout(() => {
                  onClose();
                }, 300);
              }}
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    width: 145,
    height: 58,
    backgroundColor: "#EA9734",
    borderRadius: 10,
    justifyContent: "center",
  },
  joinButton: {
    width: 145,
    height: 58,
    backgroundColor: "#3487EA",
    borderRadius: 10,
    justifyContent: "center",
    zIndex: 1010,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#FAF7FF",
    fontSize: 24,
    fontFamily: "LuckiestGuy",
  },
  luckyText: {
    fontFamily: "LuckiestGuy",
    fontSize: 24,
    color: "#515050",
    marginBottom: 8,
  },
  luckyTextHeader: {
    fontFamily: "LuckiestGuy",
    fontSize: 40,
    color: "#EA9734",
  },
  joinBox: {
    width: 360,
    borderRadius: 15,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#C5EB9F",
    gap: 24,
    alignItems: "center",
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: "row",
    gap: 16,
  },
  inputContainer: {
    width: "100%",
    gap: 4,
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.60)",
    fontFamily: "OpenSans-Regular",
    color: "#515050",
    fontSize: 20,
  },
});
