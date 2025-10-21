import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Avatar } from 'react-native-paper';
import colors from '../constants/colors';

export default function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, [dot1, dot2, dot3]);

  const translateY1 = dot1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const translateY2 = dot2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const translateY3 = dot3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={styles.container}>
      <Avatar.Icon
        size={36}
        icon="robot"
        style={styles.avatar}
        color={colors.white}
      />
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, { transform: [{ translateY: translateY1 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: translateY2 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: translateY3 }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  avatar: {
    backgroundColor: colors.secondary,
    marginRight: 8,
  },
  bubble: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
});
