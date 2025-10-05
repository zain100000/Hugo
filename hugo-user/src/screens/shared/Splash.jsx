/**
 * Splash Screen for Hugo App
 *
 * This component displays an animated splash screen with a dynamic wave-like gradient rays background,
 * animated logo, and tagline with a heart icon before navigating based on authentication state.
 */

import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Image,
  Text,
  Animated,
  Easing,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import {initializeSocket} from '../../utils/customSocket/Socket.utility';
import { useDispatch } from 'react-redux';

const {width, height} = Dimensions.get('screen');

const Splash = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [animationStage, setAnimationStage] = useState(1);

  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const statusBarColor = theme.colors.tertiary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStage(2);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const token = await AsyncStorage.getItem('authToken');

        if (token) {
          initializeSocket(token);

          navigation.reset({
            index: 0,
            routes: [{name: 'Main'}],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{name: 'OnBoard'}],
          });
        }
      } catch (error) {
        console.error('Session check error:', error);
        navigation.reset({
          index: 0,
          routes: [{name: 'OnBoard'}],
        });
      }
    };

    checkSession();
  }, [navigation, dispatch]);

  useEffect(() => {
    const animateWave = (animatedVal, delay = 0) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedVal, {
            toValue: 1,
            duration: 5000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(animatedVal, {
            toValue: 0,
            duration: 5000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    animateWave(wave1);
    animateWave(wave2, 2000);
  }, [wave1, wave2]);

  const wave1Translate = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.3, width * 0.3],
  });

  const wave2Translate = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [width * 0.3, -width * 0.3],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.tertiary]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.rayOverlay,
          {transform: [{translateX: wave1Translate}, {rotate: '25deg'}]},
        ]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.rayOverlay,
          {transform: [{translateX: wave2Translate}, {rotate: '-20deg'}]},
        ]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{x: 1, y: 0}}
          end={{x: 0, y: 1}}
        />
      </Animated.View>

      <SafeAreaView style={[globalStyles.container]}>
        <View style={styles.contentContainer}>
          <Animatable.View
            animation={animationStage === 1 ? 'zoomIn' : ''}
            duration={1500}
            style={styles.iconContainer}>
            <Animatable.View
              animation={
                animationStage === 2
                  ? {
                      from: {translateY: 0, opacity: 1},
                      to: {translateY: -height * 0.02, opacity: 1},
                    }
                  : null
              }
              duration={600}
              delay={0}
              useNativeDriver={true}>
              <Image
                source={require('../../assets/splashScreen/splash-logo.png')}
                style={styles.icon}
                resizeMode="contain"
              />
            </Animatable.View>
          </Animatable.View>

          {animationStage >= 2 && (
            <Animatable.View
              style={styles.taglineContainer}
              animation={{
                from: {opacity: 0, translateY: 20},
                to: {opacity: 1, translateY: 0},
              }}
              duration={700}
              delay={300}
              useNativeDriver={true}>
              <Text style={styles.taglineText}>
                Where connection begins{' '}
                <Ionicons
                  name="heart"
                  size={width * 0.06}
                  color={theme.colors.error}
                />
              </Text>
            </Animatable.View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  rayOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: width * 0.45,
    height: width * 0.45,
  },

  taglineText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.montserrat.semiBold,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
});
