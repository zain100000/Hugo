/**
 * Animated header component with gradient background and navigation controls
 * Features fade and scale animations, left/right icons, and logo with title
 * @param {Object} props - Component properties
 * @param {string} props.title - Header title text
 * @param {any} props.logo - Logo image source
 * @param {any} props.leftIcon - Left icon element or image source
 * @param {Function} props.onPressLeft - Left icon press handler
 * @param {any} props.rightIcon - Right icon element or image source
 * @param {Function} props.onPressRight - Right icon press handler
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../../../styles/theme';

const {width, height} = Dimensions.get('screen');

const Header = ({
  title,
  logo,
  leftIcon,
  onPressLeft,
  rightIcon,
  onPressRight,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          transform: [{scale: scaleAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.tertiary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientBackground}>
        <View style={styles.leftGroup}>
          {leftIcon && (
            <TouchableOpacity onPress={onPressLeft} activeOpacity={0.8}>
              {React.isValidElement(leftIcon) ? (
                leftIcon
              ) : (
                <Image
                  source={leftIcon}
                  style={[styles.icon, {tintColor: theme.colors.white}]}
                />
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.logoTitleGroup}>
          {logo && <Image source={logo} style={styles.logo} />}
          <Text style={[styles.title, {color: theme.colors.white}]}>
            {title}
          </Text>
        </View>

        <View style={styles.rightGroup}>
          {rightIcon && (
            <TouchableOpacity onPress={onPressRight} activeOpacity={0.8}>
              {React.isValidElement(rightIcon) ? (
                rightIcon
              ) : (
                <Image
                  source={rightIcon}
                  style={[styles.icon, {tintColor: theme.colors.white}]}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    borderBottomLeftRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
    overflow: 'hidden',
    ...theme.elevation.depth2,
  },

  gradientBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.018,
  },

  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.03,
  },

  logoTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.025,
    marginLeft: width * 0.04,
  },

  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.03,
  },

  logo: {
    width: width * 0.14,
    height: width * 0.14,
    resizeMode: 'contain',
  },

  title: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.montserrat.semiBold,
    top: height * 0.004,
  },

  icon: {
    width: width * 0.06,
    height: width * 0.06,
    resizeMode: 'contain',
  },
});
