/**
 * Lite Auth Header
 *
 * Inspired by Splash screen design but simplified for login/signup headers.
 * Features gradient background, subtle animated rays, animated logo,
 * and bold title text.
 *
 * @param {Object} props - Component properties
 * @param {any} props.logo - Logo image source
 * @param {string} props.title - Header title text
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../../../styles/theme';

const {width, height} = Dimensions.get('screen');

const AuthHeader = ({logo, title}) => {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(15)).current;

  const rayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rayAnim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rayAnim, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [logoScale, textOpacity, textTranslateY, rayAnim]);

  const rayTranslate = rayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.15, width * 0.15],
  });

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.gradientBackground}>
      <Animated.View
        style={[
          styles.rayOverlay,
          {transform: [{translateX: rayTranslate}, {rotate: '20deg'}]},
        ]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        />
      </Animated.View>

      <View style={styles.content}>
        <Animated.View style={{transform: [{scale: logoScale}]}}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.Text
          style={[
            styles.authText,
            {
              opacity: textOpacity,
              transform: [{translateY: textTranslateY}],
            },
          ]}>
          {title}
        </Animated.Text>
      </View>
    </LinearGradient>
  );
};

export default AuthHeader;

const styles = StyleSheet.create({
  gradientBackground: {
    height: height * 0.18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  rayOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    marginTop: height * 0.06,
  },

  logo: {
    width: width * 0.2,
  },

  authText: {
    color: theme.colors.dark,
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.montserrat.bold,
    textTransform: 'uppercase',
    top: height * 0.006,
  },
});
