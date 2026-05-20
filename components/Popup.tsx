import React, { useRef, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Animated, ScrollView, Dimensions } from "react-native";

const { height, width } = Dimensions.get("window");

type PopupProps = {
  title: string;
  info: string;
  onClose: () => void;
}

export function Popup({ title, info, onClose }: PopupProps) {
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnimation, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnimation, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnimation, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnimation, { toValue: 0.8, friction: 5, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.popup, { opacity: fadeAnimation, transform: [{ scale: scaleAnimation }] }]}>
        <Text style={styles.title}>{title}</Text>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.info}>{info}</Text>
        </ScrollView>
        <TouchableOpacity style={styles.button} onPress={handleClose}>
          <Text style={styles.buttonText}>GOT IT</Text>
        </TouchableOpacity>
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
    zIndex: 1000,
  },
  popup: {
    width: "85%",
    maxHeight: height * 0.7,
    backgroundColor: "#C5EB9F",
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  title: {
    textAlign: "center",
    fontFamily: "LuckiestGuy",
    fontSize: 30,
    color: "#EA9734",
  },
  scroll: {
    flexGrow: 0,
    maxHeight: height * 0.4,
},
  info: {
    fontFamily: "OpenSans-Regular",
    fontSize: 16,
    color: "#515050",
    lineHeight: 26,
  },
  button: {
    alignSelf: "center",
    width: 150,
    height: 58,
    backgroundColor: "#FAF7FF",
    borderColor: "#EA9734",
    borderWidth: 3,
    borderRadius: 10,
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    fontFamily: "LuckiestGuy",
    fontSize: 20,
    color: "#EA9734",
  },
});