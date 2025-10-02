/**
 * Profile Verification Card Component
 *
 * Displays user's phone verification status in a styled card.
 * Features a label on the left and verification status with an icon on the right.
 *
 * @component
 * @param {Object} props - Component properties
 * @param {boolean} props.isVerified - Whether the phone is verified
 * @returns {React.Component} Styled verification card component
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {theme} from '../../../../styles/theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width, height} = Dimensions.get('screen');

const ProfileVerificationCard = ({isVerified = false, onPress}) => {
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.9}>
      {/* Left: Label */}
      <View style={styles.textContainer}>
        <Text style={styles.labelText}>Phone</Text>
      </View>

      {/* Right: Status */}
      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.statusText,
            {color: isVerified ? theme.colors.success : theme.colors.error},
          ]}>
          {isVerified ? 'Verified' : 'Not Verified'}
        </Text>
        <MaterialCommunityIcons
          name={isVerified ? 'checkmark-circle' : 'close-circle'}
          size={width * 0.055}
          color={isVerified ? theme.colors.success : theme.colors.error}
        />
        <MaterialCommunityIcons
          name="chevron-right"
          size={width * 0.05}
          color={theme.colors.secondary}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ProfileVerificationCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    borderRadius: width * 0.04,
    marginHorizontal: width * 0.02,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  labelText: {
    fontSize: width * 0.045,
    color: theme.colors.dark,
    fontFamily: theme.typography.montserrat.bold,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
  },

  statusText: {
    fontSize: width * 0.04,
    fontFamily: theme.typography.montserrat.medium,
  },
});
