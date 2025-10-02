/**
 * Signup Screen for Hugo App
 *
 * Multi-step registration form with profile picture, personal details split across multiple steps.
 * Final step directly allows signup (no review screen).
 * Features validation, image upload, Redux integration, and smooth animations.
 * Uses only MaterialCommunityIcons for all icons.
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Dimensions,
  Text,
  Animated,
  Easing,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import AuthHeader from '../../utils/customComponents/customHeader/AuthHeader';
import {
  validateUserName,
  validateEmail,
  validatePassword,
  validateGender,
  isValidInput,
} from '../../utils/customValidations/Validations';
import InputField from '../../utils/customComponents/customInputField/InputField';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../../utils/customComponents/customButton/Button';
import * as Animatable from 'react-native-animatable';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {registerUser} from '../../redux/slices/auth.slice';
import ImageUploadModal from '../../utils/customModals/ImageUploadModal';
import Logo from '../../assets/splashScreen/splash-logo.png';

const {width, height} = Dimensions.get('screen');

const Signup = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [currentStep, setCurrentStep] = useState(1);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  const [photoURL, setPhotoURL] = useState('');
  const [newImageURL, setNewImageURL] = useState('');
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');

  const [hidePassword, setHidePassword] = useState(true);

  const [userNameError, setUserNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [genderError, setGenderError] = useState('');

  const [loading, setLoading] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const steps = ['Profile', 'Email', 'Password', 'Gender', 'Complete'];

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.tertiary);
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep / steps.length) * 100,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  useEffect(() => {
    let hasErrors = false;

    if (currentStep === 1) {
      hasErrors = userNameError || !userName || !photoURL;
    } else if (currentStep === 2) {
      hasErrors = emailError || !email;
    } else if (currentStep === 3) {
      hasErrors = passwordError || !password;
    } else if (currentStep === 4) {
      hasErrors = genderError || !gender;
    } else {
      hasErrors =
        userNameError ||
        emailError ||
        passwordError ||
        genderError ||
        !userName ||
        !email ||
        !password ||
        !gender;
    }

    setIsButtonEnabled(!hasErrors);
  }, [
    currentStep,
    userName,
    email,
    password,
    gender,
    photoURL,
    userNameError,
    emailError,
    passwordError,
    genderError,
  ]);

  const handleUserNameChange = value => {
    setUserName(value);
    setUserNameError(validateUserName(value));
  };

  const handleEmailChange = value => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = value => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleGenderChange = value => {
    setGender(value);
    setGenderError(validateGender(value));
  };

  const handleImagePress = () => setShowImageUploadModal(true);

  const handleImageUpload = url => {
    setShowImageUploadModal(false);
    setNewImageURL(url);
    setPhotoURL(url);
  };

  const handleNext = () => {
    if (currentStep === 1 && (!userName || !photoURL)) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete Profile',
        text2: 'Please add your name and profile picture',
      });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigation.goBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignup = async () => {
    if (!isValidInput({userName, email, password, gender})) return;

    const formData = new FormData();
    formData.append('userName', userName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('gender', gender);

    if (newImageURL) {
      const uriParts = newImageURL.split('/');
      const fileName = uriParts[uriParts.length - 1];
      const fileType = fileName.split('.').pop();
      formData.append('profilePicture', {
        uri: newImageURL,
        name: fileName,
        type: `image/${fileType}`,
      });
    }

    setLoading(true);
    try {
      const resultAction = await dispatch(registerUser(formData));

      if (registerUser.fulfilled.match(resultAction)) {
        const {message} = resultAction.payload;
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: message || 'Registration successful.',
        });
        setTimeout(() => navigation.replace('Signin'), 2000);
      } else {
        const errorMessage =
          resultAction.payload?.message ||
          resultAction.payload?.backendMessage ||
          'Signup failed. Please try again.';
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

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <View style={styles.stepTrack}>
        <Animated.View
          style={[
            styles.stepProgress,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      </View>
      {steps.map((step, index) => (
        <Animatable.View
          key={index}
          animation="zoomIn"
          duration={800}
          delay={index * 100}
          style={[
            styles.stepCircle,
            {
              backgroundColor:
                index + 1 <= currentStep ? theme.colors.primary : '#f0f0f0',
              borderColor: theme.colors.primary,
            },
          ]}>
          <Text
            style={[
              styles.stepText,
              {
                color:
                  index + 1 <= currentStep
                    ? theme.colors.white
                    : theme.colors.dark,
              },
            ]}>
            {index + 1}
          </Text>
        </Animatable.View>
      ))}
    </View>
  );

  const renderStepLabels = () => (
    <View style={styles.stepLabelsContainer}>
      {steps.map((step, index) => (
        <Animatable.View
          key={index}
          animation="fadeIn"
          duration={800}
          delay={index * 100}
          style={styles.stepLabel}>
          <Text
            style={[
              styles.stepLabelText,
              {
                color:
                  index + 1 <= currentStep
                    ? theme.colors.primary
                    : theme.colors.gray,
                fontFamily:
                  index + 1 === currentStep
                    ? theme.typography.montserrat.semiBold
                    : theme.typography.montserrat.regular,
              },
            ]}>
            {step}
          </Text>
        </Animatable.View>
      ))}
    </View>
  );

  const renderProfileStep = () => (
    <Animatable.View
      animation="fadeInRight"
      duration={800}
      style={styles.stepContainer}>
      <Text style={[styles.title]}>Create Account</Text>
      <Text style={[styles.description]}>
        Add your profile picture and name to get started
      </Text>

      <TouchableOpacity
        style={styles.imgContainer}
        onPress={handleImagePress}
        activeOpacity={0.8}>
        {newImageURL || photoURL ? (
          <Image source={{uri: newImageURL || photoURL}} style={styles.image} />
        ) : (
          <Image
            source={require('../../assets/placeholders/default-avatar.png')}
            style={styles.image}
          />
        )}
      </TouchableOpacity>

      <Animatable.View
        animation="fadeInRight"
        duration={800}
        delay={400}
        style={styles.inputContainer}>
        <InputField
          placeholder="Full Name"
          value={userName}
          onChangeText={handleUserNameChange}
          leftIcon={
            <MaterialCommunityIcons
              name="account"
              size={width * 0.044}
              color={theme.colors.primary}
            />
          }
        />
        {userNameError && (
          <Text style={globalStyles.textError}>{userNameError}</Text>
        )}
      </Animatable.View>

      <View style={styles.btnContainer}>
        <Button
          title="NEXT"
          width={width * 0.95}
          onPress={handleNext}
          disabled={!userName || !photoURL}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
        />
      </View>
    </Animatable.View>
  );

  const renderEmailStep = () => (
    <Animatable.View
      animation="fadeInRight"
      duration={800}
      style={styles.stepContainer}>
      <Text style={[styles.title]}>Your Email</Text>
      <Text style={[styles.description]}>
        Enter a valid email address for account verification
      </Text>

      <Animatable.View
        animation="fadeInRight"
        duration={800}
        delay={400}
        style={styles.inputContainer}>
        <InputField
          placeholder="Email"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={
            <MaterialCommunityIcons
              name="email"
              size={width * 0.044}
              color={theme.colors.primary}
            />
          }
        />
        {emailError && <Text style={globalStyles.textError}>{emailError}</Text>}
      </Animatable.View>

      <View style={styles.btnContainer}>
        <Button
          title="BACK"
          width={width * 0.44}
          onPress={handleBack}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
        />
        <Button
          title="NEXT"
          width={width * 0.44}
          onPress={handleNext}
          disabled={!isButtonEnabled}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
        />
      </View>
    </Animatable.View>
  );

  const renderPasswordStep = () => (
    <Animatable.View
      animation="fadeInRight"
      duration={800}
      style={styles.stepContainer}>
      <Text style={[styles.title]}>Set Password</Text>
      <Text style={[styles.description]}>
        Create a strong password for your account
      </Text>

      <Animatable.View
        animation="fadeInRight"
        duration={800}
        delay={400}
        style={styles.inputContainer}>
        <InputField
          placeholder="Password"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry={hidePassword}
          leftIcon={
            <MaterialCommunityIcons
              name="lock"
              size={width * 0.044}
              color={theme.colors.primary}
            />
          }
          rightIcon={
            <MaterialCommunityIcons
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

      <View style={styles.btnContainer}>
        <Button
          title="BACK"
          width={width * 0.44}
          onPress={handleBack}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
        />
        <Button
          title="NEXT"
          width={width * 0.44}
          onPress={handleNext}
          disabled={!isButtonEnabled}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
        />
      </View>
    </Animatable.View>
  );

  const renderGenderStep = () => (
    <Animatable.View
      animation="fadeInRight"
      duration={800}
      style={styles.stepContainer}>
      <Text style={[styles.title]}>Select Gender</Text>
      <Text style={[styles.description]}>
        Choose your gender to personalize your experience
      </Text>

      <Animatable.View
        animation="fadeInRight"
        duration={800}
        delay={400}
        style={styles.inputContainer}>
        <InputField
          placeholder="Select Gender"
          dropdownOptions={[
            {label: 'Male', value: 'MALE'},
            {label: 'Female', value: 'FEMALE'},
          ]}
          selectedValue={gender}
          onValueChange={callback => setGender(callback())}
          leftIcon={
            <MaterialCommunityIcons
              name="gender-male-female"
              size={width * 0.044}
              color={theme.colors.primary}
            />
          }
        />
        {genderError && (
          <Text style={globalStyles.textError}>{genderError}</Text>
        )}
      </Animatable.View>

      <View style={styles.btnContainer}>
        <Button
          title="BACK"
          width={width * 0.44}
          onPress={handleBack}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
        />
        <Button
          title="SIGN UP"
          width={width * 0.44}
          onPress={handleSignup}
          loading={loading}
          disabled={!isButtonEnabled}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
        />
      </View>
    </Animatable.View>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return renderProfileStep();
      case 2:
        return renderEmailStep();
      case 3:
        return renderPasswordStep();
      case 4:
        return renderGenderStep();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[globalStyles.container, styles.primaryContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <View style={styles.headerContainer}>
        <AuthHeader logo={Logo} title={'Hugo'} />
      </View>

      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.stepProgressContainer}>
            {renderStepIndicator()}
            {renderStepLabels()}
          </View>
          {renderContent()}

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Signin')}
              activeOpacity={0.9}>
              <Text style={styles.signupLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ImageUploadModal
        visible={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        onImageUpload={handleImageUpload}
        title="Upload Profile Picture"
        description="Choose your profile picture from camera or gallery"
      />
    </KeyboardAvoidingView>
  );
};

export default Signup;

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
    paddingHorizontal: width * 0.024,
    paddingTop: height * 0.015,
    paddingBottom: height * 0.015,
    gap: theme.gap(2),
  },

  stepProgressContainer: {
    marginTop: height * 0.015,
    marginBottom: height * 0.015,
  },

  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: height * 0.01,
    width: '100%',
  },

  stepTrack: {
    position: 'absolute',
    top: '50%',
    transform: [{translateY: -height * 0.001}],
    height: height * 0.002,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: theme.borderRadius.small,
  },

  stepProgress: {
    height: height * 0.002,
    borderRadius: theme.borderRadius.small,
  },

  stepCircle: {
    width: width * 0.09,
    height: height * 0.04,
    borderRadius: theme.borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },

  stepText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  stepLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginTop: height * 0.008,
    width: '100%',
  },

  stepLabel: {
    width: width * 0.18,
  },

  stepContainer: {
    marginBottom: height * 0.04,
  },

  stepLabelText: {
    fontSize: width * 0.032,
    alignItems: 'center',
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

  imgContainer: {
    alignSelf: 'center',
  },

  image: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.15,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },

  inputContainer: {
    marginTop: height * 0.036,
    marginBottom: height * 0.036,
  },

  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: height * 0.024,
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: height * 0.02,
  },

  signupText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.regular,
    color: theme.colors.dark,
    marginRight: 5,
  },

  signupLink: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.semiBold,
    color: theme.colors.primary,
  },
});
