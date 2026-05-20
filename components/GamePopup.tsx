import React, { useState, useRef, useEffect } from "react";
import { Text, View, StyleSheet, Animated } from "react-native";

type PopupProps = {
    message: string;
    onClose: () => void;
}

export function GamePopup({ message, onClose }: PopupProps) {
    const fadeAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnimation, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        const timeout = setTimeout(() => {
            Animated.timing(fadeAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => onClose());
        }, 5000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <Animated.View style={[styles.overlay, { opacity: fadeAnimation }]}>
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(241, 242, 237, 0.92)",
        zIndex: 1000,
        padding: 40,
    },
    message: {
        textAlign: "center",
        fontFamily: "LuckiestGuy",
        fontSize: 30,
        color: "#EA9734",
    },
});