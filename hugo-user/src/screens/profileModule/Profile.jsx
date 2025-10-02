/**
 * Profile screen component displaying user profile information
 * Features profile header, coin balance, phone verification, profile options, and logout functionality.
 */

import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  StatusBar,
  Dimensions,
  View,
  ScrollView,
  useColorScheme,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import Logo from '../../assets/splashScreen/splash-logo.png';
import {useDispatch, useSelector} from 'react-redux';
import {deleteUser, getUser} from '../../redux/slices/user.slice';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import ProfileHeaderCard from '../../utils/customComponents/customCards/profileScreenCards/ProfileHeaderCard';
import ProfileCoinCard from '../../utils/customComponents/customCards/profileScreenCards/ProfileCoinCard';
import ProfileScreenCard from '../../utils/customComponents/customCards/profileScreenCards/ProfileCard';
import PhoneVerificationCard from '../../utils/customComponents/customCards/profileScreenCards/PhoneVerificationCard';
import LogoutModal from '../../utils/customModals/LogoutModal';
import DeleteAccountModal from '../../utils/customModals/DeleteAccountModal';
import Toast from 'react-native-toast-message';

const {width, height} = Dimensions.get('screen');

const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const user = useSelector(state => state.auth.user);
  const userProfile = useSelector(state => state.user.user);

  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        dispatch(getUser(user.id));
      }
    }, [user?.id]),
  );

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
    StatusBar.setBarStyle('light-content');
  }, []);

  const handleRechargePress = () => {
    navigation.navigate('Coin_Packages');
  };

  const handleLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const handleDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const result = await dispatch(deleteUser(user.id)).unwrap();

      setShowDeleteModal(false);

      setTimeout(() => {
        Toast.show({
          type: 'success',
          text1: 'Account Deleted',
          text2: result.message || 'Your account has been removed',
        });
        navigation.reset({
          index: 0,
          routes: [{name: 'Signin'}],
        });
      }, 500);
    } catch (error) {
      console.error('[handleDeleteAccount] Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Deletion Failed',
        text2: error.includes('Network Error')
          ? 'Network connection failed'
          : error || 'Could not delete account',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileNavigate = () => {
    navigation.navigate('Edit_Profile', {user: userProfile});
  };

  const gradientColors = [theme.colors.primary, theme.colors.tertiary];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[globalStyles.container, styles.whiteContainer]}>
      <View style={styles.headerContainer}>
        <Header title="Profile" logo={Logo} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.profileInfoContainer}>
          {/* Profile Header */}
          <ProfileHeaderCard
            image={userProfile?.profilePicture}
            name={userProfile?.userName}
            followersCount={userProfile?.followers?.length || 0}
            followingCount={userProfile?.following?.length || 0}
            friendsCount={
              userProfile?.followers?.filter(f =>
                userProfile?.following?.includes(f),
              ).length || 0
            }
            onEditPress={handleProfileNavigate}
            onFollowersPress={() => navigation.navigate('Followers')}
            onFollowingPress={() => navigation.navigate('Following')}
            onFriendsPress={() => navigation.navigate('Friends')}
          />

          {/* Coin Balance */}
          <ProfileCoinCard
            coins={userProfile?.coins || 0}
            onRechargePress={handleRechargePress}
          />

          {/* Phone Verification */}
          <PhoneVerificationCard
            isVerified={userProfile?.isPhoneVerified ?? false}
            onPress={() => navigation.navigate('VerifyPhone')}
          />
        </View>

        {/* Profile Options */}
        <View style={styles.profileCards}>
          <ProfileScreenCard
            title="Privacy Policy"
            iconName="shield"
            iconColor={theme.colors.white}
            rightIcon="chevron-right"
            onPressFunction={() => navigation.navigate('Privacy_Policy')}
            textColor={theme.colors.white}
          />

          <ProfileScreenCard
            title="Terms & Conditions"
            iconName="briefcase"
            iconColor={theme.colors.white}
            rightIcon="chevron-right"
            onPressFunction={() => navigation.navigate('App_Usage')}
            textColor={theme.colors.white}
          />

          <ProfileScreenCard
            title="Delete My Profile"
            iconName="trash-can"
            iconColor={theme.colors.white}
            rightIcon="chevron-right"
            onPressFunction={handleDeleteModal}
            textColor={theme.colors.white}
          />

          <ProfileScreenCard
            title="Logout"
            iconName="logout"
            iconColor={theme.colors.white}
            rightIcon="chevron-right"
            onPressFunction={handleLogoutModal}
            textColor={theme.colors.white}
          />
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Logout!"
        description="Are you sure you want to logout?"
      />

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteConfirm={handleDeleteAccount}
        loading={loading}
        title="Delete Account"
        description="This will permanently erase all your data. This cannot be undone."
      />
    </LinearGradient>
  );
};

export default Profile;

const styles = StyleSheet.create({
  whiteContainer: {
    flex: 1,
  },

  scrollViewContainer: {
    paddingTop: height * 0.02,
    paddingBottom: height * 0.05,
  },

  profileInfoContainer: {
    paddingHorizontal: width * 0.025,
    gap: theme.gap(1),
  },

  profileCards: {
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.025,
    gap: theme.gap(1),
  },
});
