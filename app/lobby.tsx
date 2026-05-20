import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Alert, Dimensions, StatusBar } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSocket } from "../utils/socketContext";
import { Popup } from "../components/Popup";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { height } = Dimensions.get("window");

type Player = {
  id: string;
  nickname: string;
  role: string;
  gamerole: string | null;
  score: number;
  time: number;
  rounds: number;
  currentRound: number;
}

type DrawingTurn = {
    playerId: string;
    gamerole: string;
    size: number;
    latitude: number;
    longitude: number;
    word: string;
    roundTime: number;
};

type GuessingTurn = {
    playerId: string;
    gamerole: string;
    size: number;
    latitude: number;
    longitude: number;
    roundTime: number;
};

export default function Lobby() {
  const router = useRouter();
  const { socket } = useSocket();
  const insets = useSafeAreaInsets();
  const { gameCode, nickname, role } = useLocalSearchParams();

  const [isPopupVisible, setPopupVisible] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gamerole, setGamerole] = useState("");
  const [secretWord, setSecretWord] = useState("");
  const [longitude, setLongitude] = useState<number>();
  const [latitude, setLatitude] = useState<number>();
  const [size, setSize] = useState<number>();
  const [roundTime, setRoundTime] = useState<number>();
  const [currentRound, setCurrentRound] = useState<number>();
  const [roundLim, setRoundLim] = useState<number>();
  const [isCounterVisible, setCounterVisible] = useState(false);
  const [counter, setCounter] = useState<number | null>(null);

  useEffect(() => {
    if (counter !== null && counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    } else if (counter === 0 && isCounterVisible) {
      const pathname = gamerole === "drawer" ? "/draw" : "/guess";
      const params = gamerole === "drawer"
        ? { gameCode, nickname, role, size, latitude, longitude, secretWord, roundTime }
        : { gameCode, nickname, role, size, latitude, longitude, roundTime };
      
      const timeout = setTimeout(() => {
        router.replace({ pathname, params });
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
}, [counter, isCounterVisible, gamerole, secretWord, router]);

  useEffect(() => {
    if (!socket) return;

    socket.on("playerList", (playersList: Player[]) => {
      setPlayers(playersList);
      setRoundTime(playersList[0].time);
      setRoundLim(playersList[0].rounds);
      setCurrentRound(playersList[0].currentRound);
    });

    socket.on("start", () => { setCounterVisible(true); setCounter(5); });

    socket.on("drawingTurn", ({ playerId, gamerole, size, latitude, longitude, word, roundTime } : DrawingTurn) => {
      if (playerId === socket.id) {
        setGamerole(gamerole); 
        setSize(size); 
        setLatitude(latitude);
        setLongitude(longitude); 
        setSecretWord(word); 
        setRoundTime(roundTime);
      }
    });

    socket.on("guessingTurn", ({ playerId, gamerole, size, latitude, longitude, roundTime } : GuessingTurn) => {
      if (playerId === socket.id) {
        setGamerole(gamerole); 
        setSize(size); 
        setLatitude(latitude);
        setLongitude(longitude); 
        setRoundTime(roundTime);
      }
    });

    if (gameCode) socket.emit("fetchPlayers", gameCode);

    return () => {
      socket.off("playerList");
      socket.off("start");
      socket.off("drawingTurn");
      socket.off("guessingTurn");
    };
  }, [socket, gameCode]);

  const handleStartGame = () => {
    if (!socket) return;

    if (role === "host") socket.emit("startGame", gameCode, "Start");
  };

  const handleLeaveGame = () => {
    if (!socket) return;
    
    socket.emit("leaveGame", { gameCode, nickname });
    socket.on("leaveSuccess", () => {
      setCounterVisible(false);
      setCounter(null);
      router.replace("/");
    });
    socket.on("playerLeft", () => {
      setCounterVisible(false);
      setCounter(null);
    });
    return () => { socket.off("leaveSuccess"); socket.off("playerLeft"); };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F2ED" />

      {/* Game code bar */}
      <View style={styles.codeBar}>
        <FontAwesome6 name="users" size={28} color="#515050" />
        <Text style={styles.codeText}>{gameCode}</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Leaderboard header */}
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>LEADERBOARD</Text>
        <Text style={styles.leaderboardTitle}>{currentRound}/{roundLim}</Text>
      </View>

      {/* Leaderboard */}
      <View style={styles.leaderboard}>
        {players.map((player, index) => (
          <View key={index} style={styles.leaderboardEntry}>
            <Text style={styles.leaderboardName}>{player.nickname}</Text>
            <Text style={styles.leaderboardDash}>-</Text>
            <Text style={styles.leaderboardScore}>{player.score}p</Text>
          </View>
        ))}
      </View>

      {isCounterVisible && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdown}>
            {counter !== null && counter > 0 ? counter : "Starting!"}
          </Text>
        </View>
      )}

      {/* Buttons */}
      <View style={[styles.buttons, { marginBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGame}>
          <Text style={styles.buttonText}>LEAVE</Text>
        </TouchableOpacity>
        {role === "host" && roundLim != currentRound && (
          <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
            <Text style={styles.buttonText}>START</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info button */}
      {!isCounterVisible && (
        <TouchableOpacity style={[styles.infoButton, { bottom: insets.bottom + 8 }]} onPress={() => setPopupVisible(true)}>
          <FontAwesome6 name="circle-info" size={44} color="#515050" />
        </TouchableOpacity>
      )}

      {isPopupVisible && (
        <Popup
          title="Lobby"
          info={`This is the lobby room\n\nHere you will see all players that have joined the game.\n\nAfter played game each player score can be viewed in the leaderboard.`}
          onClose={() => setPopupVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F1F2ED",
    paddingTop: height * 0.06,
    paddingBottom: 24,
  },
  codeBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "70%",
    height: 56,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#3487EA",
    backgroundColor: "#FFFFFF",
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 32,
    color: "#E96FA6",
    fontFamily: "LuckiestGuy",
  },
  leaderboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    paddingVertical: 12,
  },
  leaderboardTitle: {
    fontFamily: "LuckiestGuy",
    fontSize: 36,
    color: "#EA9734",
  },
  leaderboard: {
    width: "95%",
    flex: 1,
    maxHeight: height * 0.55,
    padding: 16,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#EA9734",
    backgroundColor: "#FAF7FF",
    gap: 4,
  },
  leaderboardEntry: {
    flexDirection: "row",
    alignItems: "center",
  },
  leaderboardName: {
    flex: 1,
    fontSize: 24,
    fontFamily: "LuckiestGuy",
    color: "#515050",
  },
  leaderboardDash: {
    width: 30,
    textAlign: "center",
    fontSize: 24,
    fontFamily: "LuckiestGuy",
    color: "#515050",
  },
  leaderboardScore: {
    flex: 1,
    textAlign: "right",
    fontSize: 24,
    fontFamily: "LuckiestGuy",
    color: "#515050",
  },
  buttons: {
    flexDirection: "row",
    gap: 16,
    marginTop: 24,
  },
  leaveButton: {
    width: 145,
    height: 58,
    backgroundColor: "#F25959",
    borderRadius: 10,
    justifyContent: "center",
  },
  startButton: {
    width: 145,
    height: 58,
    backgroundColor: "#3487EA",
    borderRadius: 10,
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    color: "#FAF7FF",
    fontSize: 24,
    fontFamily: "LuckiestGuy",
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 242, 237, 0.85)',
    zIndex: 100,
  },
  countdown: {
    color: "#515050",
    fontSize: 80,
    fontFamily: "LuckiestGuy",
  },
  infoButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    zIndex: 1000,
  },
});