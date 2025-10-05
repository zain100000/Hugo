/**
 * Main Application Navigator
 * Handles stack navigation flow and status bar configuration
 * Groups routes by module for better readability
 *
 * @returns {JSX.Element} The main navigator component
 */

import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {theme} from '../styles/theme';

// Shared Screens
import Splash from '../screens/shared/Splash';
import OnBoarding from '../screens/shared/OnBoarding';

// Auth Screens
import Signin from '../screens/auth/Signin';
import Signup from '../screens/auth/Signup';
import ForgotPassword from '../screens/auth/ForgotPassword';

// Main Navigator
import BottomNavigator from './bottomNavigator/Bottom.navigator';

// Profile Module Screens
import PrivacyPolicy from '../screens/profileModule/profileSubScreens/PrivacyPolicy';
import AppUsage from '../screens/profileModule/profileSubScreens/AppUsage';
import EditProfile from '../screens/profileModule/profileSubScreens/EditProfile';
import MediaGallery from '../screens/profileModule/profileSubScreens/MediaGallery';

// Coin & Transaction Screens
import CoinPackages from '../screens/coinPackages/Packages';
import Transaction from '../screens/transactions/Transaction';

// User Detail Screens
import UserDetails from '../screens/homeModule/DetailScreen/UserDetails';
import Message from '../screens/chatModule/Message';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [statusBarColor, setStatusBarColor] = useState(theme.colors.primary);

  return (
    <>
      <StatusBar backgroundColor={statusBarColor} barStyle="light-content" />

      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{headerShown: false}}>
        {/* ──────────────── Shared Routes ──────────────── */}
        <Stack.Screen name="Splash">
          {props => <Splash {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="OnBoard">
          {props => (
            <OnBoarding {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* ──────────────── Authentication Routes ──────────────── */}
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

        {/* ──────────────── Main Application (Bottom Tabs) ──────────────── */}
        <Stack.Screen name="Main">
          {props => (
            <BottomNavigator {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* ──────────────── Profile Module Routes ──────────────── */}
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

        {/* ──────────────── Coin & Transaction Routes ──────────────── */}
        <Stack.Screen name="Coin_Packages">
          {props => (
            <CoinPackages {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Transaction">
          {props => (
            <Transaction {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* ──────────────── User Detail Routes  ──────────────── */}
        <Stack.Screen name="User_Details">
          {props => (
            <UserDetails {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

         {/* ──────────────── Chat Routes  ──────────────── */}
        <Stack.Screen name="Message">
          {props => (
            <Message {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
