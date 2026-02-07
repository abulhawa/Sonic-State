/**
 * ScoreBar component
 * Visual display of a 0-100 score with label
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreBarProps {
  label: string;
  score: number;
  color?: string;
}

const getScoreColor = (score: number): string => {
  if (score < 30) return '#4ADE80'; // Green (low)
  if (score < 60) return '#FBBF24'; // Yellow (medium)
  return '#F87171'; // Red (high)
};

const ScoreBar: React.FC<ScoreBarProps> = ({ label, score, color }) => {
  const barColor = color || getScoreColor(score);
  const clampedScore = Math.max(0, Math.min(100, score));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.score, { color: barColor }]}>{Math.round(clampedScore)}</Text>
      </View>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: `${clampedScore}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
  },
  barBackground: {
    height: 12,
    backgroundColor: '#374151',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
});

export default ScoreBar;
