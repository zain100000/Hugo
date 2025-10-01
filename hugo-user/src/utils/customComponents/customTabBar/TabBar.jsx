/**
 * Animated tab bar component with smooth indicator transitions and scaling effects
 * Supports multiple tabs with spring animations and customizable styling
 * @param {Object} props - Component properties
 * @param {Array} props.tabs - Array of tab objects with label and value
 * @param {string} props.activeTab - Currently active tab value
 * @param {Function} props.setActiveTab - State setter for active tab
 * @param {Function} props.onTabChange - Callback when tab changes
 */

import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import {theme} from '../../../styles/theme';

const {width, height} = Dimensions.get('screen');
const TAB_BAR_WIDTH = width * 0.94;

const TabBar = ({tabs, activeTab, setActiveTab, onTabChange}) => {
  const tabWidth = TAB_BAR_WIDTH / tabs.length;
  const tabIndicatorPosition = React.useRef(new Animated.Value(0)).current;
  const tabScale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.value === activeTab);
    const position = tabWidth * activeIndex;

    Animated.parallel([
      Animated.spring(tabIndicatorPosition, {
        toValue: position,
        useNativeDriver: true,
        damping: 10,
        stiffness: 100,
      }),
      Animated.sequence([
        Animated.timing(tabScale, {
          toValue: 1.05,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(tabScale, {
          toValue: 1,
          duration: 150,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [activeTab]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.value}
            activeOpacity={0.8}
            style={styles.tabButton}
            onPress={() => {
              setActiveTab(tab.value);
              onTabChange(tab.value);
            }}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab.value && styles.activeTabText,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [
                {translateX: tabIndicatorPosition},
                {scale: tabScale},
              ],
            },
          ]}
        />
      </View>
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.036,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray,
    borderRadius: theme.borderRadius.circle,
    overflow: 'hidden',
    height: height * 0.065,
    alignItems: 'center',
    position: 'relative',
    width: TAB_BAR_WIDTH,
  },

  tabButton: {
    width: TAB_BAR_WIDTH / 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.medium,
    color: theme.colors.primary,
    top: height * 0.002,
  },

  activeTabText: {
    color: theme.colors.white,
    textAlign: 'center',
  },

  tabIndicator: {
    position: 'absolute',
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.small,
    zIndex: 1,
    width: TAB_BAR_WIDTH / 4,
    left: 0,
  },
});
