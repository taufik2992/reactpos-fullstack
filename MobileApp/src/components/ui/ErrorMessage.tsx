import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '@/constants';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  style,
}) => {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
    ...style,
  };

  const iconStyle: ViewStyle = {
    marginBottom: SPACING.md,
  };

  const messageStyle: TextStyle = {
    fontSize: FONT_SIZE.base,
    color: colors.text,
    textAlign: 'center',
    marginBottom: onRetry ? SPACING.md : 0,
  };

  const retryButtonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  };

  const retryTextStyle: TextStyle = {
    color: '#ffffff',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    marginLeft: SPACING.xs,
  };

  return (
    <View style={containerStyle}>
      <View style={iconStyle}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
      </View>
      
      <Text style={messageStyle}>{message}</Text>
      
      {onRetry && (
        <TouchableOpacity style={retryButtonStyle} onPress={onRetry}>
          <Ionicons name="refresh" size={16} color="#ffffff" />
          <Text style={retryTextStyle}>Coba Lagi</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};