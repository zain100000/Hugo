/**
 * @component UserDetail
 * @description Displays user profile, media, and details.
 * Integrates follow user functionality with backend toast feedback.
 *
 * @returns {JSX.Element} User detail screen UI
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Text,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {followUser, clearFollowState} from '../../../redux/slices/follow.slice';
import {theme} from '../../../styles/theme';
import {globalStyles} from '../../../styles/globalStyles';
import Header from '../../../utils/customComponents/customHeader/Header';
import Logo from '../../../assets/splashScreen/splash-logo.png';
import countriesData from '../../../utils/json/Countries.json';
import {useNavigation, useRoute} from '@react-navigation/native';

const {width, height} = Dimensions.get('screen');

const UserDetail = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const navigation = useNavigation();
  const user = route.params?.userDetails;

  const {loading, successMessage, error, backendMessage} = useSelector(
    state => state.follow,
  );

  const loggedInUser = useSelector(state => state.auth.user);

  const [isFollowing, setIsFollowing] = useState(false);

  // 🔹 Set initial follow status based on logged-in user's following list
  useEffect(() => {
    if (loggedInUser && user) {
      const followingIds = loggedInUser.following?.map(
        f => f.$oid?.toString() || f.toString(),
      );
      const userId = user._id?.$oid?.toString() || user._id?.toString();
      setIsFollowing(followingIds?.includes(userId));
    }
  }, [loggedInUser, user]);

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
    StatusBar.setBarStyle('light-content');
  }, []);

  // 🔔 Toast feedback & follow state update
  useEffect(() => {
    if (successMessage || backendMessage) {
      ToastAndroid.show(backendMessage || successMessage, ToastAndroid.SHORT);
      setIsFollowing(true);
      dispatch(clearFollowState());
    } else if (error) {
      ToastAndroid.show(error, ToastAndroid.SHORT);
      dispatch(clearFollowState());
    }
  }, [successMessage, error, backendMessage, dispatch]);

  const handleFollow = () => {
    if (user?._id) {
      dispatch(followUser(user._id));
    } else {
      ToastAndroid.show('Invalid user', ToastAndroid.SHORT);
    }
  };

  // 🧮 Utility Functions
  const calculateAge = dob => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate)) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatRegistrationDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getZodiacSign = dob => {
    if (!dob) return 'N/A';
    const date = new Date(dob);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
      return 'Aquarius';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20))
      return 'Pisces';
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19))
      return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
      return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
      return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22))
      return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22))
      return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
      return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
      return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
      return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
      return 'Capricorn';
    return 'N/A';
  };

  const dobString = user?.dob?.$date || user?.dob;
  const age = calculateAge(dobString);
  const isMale = user?.gender?.toUpperCase() === 'MALE';

  const InformationRow = ({label, value, iconName}) => {
    const getCountryFlag = countryName => {
      if (!countryName) return '';
      const country = countriesData.countries.find(
        c => c.name.toLowerCase() === countryName.toLowerCase(),
      );
      return country ? country.flag : '';
    };
    const showFlag = label === 'Nationality' || label === 'Current Address';

    return (
      <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
          <MaterialCommunityIcons
            name={iconName}
            size={width * 0.05}
            color={theme.colors.white}
            style={styles.infoIcon}
          />
          <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <View style={styles.infoRight}>
          {showFlag && (
            <Text style={{fontSize: width * 0.05, marginRight: 6}}>
              {getCountryFlag(value)}
            </Text>
          )}
          <Text style={styles.infoValue}>{value || 'N/A'}</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.tertiary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[globalStyles.container, styles.container]}>
        <SafeAreaView style={globalStyles.container}>
          <Header title="User Details" logo={Logo} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Profile Picture */}
            <View style={styles.imgContainer}>
              {user?.profilePicture ? (
                <Image source={{uri: user.profilePicture}} style={styles.img} />
              ) : (
                <Image
                  source={require('../../../assets/placeholders/default-avatar.png')}
                  style={styles.img}
                />
              )}
            </View>

            {/* Username */}
            <View style={styles.usernameContainer}>
              <Text style={styles.userNameText}>{user?.userName || 'N/A'}</Text>
            </View>

            {/* Bio */}
            <View style={styles.usernameContainer}>
              <Text
                style={[styles.bioText, !user?.bio && styles.placeholderText]}>
                {user?.bio || 'No bio available'}
              </Text>
            </View>

            {/* Gender + Age */}
            {age !== null && (
              <View style={styles.ageContainer}>
                <View
                  style={[
                    styles.ageCircle,
                    {backgroundColor: isMale ? '#4A90E2' : '#FF69B4'},
                  ]}>
                  <MaterialCommunityIcons
                    name={isMale ? 'gender-male' : 'gender-female'}
                    size={width * 0.05}
                    color={theme.colors.white}
                    style={{marginRight: width * 0.01}}
                  />
                  <Text style={styles.ageText}>{age}</Text>
                </View>
              </View>
            )}

            {/* Media Section */}
            <View style={styles.mediaContainer}>
              <View style={styles.separator} />
              <View style={styles.mediaHeaderContainer}>
                <Text style={styles.headerText}>Media</Text>
              </View>

              {user?.media?.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.mediaScroll}>
                  {user.media.map((item, index) => (
                    <Image
                      key={index}
                      source={{uri: item.url}}
                      style={styles.mediaThumbnail}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.noMediaContainer}>
                  <MaterialCommunityIcons
                    name="image-off"
                    size={width * 0.1}
                    color={theme.colors.white + '80'}
                  />
                  <Text style={styles.noMediaText}>No Media Uploaded</Text>
                </View>
              )}

              <View style={styles.separator} />
            </View>

            {/* Information Section */}
            <View style={styles.informationContainer}>
              <View style={styles.infoHeaderContainer}>
                <Text style={styles.headerText}>Information</Text>
              </View>

              <View style={styles.infoContent}>
                <InformationRow
                  label="Height"
                  value={user?.height ? `${user.height}cm` : 'N/A'}
                  iconName="human-male-height"
                />
                <InformationRow
                  label="Weight"
                  value={user?.weight ? `${user.weight}kg` : 'N/A'}
                  iconName="weight-kilogram"
                />
                <InformationRow
                  label="Occupation"
                  value={user?.occupation || 'N/A'}
                  iconName="briefcase-outline"
                />
                <InformationRow
                  label="Current Address"
                  value={user?.currentAddress || 'N/A'}
                  iconName="map-marker-outline"
                />
                <InformationRow
                  label="Nationality"
                  value={user?.nationality || 'N/A'}
                  iconName="flag-outline"
                />
                <InformationRow
                  label="Birthday"
                  value={formatDate(dobString)}
                  iconName="cake-variant-outline"
                />
                <InformationRow
                  label="Constellation"
                  value={getZodiacSign(dobString)}
                  iconName="star"
                />
                <InformationRow
                  label="Registration"
                  value={formatRegistrationDate(
                    user?.createdAt?.$date || user?.createdAt,
                  )}
                  iconName="calendar-clock"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Bottom Action Buttons */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionButton}>
          <TouchableOpacity onPress={handleFollow} disabled={loading}>
            <MaterialCommunityIcons
              name={
                isFollowing ? 'account-check-outline' : 'account-plus-outline'
              }
              size={width * 0.07}
              color={isFollowing ? theme.colors.success : theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.actionButton}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Message', {
                userId: user?._id, // send the target user ID
                userName: user?.userName,
                profilePicture: user?.profilePicture,
              })
            }>
            <MaterialCommunityIcons
              name="chat-outline"
              size={width * 0.07}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default UserDetail;

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: {flex: 1},
  imgContainer: {width: '100%', height: height * 0.34},
  img: {width: '100%', height: '100%', resizeMode: 'cover'},
  usernameContainer: {
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.04,
  },
  userNameText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.bold,
  },
  bioText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.medium,
    marginTop: height * 0.005,
  },
  placeholderText: {color: theme.colors.white + '80', fontStyle: 'italic'},
  ageContainer: {paddingHorizontal: width * 0.04},
  ageCircle: {
    flexDirection: 'row',
    width: width * 0.24,
    height: width * 0.074,
    borderRadius: (width * 0.074) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.009,
    paddingHorizontal: width * 0.03,
  },
  ageText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.bold,
  },
  separator: {
    height: 1.6,
    backgroundColor: theme.colors.white,
    marginVertical: height * 0.02,
    marginHorizontal: width * 0.04,
  },
  mediaHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.01,
    paddingHorizontal: width * 0.04,
  },
  headerText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.semiBold,
  },
  mediaThumbnail: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: theme.borderRadius.small,
    resizeMode: 'cover',
    marginRight: width * 0.04,
  },
  mediaScroll: {paddingHorizontal: width * 0.04},
  noMediaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.04,
  },
  noMediaText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white + '80',
    fontFamily: theme.typography.montserrat.medium,
    marginTop: height * 0.01,
  },
  informationContainer: {
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.03,
  },
  infoHeaderContainer: {marginBottom: height * 0.02},
  infoContent: {
    borderRadius: theme.borderRadius.medium,
    paddingTop: width * 0.02,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.012,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.white + '30',
  },
  infoLeft: {flexDirection: 'row', alignItems: 'center', flex: 1},
  infoRight: {flexDirection: 'row', alignItems: 'center'},
  infoIcon: {marginRight: width * 0.03},
  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.medium,
    flex: 1,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.semiBold,
    marginRight: width * 0.02,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: height * 0.014,
    gap: width * 0.04,
    marginLeft: width * 0.04,
  },
  actionButton: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: (width * 0.15) / 1,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
});
