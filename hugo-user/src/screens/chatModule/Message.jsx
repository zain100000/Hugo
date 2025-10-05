/**
 * @file Message.js
 * @description Chat message screen with animated UI, gradient background, and live socket messaging.
 * @version 2.1
 * @features
 * - Fetches current user from Redux (auth.user)
 * - Sender messages on right, receiver messages on left
 * - Smooth animations for new messages and empty states
 * - Real-time messaging using Socket Manager
 * - Message read + delete functionality
 */

import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../../styles/theme';
import socketManager from '../../utils/customSocket/Socket.Manager.utility';
import * as socketActions from '../../utils/customSocket/socketActions/Socket.Actions.utility';
import InputField from '../../utils/customComponents/customInputField/InputField';
import Loader from '../../utils/customComponents/customLoader/Loader';
import MessageHeader from '../../utils/customComponents/customHeader/MessageHeader';

const {width, height} = Dimensions.get('screen');

const Message = () => {
  const route = useRoute();
  const {targetUserId: userId, userName, profilePicture} = route.params;

  const currentUser = useSelector(state => state.auth?.user);
  const currentUserId =
    currentUser?._id || currentUser?.id || currentUser?.userId || null;

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // 🔹 Animate empty chat state
  useEffect(() => {
    if (!isLoading && messages.length === 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.95,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
    }
  }, [messages, isLoading]);

  // 🔹 Initialize socket and listeners
  useEffect(() => {
    if (!socketManager.isConnected()) socketManager.initialize();
    const socket = socketManager.socket;
    if (!socket) return;

    setIsConnected(true);

    socketActions.listenToChatCreated(data => {
      if (data?.chat) {
        setCurrentChatId(data.chat._id);
        socketActions.getMessageHistory({chatId: data.chat._id});
      }
      setIsLoading(false);
    });

    socketActions.listenToMessageHistory(data => {
      if (data?.messages?.length) {
        setMessages(data.messages);
        markAllAsRead(data.messages);
      }
      setIsLoading(false);
    });

    socketActions.listenToNewMessage(data => {
      if (data?.message) {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
        setMessages(prev => [...prev, data.message]);
        markAllAsRead([data.message]);
      }
    });

    socketActions.listenToChatError(() => setIsLoading(false));
    socketActions.createChat({otherUserId: userId});

    return () => {
      socketActions.removeChatCreatedListener();
      socketActions.removeMessageHistoryListener();
      socketActions.removeNewMessageListener();
      socketActions.removeChatErrorListener();
    };
  }, [userId]);

  // 🔹 Mark all received messages as read
  const markAllAsRead = msgs => {
    if (!currentChatId || !msgs?.length) return;
    const unreadMessageIds = msgs
      .filter(m => {
        const senderId =
          m?.sender?._id || m?.sender?.id || m?.sender?.$oid || m?.sender;
        return senderId !== currentUserId && !m?.isRead;
      })
      .map(m => m._id || m.id);
    if (unreadMessageIds.length > 0) {
      socketActions.markMessageAsRead({
        chatId: currentChatId,
        messageIds: unreadMessageIds,
      });
    }
  };

  // 🔹 Delete message (only for current user)
  const onDeleteMessage = messageId => {
    if (!currentChatId) return;
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            socketActions.deleteMessage({chatId: currentChatId, messageId});
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
          },
        },
      ],
    );
  };

  // 🔹 Send a new message
  const onSendMessage = () => {
    if (!messageText.trim() || !currentChatId || !isConnected) return;
    socketActions.sendMessage({
      chatId: currentChatId,
      text: messageText.trim(),
      type: 'TEXT',
    });
    setMessageText('');
  };

  // 🔹 Render each message bubble
  const renderMessage = ({item}) => {
    const senderId =
      item?.sender?.$oid ||
      item?.sender?._id ||
      item?.sender?.id ||
      item?.sender ||
      null;

    const isUser = senderId === currentUserId;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => isUser && onDeleteMessage(item._id)}>
        <Animated.View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessage : styles.otherMessage,
            {transform: [{scale: scaleAnim}]},
          ]}>
          <Text
            style={isUser ? styles.userMessageText : styles.otherMessageText}>
            {item.text}
          </Text>
          <Text
            style={[
              styles.messageTime,
              {color: isUser ? 'rgba(255,255,255,0.7)' : theme.colors.gray},
            ]}>
            {new Date(item.sentAt?.$date || item.sentAt).toLocaleTimeString(
              [],
              {hour: '2-digit', minute: '2-digit'},
            )}
            {isUser && item.isRead ? ' ✓✓' : ''}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.gradientContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <MessageHeader
          userName={userName}
          profilePicture={profilePicture}
          isConnected={isConnected}
        />

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        ) : messages.length > 0 ? (
          <FlatList
            data={messages}
            keyExtractor={(item, index) =>
              `${index}-${item._id || item.sentAt}`
            }
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesContainer}
          />
        ) : (
          <Animated.View
            style={[
              styles.emptyContainer,
              {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
            ]}>
            <MaterialCommunityIcons
              name="message-off"
              size={width * 0.24}
              color={theme.colors.white}
            />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start a chat and send your first message!
            </Text>
          </Animated.View>
        )}

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <InputField
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message"
              placeholderTextColor={theme.colors.gray}
              editable={isConnected}
              leftIcon={
                <MaterialCommunityIcons
                  name="message"
                  size={width * 0.045}
                  color={theme.colors.primary}
                />
              }
              style={styles.inputField}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              !isConnected || !messageText.trim()
                ? styles.sendButtonDisabled
                : null,
            ]}
            onPress={onSendMessage}
            disabled={!isConnected || !messageText.trim()}>
            <MaterialCommunityIcons
              name="send"
              size={width * 0.06}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Message;

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  messagesContainer: {
    flexGrow: 1,
    padding: height * 0.02,
    paddingBottom: height * 0.1,
  },

  messageBubble: {
    maxWidth: width * 0.75,
    padding: height * 0.018,
    borderRadius: theme.borderRadius.large,
    marginBottom: height * 0.015,
  },

  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 0,
  },

  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },

  userMessageText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.regular,
    color: theme.colors.white,
  },

  otherMessageText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.regular,
    color: theme.colors.dark,
  },

  messageTime: {
    fontSize: theme.typography.fontSize.xs,
    alignSelf: 'flex-end',
    marginTop: 4,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.gap(1),
  },

  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.semiBold,
    marginTop: height * 0.02,
  },

  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray,
    fontFamily: theme.typography.montserrat.regular,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height * 0.015,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  inputContainer: {
    flex: 1,
    marginRight: width * 0.03,
  },

  inputField: {
    borderRadius: theme.borderRadius.circle,
  },

  sendButton: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: height * 0.002,
  },

  sendButtonDisabled: {
    backgroundColor: theme.colors.gray,
    opacity: 0.7,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
