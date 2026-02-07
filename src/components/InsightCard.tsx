/**
 * InsightCard component
 * Displays a single insight with appropriate styling
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface InsightCardProps {
  insight: string;
  category: 'warning' | 'positive' | 'neutral';
}

const getCategoryStyles = (category: 'warning' | 'positive' | 'neutral') => {
  switch (category) {
    case 'warning':
      return {
        backgroundColor: '#451A03',
        borderColor: '#B45309',
        icon: '⚠️',
      };
    case 'positive':
      return {
        backgroundColor: '#064E3B',
        borderColor: '#10B981',
        icon: '✓',
      };
    case 'neutral':
    default:
      return {
        backgroundColor: '#1E3A5F',
        borderColor: '#3B82F6',
        icon: '•',
      };
  }
};

const InsightCard: React.FC<InsightCardProps> = ({ insight, category }) => {
  const styles = getCategoryStyles(category);

  return (
    <View style={[localStyles.container, {
      backgroundColor: styles.backgroundColor,
      borderColor: styles.borderColor,
    }]}>
      <Text style={[localStyles.icon, { color: styles.borderColor }]}>
        {styles.icon}
      </Text>
      <Text style={localStyles.text}>{insight}</Text>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
    width: '100%',
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    fontSize: 15,
    color: '#E5E7EB',
    lineHeight: 22,
  },
});

export default InsightCard;
