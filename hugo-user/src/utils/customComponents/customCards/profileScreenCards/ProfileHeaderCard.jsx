/**
 * Profile Header Card Component
 *
 * Displays user avatar, name, static description, and profile stats.
 * Includes a chevron icon for navigating to profile edit screen.
 * Stats (Followers, Following, Friends) are touchable and navigate to detail screens.
 *
 * @component
 * @example
 * return (
 *   <ProfileHeaderCard
 *     image={userProfile?.profilePicture}
 *     name={userProfile?.userName}
 *     followersCount={userProfile?.followers?.length}
 *     followingCount={userProfile?.following?.length}
 *     friendsCount={friendsCount}
 *     onEditPress={() => navigation.navigate('EditProfile')}
 *     onFollowersPress={() => navigation.navigate('Followers')}
 *     onFollowingPress={() => navigation.navigate('Following')}
 *     onFriendsPress={() => navigation.navigate('Friends')}
 *   />
 * )
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import {globalStyles} from '../../../../styles/globalStyles';
import {theme} from '../../../../styles/theme';
import imgPlaceHolder from '../../../../assets/placeholders/default-avatar.png';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width, height} = Dimensions.get('screen');

const ProfileHeaderCard = ({
  image,
  name,
  followersCount = 0,
  followingCount = 0,
  friendsCount = 0,
  onEditPress,
  onFollowersPress,
  onFollowingPress,
  onFriendsPress,
}) => {
  return (
    <SafeAreaView style={[globalStyles.container, styles.primaryContainer]}>
      <View style={styles.cardContainer}>
        {/* User Info Section */}
        <View style={styles.userInfoContainer}>
          <View style={styles.imgContainer}>
            {image ? (
              <Image source={{uri: image}} style={styles.img} />
            ) : (
              <Image source={imgPlaceHolder} style={styles.img} />
            )}
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.description}>View or edit your profile</Text>
          </View>
          <TouchableOpacity onPress={onEditPress}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem} onPress={onFollowingPress}>
            <Text style={styles.statNumber}>{followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={onFriendsPress}>
            <Text style={styles.statNumber}>{friendsCount}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={onFollowersPress}>
            <Text style={styles.statNumber}>{followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileHeaderCard;

const styles = StyleSheet.create({
  cardContainer: {
    padding: height * 0.02,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    marginHorizontal: width * 0.02,
    shadowColor: theme.colors.dark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },

  imgContainer: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: theme.borderRadius.circle,
    overflow: 'hidden',
    marginRight: width * 0.04,
  },

  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  infoContainer: {
    flex: 1,
  },

  name: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.bold,
    color: theme.colors.dark,
  },

  description: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.montserrat.medium,
    color: theme.colors.secondary,
    marginTop: 2,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  statItem: {
    alignItems: 'center',
    paddingHorizontal: width * 0.02,
  },

  statNumber: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.montserrat.bold,
    color: theme.colors.dark,
    marginBottom: height * 0.004,
  },

  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.montserrat.medium,
    color: theme.colors.secondary,
  },
});
