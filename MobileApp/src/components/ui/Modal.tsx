import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalProps } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '@/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  const { colors } = useTheme();

  const overlayStyle: ViewStyle = {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  };

  const getModalStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.xl,
      maxHeight: screenHeight * 0.9,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      sm: { width: screenWidth * 0.8, maxWidth: 300 },
      md: { width: screenWidth * 0.9, maxWidth: 400 },
      lg: { width: screenWidth * 0.95, maxWidth: 500 },
      full: { width: screenWidth * 0.95, height: screenHeight * 0.9 },
    };

    return { ...baseStyle, ...sizeStyles[size] };
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };

  const titleStyle: TextStyle = {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: colors.text,
    flex: 1,
  };

  const contentStyle: ViewStyle = {
    padding: SPACING.lg,
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={overlayStyle}>
        <View style={getModalStyle()}>
          {title && (
            <View style={headerStyle}>
              <Text style={titleStyle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={{ padding: SPACING.xs }}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          
          <ScrollView
            style={contentStyle}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
};