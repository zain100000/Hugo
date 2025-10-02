/**
 * Enhanced Profile screen card component
 * Animated (built-in RN), modern, and clean version for navigation and actions
 */

import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {globalStyles} from '../../../../styles/globalStyles';
import {theme} from '../../../../styles/theme';

const {width, height} = Dimensions.get('screen');

const ProfileScreenCard = ({
  title,
  iconName,
  navigationTarget,
  rightIcon,
  iconColor,
  textColor,
  onPressFunction,
}) => {
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (navigationTarget) {
      navigation.navigate(navigationTarget);
    } else if (onPressFunction) {
      onPressFunction();
    }
  };

  return (
    <Animated.View
      style={[
        globalStyles.container,
        styles.primaryContainer,
        {
          opacity: fadeAnim,
          transform: [{translateY}],
        },
      ]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{scale: scaleAnim}],
            },
          ]}>
          <View style={styles.cardLeftContainer}>
            <View style={styles.iconBackground}>
              <MaterialCommunityIcons
                name={iconName || 'cog-outline'}
                size={width * 0.05}
                color={iconColor || theme.colors.primary}
              />
            </View>
            <Text
              style={[
                styles.cardTitle,
                {color: textColor || theme.colors.textPrimary},
              ]}>
              {title || 'Default Title'}
            </Text>
          </View>

          <MaterialCommunityIcons
            name={rightIcon || 'chevron-right'}
            size={width * 0.04}
            color={theme.colors.white}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export default ProfileScreenCard;

const styles = StyleSheet.create({
  primaryContainer: {
    width: '100%',
  },

  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.05,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  cardLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
  },

  iconBackground: {
    backgroundColor: theme.colors.secondary,
    padding: width * 0.02,
    borderRadius: theme.borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.medium,
  },
});
