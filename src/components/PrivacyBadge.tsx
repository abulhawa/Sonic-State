/**
 * PrivacyBadge component
 * Small badge indicating privacy status
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface PrivacyBadgeProps {
  onPress?: () => void;
  showArrow?: boolean;
}

const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ onPress, showArrow = true }) => {
  const content = (
    <View style={styles.container}>
      <Text style={styles.shield}>🛡️</Text>
      <Text style={styles.text}>Nothing stored</Text>
      {showArrow && <Text style={styles.arrow}>›</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  shield: {
    fontSize: 12,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '400',
  },
});

export default PrivacyBadge;
