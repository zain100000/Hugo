import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../../utils/customComponents/customHeader/Header';
import Logo from '../../assets/splashScreen/splash-logo.png';
import {theme} from '../../styles/theme';
import socketManager from '../../utils/customSocket/Socket.Manager.utility';
import * as socketActions from '../../utils/customSocket/socketActions/Socket.Actions.utility';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('screen');

const Club = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentUser = useSelector(state => state.auth?.user);
  const currentUserId = currentUser?._id || currentUser?.id;

  const navigation = useNavigation();

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
    StatusBar.setBarStyle('light-content');

    if (!socketManager.isConnected()) socketManager.initialize();

    socketActions.listenToAllClubs(data => {
      if (data?.clubs) setClubs(data.clubs);
      setLoading(false);
    });

    socketActions.getAllClubs();

    return () => socketActions.removeAllClubsListener();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    socketActions.getAllClubs();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const joinClub = clubId => {
    socketActions.joinClub({clubId});
    // Optimistic update: mark as joined in UI
    setClubs(prev =>
      prev.map(club => (club._id === clubId ? {...club, joined: true} : club)),
    );
  };

  const openClub = club => {
    // Navigate to the Club Chat / Details screen
    navigation.navigate('Club_Detail', {
      clubId: club._id,
      clubName: club.name,
    });
  };

  const renderClubItem = ({item}) => {
    const isMember =
      item.members.some(m => m.user?._id === currentUserId) || item.joined;

    return (
      <TouchableOpacity
        style={styles.clubCard}
        onPress={() => openClub(item)}
        activeOpacity={0.8}>
        <Image
          source={
            item.clubImage
              ? {uri: item.clubImage}
              : require('../../assets/placeholders/default-avatar.png')
          }
          style={styles.clubImage}
        />
        <View style={styles.clubInfo}>
          <Text style={styles.clubName}>{item.name}</Text>
          <Text style={styles.clubDesc} numberOfLines={2}>
            {item.description || 'No description'}
          </Text>
        </View>
        {!isMember && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => joinClub(item._id)}>
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        )}
        {isMember && (
          <View style={styles.joinedLabel}>
            <Text style={styles.joinedLabelText}>Joined</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.container}>
      <Header title="Clubs" logo={Logo} />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.white} />
        </View>
      ) : clubs?.length > 0 ? (
        <FlatList
          data={clubs}
          keyExtractor={item => item._id}
          renderItem={renderClubItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No clubs found!</Text>
        </View>
      )}
    </LinearGradient>
  );
};

export default Club;

const styles = StyleSheet.create({
  container: {flex: 1},
  listContainer: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.03,
  },
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  clubImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.gray,
  },
  clubInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  clubName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.montserrat.semiBold,
    color: theme.colors.dark,
  },
  clubDesc: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.regular,
    color: theme.colors.gray,
    marginTop: 2,
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  joinButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.semiBold,
  },
  joinedLabel: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: theme.colors.gray,
  },
  joinedLabelText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.semiBold,
  },
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.montserrat.semiBold,
    color: theme.colors.white,
  },
});
