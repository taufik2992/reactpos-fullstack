import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONT_SIZE, FONT_WEIGHT } from '@/constants';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  style,
}) => {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    ...style,
  };

  const iconStyle: ViewStyle = {
    marginBottom: SPACING.lg,
    opacity: 0.6,
  };

  const titleStyle: TextStyle = {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: description ? SPACING.sm : SPACING.lg,
  };

  const descriptionStyle: TextStyle = {
    fontSize: FONT_SIZE.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZE.base * 1.5,
    marginBottom: action ? SPACING.lg : 0,
  };

  return (
    <View style={containerStyle}>
      <View style={iconStyle}>
        <Ionicons name={icon} size={64} color={colors.textSecondary} />
      </View>
      
      <Text style={titleStyle}>{title}</Text>
      
      {description && (
        <Text style={descriptionStyle}>{description}</Text>
      )}
      
      {action}
    </View>
  );
};