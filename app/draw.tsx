import React, { useState, useEffect } from "react";
import { Text, Image, View, TouchableOpacity, StyleSheet, StatusBar, Dimensions } from "react-native";
import MapView, { Circle, Polygon, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSocket } from '../utils/socketContext';
import { Region } from "react-native-maps";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GamePopup } from '../components/GamePopup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Chat from '../components/Chat';

const { height, width: screenWidth } = Dimensions.get("window");
const CTRL_SIZE = (screenWidth - 100) / 2 - 8;

type Coordinate = { latitude: number; longitude: number };
type PolylineData = { path: Coordinate[]; color: string; width: number; zindex: number };

export default function Draw() {
    const router = useRouter();
    const { socket } = useSocket();
    const insets = useSafeAreaInsets();

    const { gameCode, nickname, role, size, latitude, longitude, secretWord, roundTime } = useLocalSearchParams();
    const mapLat = Number(latitude);
    const mapLon = Number(longitude);
    let zindex = 1;

    const [gpsPos, setGpsPos] = useState<Coordinate>({ latitude: mapLat, longitude: mapLon });
    const [word, setWord] = useState<string>('');
    const [colorVisibility, setColorVisibility] = useState(false);
    const [region] = useState<Region>({
        latitude: mapLat,
        longitude: mapLon,
        latitudeDelta: Number(size),
        longitudeDelta: Number(size),
    });
    const [painting, setPainting] = useState(false);
    const [color, setColor] = useState("black");
    const [lineWidth, setLineWidth] = useState(5);
    const [path, setPath] = useState<Coordinate[]>([]);
    const [polyLines, setPolyLines] = useState<PolylineData[]>([]);
    const [timer, setTimer] = useState(Number(roundTime));
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");

    const colors = ["#FF0000", "#00FF00", "#0000FF", "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#000000", "#FFFFFF"];

    const squareCoordinates = [
        { latitude: mapLat + Number(size) / 2, longitude: mapLon - Number(size) * 1.13 },
        { latitude: mapLat + Number(size) / 2, longitude: mapLon + Number(size) * 1.13 },
        { latitude: mapLat - Number(size) / 2, longitude: mapLon + Number(size) * 1.13 },
        { latitude: mapLat - Number(size) / 2, longitude: mapLon - Number(size) * 1.13 },
    ];

    const saveLine = () => {
        if (path.length > 0) setPolyLines(prev => [...prev, { path, color, width: lineWidth, zindex }]);
        setPath([gpsPos]);
        zindex++;
    };

    const undoLine = () => {
        setPath([]);
        if (!painting) setPolyLines(prev => prev.slice(0, -1));
        setPainting(false);
    };

    const startPainting = () => { if (!painting) setPainting(true); };
    const stopPainting = () => { saveLine(); if (painting) setPainting(false); };
    const plusWidth = () => setLineWidth(w => Math.min(w + 5, 120));
    const minusWidth = () => setLineWidth(w => Math.max(w - 5, 5));
    const handleColorSelect = (c: string) => { saveLine(); setColor(c); };

    const currentLine = { path, color, width: lineWidth, zindex };

    useEffect(() => {
        let subscription: Location.LocationSubscription | undefined;
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') { alert('Permission to access location was denied'); return; }
            subscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, distanceInterval: 1, timeInterval: 1000 },
                (loc) => {
                    const coord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
                    setGpsPos(coord);
                    setPainting(isPainting => {
                        if (isPainting) setPath(prev => [...prev, coord]);
                        return isPainting;
                    });
                }
            );
        })();
        return () => subscription?.remove();
    }, [gameCode]);

    useEffect(() => { if (polyLines.length > 0) socket.emit('drawing', { gameCode, drawingData: polyLines }); }, [polyLines]);
    useEffect(() => { if (path.length > 0) socket.emit('currentLine', { gameCode, currentLine }); }, [path]);
    useEffect(() => { if (secretWord) setWord(String(secretWord)); }, [secretWord]);

    useEffect(() => {
        socket.on('endGame', ({ message } : {message: string}) => { setPopupMessage(message); setPopupVisible(true); });
        return () => { socket.off('endGame'); };
    }, [socket]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    socket.emit('timeOut', { gameCode });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const closePopup = () => {
        setPopupVisible(false);
        router.replace({ pathname: '/lobby', params: { gameCode, nickname, role } });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#C5EB9F" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>DRAW: {word}</Text>
                <View style={styles.timerBox}>
                    <Text style={styles.timerText}>{timer}</Text>
                </View>
            </View>

            <Chat gameCode={gameCode} />

            {/* Karta */}
            <View style={styles.mapWrapper}>
                <MapView style={styles.map} region={region} scrollEnabled zoomEnabled rotateEnabled={false} pitchEnabled={false} mapType="none">
                    <Circle center={gpsPos} radius={(Number(size) * 1000) * (lineWidth / 7)} strokeColor="gray" strokeWidth={2} zIndex={zindex + 2} />
                    <Polygon coordinates={squareCoordinates} zIndex={0} strokeColor="black" />
                    <Polyline coordinates={path} strokeColor={color} strokeWidth={isNaN(lineWidth) ? 5 : lineWidth} zIndex={zindex + 1} />
                    {polyLines.map((line, i) => (
                        <Polyline key={i} coordinates={line.path} strokeColor={line.color} strokeWidth={line.width} zIndex={line.zindex} />
                    ))}
                </MapView>
            </View>

            {/* Kontroller */}
            <View style={styles.controls}>
                <View style={styles.controlGrid}>

                    {/* Bestämma storlek på pensel */}
                    <View style={styles.controlButtonLineWidth}>
                        <View style={styles.lineWidthContainer}>
                            <View style={[styles.line, { height: lineWidth, backgroundColor: color }]} />
                        </View>
                        <TouchableOpacity style={styles.changeSizeContainer} onPress={() => { saveLine(); plusWidth(); }}>
                            <Text style={styles.plusMinusText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.changeSizeContainer} onPress={() => { saveLine(); minusWidth(); }}>
                            <Text style={styles.plusMinusText}>-</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Toggle för att måla */}
                    {!painting ? (
                        <TouchableOpacity style={styles.controlButton} onPress={startPainting}>
                            <Image source={require("../assets/images/stoppaint.png")} style={{ width: CTRL_SIZE * 0.7, height: CTRL_SIZE * 0.7 }} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.controlButton} onPress={stopPainting}>
                            <Image source={require("../assets/images/paint.png")} style={{ width: CTRL_SIZE * 0.7, height: CTRL_SIZE * 0.7 }} />
                        </TouchableOpacity>
                    )}

                    {/* Ångra streck */}
                    <TouchableOpacity style={styles.controlButton} onPress={undoLine}>
                        <MaterialIcons name="undo" size={CTRL_SIZE * 0.6} color="#3487EA" />
                    </TouchableOpacity>

                    {/* Val av färg */}
                    {!colorVisibility ? (
                        <TouchableOpacity style={[styles.controlButton, { backgroundColor: color }]} onPress={() => setColorVisibility(true)} />
                    ) : (
                        <View style={[styles.controlButton, styles.colorGrid]}>
                            {colors.map((c) => (
                                <TouchableOpacity key={c} style={[styles.colorBlock, { backgroundColor: c }]} onPress={() => { handleColorSelect(c); setColorVisibility(false); }} />
                            ))}
                        </View>
                    )}
                </View>

            </View>

            {/* Back to lobby knapp */}
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
    container: { flex: 1, backgroundColor: '#FDF6F0' },
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
    timerBox: { width: 76, height: 48, backgroundColor: '#FAF7FF', borderRadius: 10, justifyContent: 'center', textAlignVertical: 'center' },
    timerText: { textAlign: 'center', textAlignVertical: 'center', fontSize: 20, fontFamily: 'LuckiestGuy', color: '#515050' },
    mapWrapper: { width: '100%', height: height * 0.38 },
    map: { flex: 1, backgroundColor: 'white' },
    controls: {
        flex: 1,
        borderTopWidth: 4,
        borderTopColor: '#EA9734',
        paddingHorizontal: 6,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    controlGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    controlButton: {
        width: CTRL_SIZE,
        height: CTRL_SIZE,
        backgroundColor: '#FAF7FF',
        borderRadius: 10,
        borderWidth: 3,
        borderColor: '#3487EA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlButtonLineWidth: {
        width: CTRL_SIZE,
        height: CTRL_SIZE,
        backgroundColor: '#FAF7FF',
        borderRadius: 10,
        borderWidth: 3,
        borderColor: '#3487EA',
        flexWrap: 'wrap',
    },
    lineWidthContainer: {
        height: '100%',
        width: '58%',
        paddingLeft: 4,
        left: 0,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    line: { width: '100%', borderRadius: 4 },
    changeSizeContainer: {
        height: '50%',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    plusMinusText: {
        height: '100%',
        width: '40%',
        textAlignVertical: 'center',
        textAlign: 'center',
        color: '#FAF7FF',
        fontSize: 40,
        fontFamily: 'LuckiestGuy',
        backgroundColor: '#3487EA',
    },
    colorBlock: { width: 32, height: 32, margin: 2, borderRadius: 3 },
    colorGrid: { flexWrap: 'wrap', flexDirection: 'row', padding: 4 },
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