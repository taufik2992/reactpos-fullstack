import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { CardProps } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, BORDER_RADIUS } from '@/constants';

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onPress,
  shadow = true,
}) => {
  const { colors } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...(shadow && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.8}
        className={className}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} className={className}>
      {children}
    </View>
  );
};