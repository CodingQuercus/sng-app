import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSocket } from '../utils/socketContext';

const { height } = Dimensions.get('window');

type Message = {
    id: string;
    nickname: string;
    message: string;
    gameCode: string;
};

const Chat = ({ gameCode } : {gameCode: string | string[]}) => {
    const code = Array.isArray(gameCode) ? gameCode[0] : gameCode;
    const { socket } = useSocket();
    const [messages, setMessages] = useState<(Message & { fadeAnim: Animated.Value })[]>([]);

    const addMessage = (messageData: Message) => {
        if (messageData.gameCode !== code) return;

        const id = Math.random().toString(36).substring(2, 9);

        const fadeAnim = new Animated.Value(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start(() => {
            setTimeout(() => {
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
                    setMessages(prev => prev.filter(msg => msg.id !== id));
                });
            }, 3000);
        });
        setMessages(prev => [...prev, { ...messageData, id, fadeAnim }]);
    };

    useEffect(() => {
        if (!socket) return;
        socket.on('message', addMessage);
        return () => { socket.off('message', addMessage); };
    }, [socket]);

    return (
        <View style={styles.chatContainer}>
            {messages.map((msg, index) => (
                <Animated.View key={index} style={[styles.messageContainer, { opacity: msg.fadeAnim }]}>
                    <Text style={styles.message}>
                        <Text style={styles.nickname}>{msg.nickname}: </Text>
                        {msg.message}
                    </Text>
                </Animated.View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    chatContainer: {
        position: 'absolute',
        top: height * 0.15,
        left: 10,
        zIndex: 1000,
        padding: 10,
        borderRadius: 10,
    },
    messageContainer: {
        marginVertical: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 10,
        borderRadius: 10,
    },
    message: {
        fontSize: 16,
        fontFamily: 'OpenSans-Regular',
        color: '#282828',
    },
    nickname: {
        fontFamily: 'LuckiestGuy',
        fontSize: 16,
    },
});

export default Chat;