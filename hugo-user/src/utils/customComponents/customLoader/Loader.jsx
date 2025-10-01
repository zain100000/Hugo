/**
 * Simple loading indicator component for full-screen loading states
 * Automatically adapts to system color scheme for appropriate styling
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import {theme} from '../../../styles/theme';
import {globalStyles} from '../../../styles/globalStyles';

const Loader = () => {
  const colorScheme = useColorScheme();
  return (
    <View style={[globalStyles.container, styles.container]}>
      <ActivityIndicator
        size="large"
        color={
          colorScheme === 'dark' ? theme.colors.primary : theme.colors.primary
        }
      />
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
