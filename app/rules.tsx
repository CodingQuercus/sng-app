import React from "react";
import { Text, View, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get("window");

export default function Rules() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#C5EB9F" />

      <View style={styles.header}>
        <Text style={styles.headerText}>RULES</Text>
      </View>

      <View style={styles.rulesContainer}>
        <Text style={styles.rulesText}>
          Sketch'N'Guess is a guessing game that combines your movement and painting abilities!
        </Text>
        <Text style={styles.rulesText}>
          One player draws a randomly chosen word by physically moving outside — their GPS route becomes the drawing. Everyone else tries to guess the word before time runs out.
        </Text>
        <Text style={styles.rulesText}>
          Pick your canvas size based on how active you want to be. Running? Go large. Walking? Keep it small.
        </Text>
        <Text style={styles.rulesText}>
          The player who guesses correctly gets points, and so does the drawer. Most points after all rounds wins!
        </Text>
      </View>

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        style={[styles.backButton, { marginBottom: insets.bottom + 8 }]}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>BACK</Text>
      </TouchableOpacity>
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
    backgroundColor: "#C5EB9F",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 12,
  },
  headerText: {
    color: "#515050",
    fontFamily: "LuckiestGuy",
    fontSize: 50,
  },
  rulesContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 20,
  },
  rulesText: {
    color: "#282828",
    fontFamily: "OpenSans-Regular",
    fontSize: 18,
    lineHeight: 28,
  },
  backButton: {
    alignSelf: "center",
    width: 145,
    height: 58,
    backgroundColor: "#EA9734",
    borderRadius: 10,
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    color: "#FAF7FF",
    fontSize: 24,
    fontFamily: "LuckiestGuy",
  },
});