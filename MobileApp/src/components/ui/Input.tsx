import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InputProps } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '@/constants';

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  required = false,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  className = '',
}) => {
  const { colors } = useTheme();
  const [isSecureTextVisible, setIsSecureTextVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle: ViewStyle = {
    marginBottom: SPACING.md,
  };

  const labelStyle: TextStyle = {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: colors.text,
    marginBottom: SPACING.xs,
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    borderWidth: 1,
    borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: multiline ? SPACING.md : SPACING.sm,
    minHeight: multiline ? 80 : 44,
  };

  const inputStyle: TextStyle = {
    flex: 1,
    fontSize: FONT_SIZE.base,
    color: colors.text,
    textAlignVertical: multiline ? 'top' : 'center',
    opacity: disabled ? 0.6 : 1,
  };

  const errorStyle: TextStyle = {
    fontSize: FONT_SIZE.xs,
    color: colors.error,
    marginTop: SPACING.xs,
  };

  const toggleSecureText = (): void => {
    setIsSecureTextVisible(!isSecureTextVisible);
  };

  return (
    <View style={containerStyle} className={className}>
      {label && (
        <Text style={labelStyle}>
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}
      
      <View style={inputContainerStyle}>
        <TextInput
          style={inputStyle}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isSecureTextVisible}
          keyboardType={keyboardType}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {secureTextEntry && (
          <TouchableOpacity onPress={toggleSecureText} style={{ padding: SPACING.xs }}>
            <Ionicons
              name={isSecureTextVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
};