import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { User, Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import ResponsiveContainer from '@/components/ResponsiveContainer';

export default function AuthScreen() {
  const { colors } = useTheme();
  const { signIn, signUp, forgotPassword, user, isPasswordResetFlow, completePasswordReset } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in all fields',
      });
      return;
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Missing Information',
          text2: 'Please enter your full name',
        });
        return;
      }
      if (password !== confirmPassword) {
        Toast.show({
          type: 'error',
          text1: 'Password Mismatch',
          text2: 'Passwords do not match',
        });
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        router.replace('/(tabs)');
      } else {
        await signUp(email, password, fullName);
        Toast.show({
          type: 'success',
          text1: 'Account Created',
          text2: 'Please check your email to verify your account',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: error.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async () => {
    setResetError('');
    setResetSuccess('');
    if (!resetPassword.trim() || resetPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    setResetLoading(true);
    try {
      await completePasswordReset(resetPassword);
      setResetSuccess('Password updated successfully. You can now sign in.');
      setResetPassword('');
      setResetConfirmPassword('');
    } catch (e: any) {
      setResetError(e?.message || 'Failed to update password.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotLoading(true);
    setForgotSuccess('');
    setForgotError('');
    try {
      await forgotPassword(forgotEmail);
      setForgotSuccess('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      setForgotError(error.message || 'Failed to send reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <ResponsiveContainer>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: colors.surface, shadowColor: colors.primary }]}>
                <Image 
                  source={require('../../assets/images/icon.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>RECLAIM</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Lost & Found for your school community
              </Text>
            </View>

            {/* Form */}
            <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.text }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
                {isLogin ? 'Sign in to access your dashboard' : 'Join your school community securely'}
              </Text>

              {/* Full Name (Sign Up only) */}
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInputFull, { color: colors.text }]}
                      placeholder="Enter your full name"
                      placeholderTextColor={colors.textSecondary}
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Educational Email</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                  <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInputFull, { color: colors.text }]}
                    placeholder="student@university.edu"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}> 
                  Only educational (.edu) emails are allowed
                </Text>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInputFull, { color: colors.text }]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    {showPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password (Sign Up only) */}
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm Password</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInputFull, { color: colors.text }]}
                      placeholder="Confirm your password"
                      placeholderTextColor={colors.textSecondary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </View>
              )}

              {/* Forgot Password Link (Login only) */}
              {isLogin && (
                <TouchableOpacity
                  style={styles.forgotPasswordLink}
                  onPress={() => {
                    setForgotModalVisible(true);
                    setForgotEmail(email);
                    setForgotSuccess('');
                    setForgotError('');
                  }}
                >
                  <Text style={{ color: colors.primary, fontFamily: 'Inter-SemiBold', fontSize: 14 }}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton, 
                  { backgroundColor: colors.primary, shadowColor: colors.primary }
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                  {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                </Text>
              </TouchableOpacity>

              {/* Switch Mode */}
              <View style={styles.switchContainer}>
                <Text style={[styles.switchText, { color: colors.textSecondary }]}>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </Text>
                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                  <Text style={[styles.switchAction, { color: colors.primary }]}>
                    {isLogin ? ' Sign Up' : ' Sign In'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reset Password Modal (Deep link flow) */}
            {isPasswordResetFlow && (
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Set New Password</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Enter and confirm your new password to complete the reset.</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 16 }]}> 
                    <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInputFull, { color: colors.text }]}
                      placeholder="New password"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry
                      value={resetPassword}
                      onChangeText={setResetPassword}
                    />
                  </View>
                  <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 12 }]}> 
                    <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInputFull, { color: colors.text }]}
                      placeholder="Confirm new password"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry
                      value={resetConfirmPassword}
                      onChangeText={setResetConfirmPassword}
                    />
                  </View>
                  {resetError ? (
                    <Text style={{ color: colors.error, marginTop: 12 }}>{resetError}</Text>
                  ) : null}
                  {resetSuccess ? (
                    <Text style={{ color: colors.success, marginTop: 12 }}>{resetSuccess}</Text>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary, marginTop: 24, width: '100%' }]} 
                    onPress={handleCompleteReset}
                    disabled={resetLoading}
                  >
                    <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}> 
                      {resetLoading ? 'Updating...' : 'Update Password'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Forgot Password Modal */}
            {forgotModalVisible && (
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Reset Password</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Enter your educational email to receive a password reset link.</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 16 }]}> 
                    <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInputFull, { color: colors.text }]}
                      placeholder="student@university.edu"
                      placeholderTextColor={colors.textSecondary}
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {forgotError ? (
                    <Text style={{ color: colors.error, marginTop: 12 }}>{forgotError}</Text>
                  ) : null}
                  {forgotSuccess ? (
                    <Text style={{ color: colors.success, marginTop: 12 }}>{forgotSuccess}</Text>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary, marginTop: 24, width: '100%' }]} 
                    onPress={handleForgotPassword}
                    disabled={forgotLoading}
                  >
                    <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}> 
                      {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ alignSelf: 'center', marginTop: 16, paddingVertical: 8 }}
                    onPress={() => setForgotModalVisible(false)}
                  >
                    <Text style={{ color: colors.textSecondary, fontFamily: 'Inter-Medium' }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 56,
    height: 56,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  formTitle: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInputFull: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 6,
    marginLeft: 4,
    opacity: 0.8,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  submitButton: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 28,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  switchAction: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
});