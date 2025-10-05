import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import socketManager from '../../utils/customSocket/Socket.Manager.utility';
import * as socketActions from '../../utils/customSocket/socketActions/Socket.Actions.utility';
import { theme } from '../../styles/theme';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('screen');

/**
 * ChatLists component to render all user chats in a list.
 * @component
 */
const ChatLists = () => {
  const navigation = useNavigation();
  const currentUser = useSelector((state) => state.auth?.user);
  const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId;

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socketManager.isConnected()) socketManager.initialize();

    socketActions.listenToChatsList((data) => {
      console.log('📥 Received chats list:', data);
      if (data?.chats) {
        setChats(data.chats);
      }
      setLoading(false);
    });

    console.log('📤 Requesting all chats...');
    socketActions.getChats();

    return () => {
      socketActions.removeChatsListListener();
    };
  }, []);

  const openChat = (chat) => {
    const otherUser = chat.participants.find((p) => p._id !== currentUserId);
    console.log('🔹 Opening chat with:', otherUser);
    navigation.navigate('Message', {
      targetUserId: otherUser._id,
      userName: otherUser.userName,
      profilePicture: otherUser.profilePicture || null,
    });
  };

  const renderChatItem = ({ item }) => {
    const otherUser = item.participants.find((p) => p._id !== currentUserId);
    const lastMessage = item.lastMessage;

    return (
      <TouchableOpacity style={styles.chatCard} onPress={() => openChat(item)}>
        {otherUser.profilePicture ? (
          <Image source={{ uri: otherUser.profilePicture }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {otherUser.userName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}

        <View style={styles.chatInfo}>
          <Text style={styles.userName}>{otherUser.userName}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage?.text || 'No messages yet'}
          </Text>
        </View>

        <View style={styles.meta}>
          {lastMessage?.sentAt && (
            <Text style={styles.time}>
              {new Date(lastMessage.sentAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
          {lastMessage?.isRead === false &&
            lastMessage?.sender?._id !== currentUserId && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      keyExtractor={(item) => item._id}
      renderItem={renderChatItem}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default ChatLists;

const styles = StyleSheet.create({

  listContainer: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.03,
  },

  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.gray,
  },

  avatarPlaceholder: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarInitial: {
    color: theme.colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },

  chatInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },

  userName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.montserrat.semiBold,
    color: theme.colors.dark,
  },

  lastMessage: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.regular,
    color: theme.colors.gray,
    marginTop: 4,
  },

  meta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  time: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray,
    marginBottom: 6,
  },

  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

});
