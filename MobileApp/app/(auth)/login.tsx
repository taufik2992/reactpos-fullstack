import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LoginRequest } from '@/types';
import { SPACING, FONT_SIZE, FONT_WEIGHT, VALIDATION_RULES } from '@/constants';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const { login, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      await login(data as LoginRequest);
      router.replace('/(tabs)/dashboard');
    } catch (err) {
      Alert.alert(
        'Login Gagal',
        error || 'Terjadi kesalahan saat login. Silakan coba lagi.',
        [{ text: 'OK' }]
      );
    }
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const scrollViewStyle: ViewStyle = {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  };

  const headerStyle: ViewStyle = {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  };

  const logoStyle: ViewStyle = {
    width: 80,
    height: 80,
    backgroundColor: colors.primary,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  };

  const titleStyle: TextStyle = {
    fontSize: FONT_SIZE['3xl'],
    fontWeight: FONT_WEIGHT.bold,
    color: colors.text,
    marginBottom: SPACING.sm,
  };

  const subtitleStyle: TextStyle = {
    fontSize: FONT_SIZE.base,
    color: colors.textSecondary,
    textAlign: 'center',
  };

  const formStyle: ViewStyle = {
    marginBottom: SPACING.xl,
  };

  const demoCredentialsStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.border,
  };

  const demoTitleStyle: TextStyle = {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: colors.text,
    marginBottom: SPACING.sm,
  };

  const demoTextStyle: TextStyle = {
    fontSize: FONT_SIZE.xs,
    color: colors.textSecondary,
    lineHeight: FONT_SIZE.xs * 1.4,
  };

  if (isLoading) {
    return <LoadingSpinner text="Sedang masuk..." />;
  }

  return (
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={scrollViewStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={headerStyle}>
            <View style={logoStyle}>
              <Ionicons name="cafe" size={40} color="#ffffff" />
            </View>
            <Text style={titleStyle}>RestaurantPOS</Text>
            <Text style={subtitleStyle}>
              Masuk ke akun Anda untuk melanjutkan
            </Text>
          </View>

          <Card>
            <View style={formStyle}>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email wajib diisi',
                  pattern: {
                    value: VALIDATION_RULES.EMAIL_REGEX,
                    message: 'Format email tidak valid',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="Masukkan email Anda"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    error={errors.email?.message}
                    required
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'Password wajib diisi',
                  minLength: {
                    value: VALIDATION_RULES.PASSWORD_MIN_LENGTH,
                    message: `Password minimal ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} karakter`,
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Masukkan password Anda"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPassword}
                    error={errors.password?.message}
                    required
                  />
                )}
              />

              <Button
                title="Masuk"
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid}
                loading={isLoading}
                size="lg"
              />
            </View>

            <View style={demoCredentialsStyle}>
              <Text style={demoTitleStyle}>Demo Credentials:</Text>
              <Text style={demoTextStyle}>
                <Text style={{ fontWeight: FONT_WEIGHT.semibold }}>Admin:</Text>{' '}
                admin@coffee.com / password123
              </Text>
              <Text style={demoTextStyle}>
                <Text style={{ fontWeight: FONT_WEIGHT.semibold }}>Kasir:</Text>{' '}
                cashier1@coffee.com / password123
              </Text>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}