import React from 'react';
import { View, ActivityIndicator, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONT_SIZE } from '@/constants';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  color?: string;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  text,
  color,
  style,
}) => {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    ...style,
  };

  const textStyle: TextStyle = {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: colors.textSecondary,
    textAlign: 'center',
  };

  return (
    <View style={containerStyle}>
      <ActivityIndicator
        size={size}
        color={color || colors.primary}
      />
      {text && <Text style={textStyle}>{text}</Text>}
    </View>
  );
};