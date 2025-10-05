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
  TextInput,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../../utils/customComponents/customHeader/Header';
import Logo from '../../assets/splashScreen/splash-logo.png';
import {theme} from '../../styles/theme';
import socketManager from '../../utils/customSocket/Socket.Manager.utility';
import * as socketActions from '../../utils/customSocket/socketActions/Socket.Actions.utility';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width, height} = Dimensions.get('screen');

const Club = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [newClub, setNewClub] = useState({
    name: '',
    isPublic: true,
    description: '',
    rules: '',
    tags: '',
  });

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

  // Join club function
  const joinClub = clubId => {
    socketActions.joinClub({clubId}, response => {
      if (response.success) {
        setClubs(prev =>
          prev.map(club =>
            club._id === clubId
              ? {...club, members: [...club.members, {user: currentUser}]}
              : club,
          ),
        );
      } else {
        alert(response.message || 'Failed to join the club');
      }
    });
  };

  const openClub = club => {
    navigation.navigate('Club_Detail', {
      clubId: club._id,
      clubName: club.name,
    });
  };

  // Delete Club Function
  const confirmDeleteClub = clubId => {
    Alert.alert(
      'Delete Club',
      'Are you sure you want to delete this club?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteClub(clubId),
        },
      ],
      {cancelable: true},
    );
  };

  const deleteClub = clubId => {
    socketActions.deleteClub({clubId}); // backend must support this
    setClubs(prev => prev.filter(club => club._id !== clubId));
  };

  const renderClubItem = ({item}) => {
    const isMember = item.members.some(m => m.user?._id === currentUserId);

    return (
      <TouchableOpacity
        style={styles.clubCard}
        onPress={() => openClub(item)}
        onLongPress={() => confirmDeleteClub(item._id)}
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

  const handleCreateClub = () => {
    if (!newClub.name.trim()) return alert('Club name is required');
    const clubData = {
      ...newClub,
      tags: newClub.tags.split(',').map(t => t.trim()),
    };
    socketActions.createClub(clubData);
    setBottomSheetVisible(false);
    setNewClub({
      name: '',
      isPublic: true,
      description: '',
      rules: '',
      tags: '',
    });
    socketActions.getAllClubs();
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.container}>
      <Header title="Clubs" logo={Logo} />

      <View style={{flex: 1}}>
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
          <View style={[styles.emptyContainer, {paddingBottom: 80}]}>
            <Text style={styles.emptyText}>No clubs found!</Text>
          </View>
        )}
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setBottomSheetVisible(true)}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      {isBottomSheetVisible && (
        <View style={styles.bottomSheet}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.sheetContent}>
              <Text style={styles.sheetTitle}>Create New Club</Text>

              <TextInput
                style={styles.input}
                placeholder="Club Name"
                placeholderTextColor={theme.colors.gray}
                value={newClub.name}
                onChangeText={text => setNewClub({...newClub, name: text})}
              />

              <TextInput
                style={styles.input}
                placeholder="Description"
                placeholderTextColor={theme.colors.gray}
                value={newClub.description}
                onChangeText={text =>
                  setNewClub({...newClub, description: text})
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Rules"
                placeholderTextColor={theme.colors.gray}
                value={newClub.rules}
                onChangeText={text => setNewClub({...newClub, rules: text})}
              />

              <TextInput
                style={styles.input}
                placeholder="Tags (comma separated)"
                placeholderTextColor={theme.colors.gray}
                value={newClub.tags}
                onChangeText={text => setNewClub({...newClub, tags: text})}
              />

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Public Club</Text>
                <Switch
                  value={newClub.isPublic}
                  onValueChange={value =>
                    setNewClub({...newClub, isPublic: value})
                  }
                  thumbColor={theme.colors.primary}
                />
              </View>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateClub}>
                <Text style={styles.createButtonText}>Create Club</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setBottomSheetVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
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
  clubInfo: {flex: 1, marginLeft: 12, justifyContent: 'center'},
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
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 999,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  sheetContent: {paddingBottom: 30},
  sheetTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.montserrat.semiBold,
    color: theme.colors.dark,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.dark,
    fontFamily: theme.typography.montserrat.regular,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.montserrat.semiBold,
  },
  cancelButton: {
    backgroundColor: theme.colors.gray,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.montserrat.semiBold,
  },
});
