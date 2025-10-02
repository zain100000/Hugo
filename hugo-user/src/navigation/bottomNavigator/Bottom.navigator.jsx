/**
 * Bottom Navigator for Hugo App
 * Provides animated tab icons with scaling and color transitions
 * Includes navigation to Home, Clubs, Messages, and Profile screens
 */

import React, {useEffect, useRef} from 'react';
import {
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Text,
  View,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {theme} from '../../styles/theme';

// Screens
import Home from '../../screens/homeModule/Home';
import Club from '../../screens/clubModule/Club';
import Chat from '../../screens/chatModule/Chat';
import Profile from '../../screens/profileModule/Profile';

const Tab = createBottomTabNavigator();
const {width, height} = Dimensions.get('screen');

const AnimatedTabIcon = ({focused, source, label}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.15 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <View style={styles.iconContainer}>
      <Animated.Image
        source={source}
        style={[
          styles.icon,
          {
            tintColor: focused ? theme.colors.primary : theme.colors.gray,
            transform: [{scale: scaleValue}],
          },
        ]}
      />
      <Text
        style={[
          styles.label,
          {color: focused ? theme.colors.primary : theme.colors.gray},
        ]}>
        {label}
      </Text>
    </View>
  );
};

const BottomNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, {...theme.elevation.depth3}],
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedTabIcon
              focused={focused}
              source={require('../../assets/navigatorIcons/home-filled.png')}
              label="Home"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Clubs"
        component={Club}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedTabIcon
              focused={focused}
              source={require('../../assets/navigatorIcons/club-filled.png')}
              label="Clubs"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Messages"
        component={Chat}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedTabIcon
              focused={focused}
              source={require('../../assets/navigatorIcons/chat-filled.png')}
              label="Messages"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedTabIcon
              focused={focused}
              source={require('../../assets/navigatorIcons/user-filled.png')}
              label="Profile"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomNavigator;

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: width * 0.04,
    right: width * 0.04,
    height: height * 0.094,
    paddingTop: height * 0.03,
    backgroundColor: theme.colors.white,
  },

  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    width: width * 0.065,
    height: width * 0.065,
    resizeMode: 'contain',
    marginBottom: height * 0.004,
  },

  label: {
    fontSize: width * 0.024,
    fontFamily: theme.typography.montserrat.semiBold,
    width: width * 0.14,
    textAlign: 'center',
  },
});
