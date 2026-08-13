import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';

interface StopCardProps {
  title: string;
  type: string;
  duration?: string;
  drag: () => void;
  isActive: boolean;
}

export default function StopCard({ title, type, duration, drag, isActive }: StopCardProps) {
  return (
    <TouchableOpacity
      onLongPress={drag}
      activeOpacity={0.8}
      style={[
        styles.card,
        isActive && styles.cardActive, // Highlight when dragging
      ]}
    >
      <View style={styles.dragHandle}>
        <View style={styles.dragLine} />
        <View style={styles.dragLine} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{type} • {duration || 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.glassBackground,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    alignItems: 'center',
    // Hiệu ứng Glassmorphism blur (tùy thuộc vào OS, có thể dùng Expo BlurView sau)
  },
  cardActive: {
    backgroundColor: 'rgba(50, 50, 50, 0.9)', // Sáng hơn khi nhấc lên
    transform: [{ scale: 1.02 }],
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    paddingRight: 16,
    justifyContent: 'center',
    gap: 4,
  },
  dragLine: {
    width: 20,
    height: 3,
    backgroundColor: colors.textSecondary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
});
