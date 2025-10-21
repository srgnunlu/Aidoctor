import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle, G } from 'react-native-svg';
import colors from '../constants/colors';

export default function RiskScoreGauge({ score = 0, size = 160 }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getRiskColor = () => {
    if (progress >= 75) return colors.error;
    if (progress >= 50) return colors.warning;
    if (progress >= 25) return '#FFA726';
    return colors.success;
  };

  const getRiskLevel = () => {
    if (progress >= 75) return 'KRİTİK';
    if (progress >= 50) return 'YÜKSEK';
    if (progress >= 25) return 'ORTA';
    return 'DÜŞÜK';
  };

  const riskColor = getRiskColor();
  const riskLevel = getRiskLevel();

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.lightGray}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={riskColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
      
      <View style={styles.textContainer}>
        <Text variant="displaySmall" style={[styles.scoreText, { color: riskColor }]}>
          {Math.round(progress)}
        </Text>
        <Text variant="bodySmall" style={styles.scoreLabel}>/ 100</Text>
        <Text variant="labelMedium" style={[styles.riskLabel, { color: riskColor }]}>
          {riskLevel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotateY: '180deg' }],
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontWeight: 'bold',
    fontSize: 48,
  },
  scoreLabel: {
    color: colors.gray,
    marginTop: -8,
  },
  riskLabel: {
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 1,
  },
});
