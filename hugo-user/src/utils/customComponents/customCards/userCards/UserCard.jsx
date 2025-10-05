/**
 * @component UserCard
 * @description Renders a compact horizontal user card displaying profile picture, username, gender-age badge, and bio.
 * @param {Object} props
 * @param {Object} props.user - The user object containing profile data.
 * @param {Function} props.onCardPress - Callback when the card is pressed.
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {theme} from '../../../../styles/theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {globalStyles} from '../../../../styles/globalStyles';

const {width, height} = Dimensions.get('screen');

const UserCard = ({user, onCardPress}) => {
  const calculateAge = dob => {
    if (!dob) return null;
    const birthDate = new Date(dob?.$date || dob);
    if (isNaN(birthDate)) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    )
      age--;
    return age;
  };

  const age = calculateAge(user?.dob);
  const isMale = user?.gender?.toUpperCase() === 'MALE';

  return (
    <View style={[globalStyles.container, styles.primaryContainer]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onCardPress}
        activeOpacity={0.8}>
        <Image
          source={
            user?.profilePicture
              ? {uri: user.profilePicture}
              : require('../../../../assets/placeholders/default-avatar.png')
          }
          style={styles.avatar}
        />

        <View style={styles.infoContainer}>
          <View style={styles.topRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.userName || 'Unknown'}
            </Text>

            {age !== null && (
              <View
                style={[
                  styles.genderAgeContainer,
                  {backgroundColor: isMale ? '#4A90E2' : '#FF69B4'},
                ]}>
                <MaterialCommunityIcons
                  name={isMale ? 'gender-male' : 'gender-female'}
                  size={12}
                  color={theme.colors.white}
                />
                <Text style={styles.ageText}>{age}</Text>
              </View>
            )}
          </View>

          <Text style={styles.bio} numberOfLines={1}>
            {user?.bio || 'No bio available'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default UserCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginHorizontal: width * 0.02,
    marginVertical: height * 0.01,
    padding: height * 0.014,
    borderRadius: theme.borderRadius.large,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
  },

  avatar: {
    width: width * 0.14,
    height: width * 0.14,
    borderRadius: theme.borderRadius.circle,
  },

  infoContainer: {
    flex: 1,
    marginLeft: width * 0.04,
    justifyContent: 'center',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  userName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.dark,
    fontFamily: theme.typography.montserrat.medium,
    flexShrink: 1,
  },

  genderAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.circle,
    paddingHorizontal: width * 0.034,
    paddingVertical: height * 0.004,
    marginLeft: width * 0.04,
  },

  ageText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.medium,
    marginLeft: width * 0.01,
  },

  bio: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray,
    fontFamily: theme.typography.montserrat.light,
  },
});
