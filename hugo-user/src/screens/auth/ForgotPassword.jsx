/**
 * Forgot Password Screen for Hugo App
 *
 * Provides password reset functionality with email verification.
 * Includes validation, animations, error handling, and integration with Redux.
 */

import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Dimensions,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {theme} from '../../styles/theme';
import * as Animatable from 'react-native-animatable';
import {globalStyles} from '../../styles/globalStyles';
import AuthHeader from '../../utils/customComponents/customHeader/AuthHeader';
import Logo from '../../assets/splashScreen/splash-logo.png';
import InputField from '../../utils/customComponents/customInputField/InputField';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../../utils/customComponents/customButton/Button';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {
  isValidInput,
  validateEmail,
} from '../../utils/customValidations/Validations';
import Toast from 'react-native-toast-message';
import {forgotPassword} from '../../redux/slices/auth.slice'; // Assuming you have this action

const {width, height} = Dimensions.get('screen');

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const statusBarColor = theme.colors.tertiary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  useEffect(() => {
    const hasErrors = emailError || !email;
    setIsButtonEnabled(!hasErrors);
  }, [emailError, email]);

  const handleEmailChange = value => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handleResetPassword = async () => {
    if (!isValidInput(email)) return;

    setLoading(true);

    try {
      const resultAction = await dispatch(forgotPassword({email}));

      if (forgotPassword.fulfilled.match(resultAction)) {
        const {message} = resultAction.payload;

        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: message || 'Password reset link sent to your email!',
        });

        setEmail('');

        // Navigate back to signin or to verification screen
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        const errorMessage =
          resultAction.payload?.message ||
          resultAction.payload?.backendMessage ||
          'Failed to send reset link. Please try again.';

        Toast.show({
          type: 'error',
          text1: 'Failure!',
          text2: errorMessage,
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message || 'Something went wrong. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[globalStyles.container, styles.primaryContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.headerContainer}>
        <AuthHeader logo={Logo} title={'Hugo'} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <Animatable.View
          animation="fadeInUp"
          duration={1000}
          delay={300}
          style={styles.formContainer}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.description}>
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>

          <Animatable.View
            animation="fadeInRight"
            duration={800}
            delay={500}
            style={styles.inputContainer}>
            <InputField
              placeholder="Email"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <MaterialCommunityIcons
                  name="mail"
                  size={width * 0.044}
                  color={theme.colors.primary}
                />
              }
            />
            {emailError && (
              <Text style={globalStyles.textError}>{emailError}</Text>
            )}
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={700}
            style={styles.btnContainer}>
            <Button
              title="SEND RESET LINK"
              onPress={handleResetPassword}
              width={width * 0.95}
              loading={loading}
              disabled={!isButtonEnabled}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
            />
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={900}
            style={styles.backToSigninContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}>
              <Text style={styles.backToSigninText}>Back to Sign In</Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
    backgroundColor: theme.colors.tertiary,
  },

  headerContainer: {
    height: height * 0.24,
  },

  scrollContainer: {
    flexGrow: 1,
  },

  formContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    paddingTop: height * 0.04,
    paddingHorizontal: width * 0.024,
    paddingBottom: height * 0.02,
    gap: height * 0.02,
  },

  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.montserrat.semiBold,
    textAlign: 'justify',
    marginBottom: height * 0.01,
    color: theme.colors.dark,
    left: width * 0.02,
  },

  description: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.montserrat.regular,
    marginBottom: height * 0.02,
    color: theme.colors.dark,
    left: width * 0.02,
    lineHeight: theme.spacing(2.5),
  },

  inputContainer: {
    marginBottom: height * 0.015,
    marginTop: height * 0.02,
  },

  btnContainer: {
    marginTop: height * 0.04,
    marginBottom: height * 0.02,
  },

  backToSigninContainer: {
    alignItems: 'center',
    marginTop: height * 0.02,
  },

  backToSigninText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.semiBold,
    color: theme.colors.primary,
  },
});
