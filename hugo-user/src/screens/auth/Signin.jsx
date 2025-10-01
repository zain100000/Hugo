/**
 * Signin Screen for Hugo App
 *
 * Provides user authentication with email and password.
 * Includes validation, animations, error handling, and integration with Redux for login.
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
import Feather from 'react-native-vector-icons/Feather';
import Button from '../../utils/customComponents/customButton/Button';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {
  isValidInput,
  validatePassword,
  validateEmail,
} from '../../utils/customValidations/Validations';
import Toast from 'react-native-toast-message';
import {loginUser} from '../../redux/slices/authSlice';

const {width, height} = Dimensions.get('screen');

const Signin = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const statusBarColor = theme.colors.tertiary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  useEffect(() => {
    const hasErrors = emailError || passwordError || !email || !password;
    setIsButtonEnabled(!hasErrors);
  }, [emailError, passwordError, email, password]);

  const handleEmailChange = value => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = value => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleSignin = async () => {
    if (!isValidInput(email, password)) return;

    setLoading(true);

    try {
      const resultAction = await dispatch(loginUser({email, password}));

      if (loginUser.fulfilled.match(resultAction)) {
        const {message} = resultAction.payload;

        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: message || 'Welcome back!',
        });

        setEmail('');
        setPassword('');

        // setTimeout(() => {
        //   navigation.replace('Main');
        // }, 2000);
      } else {
        const errorMessage =
          resultAction.payload?.message ||
          resultAction.payload?.backendMessage ||
          'Login failed. Please try again.';

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
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.description}>
            Welcome back! Enter your email and password to continue your journey
            with Hugo.
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
                <Feather
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
            animation="fadeInRight"
            duration={800}
            delay={700}
            style={styles.inputContainer}>
            <InputField
              placeholder="Password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={hidePassword}
              leftIcon={
                <Feather
                  name="lock"
                  size={width * 0.044}
                  color={theme.colors.primary}
                />
              }
              rightIcon={
                <Feather
                  name={hidePassword ? 'eye-off' : 'eye'}
                  size={width * 0.054}
                  color={theme.colors.primary}
                />
              }
              onRightIconPress={() => setHidePassword(!hidePassword)}
            />
            {passwordError && (
              <Text style={globalStyles.textError}>{passwordError}</Text>
            )}
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={1100}
            style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Forgot_Password')}
              activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={900}
            style={styles.btnContainer}>
            <Button
              title="SIGN IN"
              onPress={handleSignin}
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
            delay={1100}
            style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.9}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signin;

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
  },

  forgotPasswordContainer: {
    alignItems: 'flex-end',
  },

  forgotPasswordText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.medium,
    color: theme.colors.primary,
  },

  btnContainer: {
    marginTop: height * 0.02,
    marginBottom: height * 0.02,
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: height * 0.02,
  },

  signupText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.regular,
    textAlign: 'justify',
    color: theme.colors.dark,
    top: height * 0.008,
  },

  signupLink: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.montserrat.bold,
    textAlign: 'justify',
    color: theme.colors.primary,
  },
});
