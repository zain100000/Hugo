/**
 * @component Home
 * @description Displays a list of all registered users in a scrollable FlatList layout.
 * Includes pull-to-refresh functionality and gradient background styling.
 * Each user is rendered using the UserCard component.
 * Excludes the current logged-in user from the list.
 *
 * @returns {JSX.Element} The Home screen UI with user list or loading/empty state.
 */

import React, {useEffect, useCallback, useState} from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  FlatList,
  RefreshControl,
  Text,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {getAllUsers} from '../../redux/slices/user.slice';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import UserCard from '../../utils/customComponents/customCards/userCards/UserCard';
import Loader from '../../utils/customComponents/customLoader/Loader';
import Logo from '../../assets/splashScreen/splash-logo.png';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('screen');

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Redux state
  const {users, loading} = useSelector(state => state.user);
  const currentUser = useSelector(state => state.auth.user); // Current logged-in user

  console.log('CURRENTUSER', currentUser);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Set StatusBar
  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
    StatusBar.setBarStyle('light-content');
  }, []);

  // Fetch users on mount
  useEffect(() => {
    console.log('🔹 Fetching all users...');
    dispatch(getAllUsers());
  }, [dispatch]);

  // Filter out current user when either users or currentUser change
  useEffect(() => {
    if (currentUser && users) {
      console.log('🔹 Current User ID:', currentUser.id); // <-- use .id
      const filtered = users.filter(user => {
        const userId =
          typeof user._id === 'string'
            ? user._id
            : user._id?._id || user._id?.$oid;
        console.log('🔹 User ID:', userId);
        return userId !== currentUser.id; // <-- compare to .id
      });
      console.log('🔹 Users displayed (excluding current):', filtered.length);
      setFilteredUsers(filtered);
    }
  }, [users, currentUser]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    console.log('🔹 Pull-to-refresh triggered');
    setRefreshing(true);
    dispatch(getAllUsers()).finally(() => {
      setRefreshing(false);
      console.log('🔹 Refresh complete');
    });
  }, [dispatch]);

  const gradientColors = [theme.colors.primary, theme.colors.tertiary];

  // Navigate to UserDetail screen
  const handleUserDetailNavigation = person => {
    navigation.navigate('User_Details', {userDetails: person});
  };

  return (
    <LinearGradient
      colors={gradientColors}
      style={[globalStyles.container, styles.primaryContainer]}>
      <Header title="Home" logo={Logo} />

      {!currentUser ? (
        <Loader />
      ) : loading ? (
        <Loader />
      ) : filteredUsers.length > 0 ? (
        <FlatList
          data={filteredUsers}
          keyExtractor={item =>
            typeof item._id === 'string'
              ? item._id
              : item._id?._id || item._id?.$oid
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({item}) => (
            <UserCard
              user={item}
              onCardPress={() => handleUserDetailNavigation(item)}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {users?.length > 0 ? 'No other users found!' : 'No Users Found!'}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
  },

  listContainer: {
    paddingVertical: height * 0.02,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.02,
  },

  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.montserrat.semiBold,
    color: theme.colors.white,
  },
});
