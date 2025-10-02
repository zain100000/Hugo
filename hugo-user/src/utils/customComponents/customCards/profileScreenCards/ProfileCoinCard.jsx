/**
 * Profile Coin Card Component
 *
 * Displays user's coin balance in a styled card with recharge option.
 * Features coin icon, count, and a forward chevron for navigation.
 *
 * @component
 * @param {Object} props - Component properties
 * @param {number} props.coins - Number of coins the user has
 * @param {Function} props.onRechargePress - Callback when recharge card is pressed
 * @returns {React.Component} Styled coin card component
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

const ProfileCoinCard = ({coins = 0, onRechargePress}) => {
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onRechargePress}
      activeOpacity={0.9}>
      <View style={styles.textContainer}>
        <Text style={styles.rechargeText}>Coins</Text>
      </View>

      <View style={styles.coinsContainer}>
        <MaterialCommunityIcons
          name="circle-slice-8"
          size={width * 0.05}
          color="#FFD700"
          style={styles.coinIcon}
        />
        <Text style={styles.coinCountText}>{coins}</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={width * 0.05}
          color={theme.colors.secondary}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ProfileCoinCard;

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

  rechargeText: {
    fontSize: width * 0.045,
    color: theme.colors.dark,
    fontFamily: theme.typography.montserrat.bold,
  },

  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  coinIcon: {
    marginRight: width * 0.02,
  },

  coinCountText: {
    fontSize: width * 0.045,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.montserrat.medium,
    marginRight: width * 0.015,
  },
});
