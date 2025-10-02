/**
 * Main application navigator component
 * Handles the stack navigation and status bar configuration
 * @returns {JSX.Element} The main navigator component
 */
import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Theme
import {theme} from '../styles/theme';

// Shared Screens
import Splash from '../screens/shared/Splash';
import OnBoarding from '../screens/shared/OnBoarding';

// Auth Screens
import Signin from '../screens/auth/Signin';
import Signup from '../screens/auth/Signup';
import ForgotPassword from '../screens/auth/ForgotPassword';

// Main Imports
import BottomNavigator from './bottomNavigator/Bottom.navigator';

// Profile Sub Screens Imports
import PrivacyPolicy from '../screens/profileModule/profileSubScreens/PrivacyPolicy';
import AppUsage from '../screens/profileModule/profileSubScreens/AppUsage';
import EditProfile from '../screens/profileModule/profileSubScreens/EditProfile';
import MediaGallery from '../screens/profileModule/profileSubScreens/MediaGallery';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [statusBarColor, setStatusBarColor] = useState(theme.colors.primary);

  return (
    <>
      <StatusBar backgroundColor={statusBarColor} barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName="Splash">
        {/* Shared Routes */}
        <Stack.Screen name="Splash">
          {props => <Splash {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="OnBoard">
          {props => (
            <OnBoarding {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* Auth Routes */}
        <Stack.Screen name="Signin">
          {props => <Signin {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Signup">
          {props => <Signup {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Forgot_Password">
          {props => (
            <ForgotPassword {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* Main Routes */}
        <Stack.Screen name="Main">
          {props => (
            <BottomNavigator {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* Profile Sub Screens Routes */}
        <Stack.Screen name="Privacy_Policy">
          {props => (
            <PrivacyPolicy {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>
        <Stack.Screen name="App_Usage">
          {props => (
            <AppUsage {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Edit_Profile">
          {props => (
            <EditProfile {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Media_Gallery">
          {props => (
            <MediaGallery {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
