// guess.tsx
import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity, StatusBar, Dimensions } from "react-native";
import MapView, { Polyline, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSocket } from '../utils/socketContext';
import { GamePopup } from '../components/GamePopup';
import Chat from '../components/Chat';

const { height } = Dimensions.get("window");

type Coordinate = { 
    latitude: number; 
    longitude: number 
};

type PolylineData = { 
    path: Coordinate[]; 
    color: string; 
    width: number; 
    zindex: number 
};

export default function Guess() {
    const router = useRouter();
    const { socket } = useSocket();
    const insets = useSafeAreaInsets();

    const { gameCode, nickname, role, size, latitude, longitude, roundTime } = useLocalSearchParams();

    const mapLat = Number(latitude);
    const mapLon = Number(longitude);

    const [timer, setTimer] = useState(Number(roundTime));
    const [paths, setPaths] = useState<PolylineData[]>([]);
    const [currentLine, setCurrentLine] = useState<PolylineData>();
    const [region] = useState<Region>({ latitude: mapLat, longitude: mapLon, latitudeDelta: Number(size), longitudeDelta: Number(size) });
    const [guess, setGuess] = useState("");
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");

    useEffect(() => {
        const interval = setInterval(() => setTimer(prev => (prev > 0 ? prev - 1 : 0)), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleDrawing = (data: PolylineData[]) => setPaths(data);

        const handleCurrentLine = (line: PolylineData) => setCurrentLine(line);

        const handleEndGame = ({ message }: { message: string }) => { 
            setPopupMessage(message); 
            setPopupVisible(true); 
        };

        socket.on('draw', handleDrawing);
        socket.on('currentLine', handleCurrentLine);
        socket.on('endGame', handleEndGame);

        return () => {
            socket.off('draw', handleDrawing);
            socket.off('currentLine', handleCurrentLine);
            socket.off('endGame', handleEndGame);
        };
    }, [socket]);

    const handleGuess = () => {
        if (guess.trim() === "") return;
        socket.emit("message", { gameCode, nickname, message: guess });
        setGuess("");
    };

    const closePopup = () => {
        setPopupVisible(false);
        router.replace({ pathname: '/lobby', params: { gameCode, nickname, role } });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#C5EB9F" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>GUESS THE WORD</Text>
                <View style={styles.timerBox}>
                    <Text style={styles.timerText}>{timer}</Text>
                </View>
            </View>

            <Chat gameCode={gameCode} />

            {/* Karta */}
            <View style={styles.mapWrapper}>
                <MapView style={styles.map} region={region} scrollEnabled zoomEnabled rotateEnabled={false} pitchEnabled={false} mapType="none">
                    {currentLine && (
                        <Polyline coordinates={currentLine.path} strokeColor={currentLine.color} strokeWidth={currentLine.width} zIndex={currentLine.zindex + 1} />
                    )}
                    {paths.map((line, i) => (
                        <Polyline key={i} coordinates={line.path} strokeColor={line.color} strokeWidth={line.width} zIndex={line.zindex} />
                    ))}
                </MapView>
            </View>


            {/* Input */}
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    value={guess}
                    onChangeText={setGuess}
                    placeholder="Your guess"
                />
            </View>

            {/* Gissa knapp */}
            <TouchableOpacity style={styles.guessButton} onPress={handleGuess}>
                <Text style={styles.guessButtonText}>GUESS</Text>
            </TouchableOpacity>

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Back to Lobby */}
            <TouchableOpacity
                style={[styles.backButton, { marginBottom: insets.bottom + 8 }]}
                onPress={() => router.replace({ pathname: '/lobby', params: { gameCode, nickname, role } })}
            >
                <Text style={styles.backButtonText}>TO LOBBY</Text>
            </TouchableOpacity>

            {popupVisible && <GamePopup message={popupMessage} onClose={closePopup} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F2ED' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: height * 0.14,
        backgroundColor: '#C5EB9F',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    headerText: { color: '#515050', fontSize: 28, fontFamily: 'LuckiestGuy' },
    timerBox: { width: 70, height: 48, backgroundColor: '#FAF7FF', borderRadius: 10, justifyContent: 'center' },
    timerText: { textAlign: 'center', fontSize: 20, fontFamily: 'LuckiestGuy', color: '#515050' },
    mapWrapper: { width: '100%', aspectRatio: 1 },
    map: { flex: 1, backgroundColor: 'white' },
    inputRow: {
        paddingHorizontal: 24,
        paddingBottom: 12,
        marginTop: 16,
    },
    input: {
        height: 50,
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: '#FAF7FF',
        borderColor: '#3487EA',
        borderWidth: 3,
        fontSize: 20,
        fontFamily: 'LuckiestGuy',
        color: '#515050',
    },
    guessButton: {
        alignSelf: 'center',
        width: '80%',
        height: 48,
        backgroundColor: '#3487EA',
        borderRadius: 10,
        justifyContent: 'center',
        marginBottom: 12,
    },
    guessButtonText: {
        textAlign: 'center',
        color: '#FAF7FF',
        fontSize: 20,
        fontFamily: 'LuckiestGuy'
    },
    backButton: {
        alignSelf: 'center',
        width: '80%',
        height: 48,
        backgroundColor: '#EA9734',
        borderRadius: 10,
        justifyContent: 'center',
        marginTop: 12,
    },
    backButtonText: { textAlign: 'center', color: '#FAF7FF', fontSize: 20, fontFamily: 'LuckiestGuy' },
});