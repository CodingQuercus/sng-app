import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { SocketProvider } from "../utils/socketContext";
import React, { useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'LuckiestGuy': require('../assets/fonts/LuckiestGuy-Regular.ttf'),
    'OpenSans-Regular': require('../assets/fonts/OpenSans-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100);
    }
  }, [fontsLoaded]);
  if (!fontsLoaded) return null;

  return (
    <SocketProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="rules" />
        <Stack.Screen name="create" />
        <Stack.Screen name="create2" />
        <Stack.Screen name="join" />
        <Stack.Screen name="lobby" />
        <Stack.Screen name="draw" />
        <Stack.Screen name="scoreboard" />
        <Stack.Screen name="guess" />
      </Stack>
    </SocketProvider>
  );
}