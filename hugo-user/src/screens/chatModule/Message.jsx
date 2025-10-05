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
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {theme} from '../../styles/theme';
import socketManager from '../../utils/customSocket/Socket.Manager.utility';
import * as socketActions from '../../utils/customSocket/socketActions/Socket.Actions.utility';
import {globalStyles} from '../../styles/globalStyles';
import InputField from '../../utils/customComponents/customInputField/InputField';
import Loader from '../../utils/customComponents/customLoader/Loader';
import MessageHeader from '../../utils/customComponents/customHeader/MessageHeader';

const {width, height} = Dimensions.get('screen');

const Message = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {userId, userName, profilePicture} = route.params;

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // 🔹 Animate "No messages" view
  useEffect(() => {
    if (!isLoading && messages.length === 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: -10,
              duration: 500,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 500,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      bounceAnim.setValue(0);
    }
  }, [messages, isLoading]);

  // 🔹 Initialize socket & fetch chat/messages
  useEffect(() => {
    console.log('🟡 Initializing socket connection...');
    if (!socketManager.isConnected()) {
      console.log('🧩 Socket not connected → initializing...');
      socketManager.initialize();
    } else {
      console.log('✅ Socket already connected.');
    }

    const socket = socketManager.socket;
    if (!socket) {
      console.log('❌ Socket instance not found!');
      return;
    }

    setIsConnected(true);

    // 🔹 Listen when chat is created or found
    socketActions.listenToChatCreated(data => {
      console.log(
        '✅ [CHAT_CREATED] event received:',
        JSON.stringify(data, null, 2),
      );
      if (data?.chat) {
        console.log('📌 Setting chatId:', data.chat._id);
        setCurrentChatId(data.chat._id);

        console.log('📤 Requesting message history for chatId:', data.chat._id);
        socketActions.getMessageHistory({chatId: data.chat._id});
      } else {
        console.log('⚠️ No chat object found in CHAT_CREATED payload!');
      }
      setIsLoading(false);
    });

    // 🔹 Listen for message history
    socketActions.listenToMessageHistory(data => {
      console.log(
        '📥 [MESSAGE_HISTORY] event received:',
        JSON.stringify(data, null, 2),
      );
      if (data?.messages?.length) {
        console.log(`✅ Loaded ${data.messages.length} messages.`);
        setMessages(data.messages);
      } else {
        console.log('⚠️ No messages found in MESSAGE_HISTORY payload!');
      }
      setIsLoading(false);
    });

    // 🔹 Listen for new messages
    socketActions.listenToNewMessage(data => {
      console.log(
        '📩 [NEW_MESSAGE] event received:',
        JSON.stringify(data, null, 2),
      );
      if (data?.message) {
        console.log('📩 Appending new message to list.');
        setMessages(prev => [...prev, data.message]);
      } else {
        console.log('⚠️ No message object found in NEW_MESSAGE payload!');
      }
    });

    // 🔹 Listen for chat errors
    socketActions.listenToChatError(error => {
      console.log(
        '🚨 [CHAT_ERROR] event received:',
        JSON.stringify(error, null, 2),
      );
      setIsLoading(false);
    });

    // 🔹 Create or get existing chat
    console.log('📤 Emitting CREATE_CHAT event with:', {otherUserId: userId});
    socketActions.createChat({otherUserId: userId});

    // 🔹 Cleanup listeners
    return () => {
      console.log('🧹 Cleaning up all socket listeners...');
      socketActions.removeChatCreatedListener();
      socketActions.removeMessageHistoryListener();
      socketActions.removeNewMessageListener();
      socketActions.removeChatErrorListener();
    };
  }, [userId]);

  // 🔹 Send message
  const onSendMessage = () => {
    if (!messageText.trim() || !currentChatId || !isConnected) {
      console.log('⚠️ Cannot send message — missing field:', {
        messageText,
        currentChatId,
        isConnected,
      });
      return;
    }

    const messageData = {
      chatId: currentChatId,
      text: messageText.trim(),
      type: 'TEXT',
    };

    console.log('📤 Emitting SEND_MESSAGE event with:', messageData);
    socketActions.sendMessage(messageData);

    setMessageText('');
  };

  // 🔹 Render individual message
  const renderMessage = ({item, index}) => {
    console.log(`🧾 Rendering message #${index + 1}:`, item);
    const isUser = item?.sender === userId || item?.sender?._id === userId;
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.otherMessage,
        ]}>
        <Text style={isUser ? styles.userMessageText : styles.otherMessageText}>
          {item.text}
        </Text>
        <Text style={styles.messageTime}>
          {new Date(item.sentAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  console.log('🟢 Current Messages State:', messages);
  console.log('💬 Current Chat ID:', currentChatId);

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.gradientContainer}>
      <View style={globalStyles.container}>
        <MessageHeader userName={userName} profilePicture={profilePicture} />

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
              {
                opacity: fadeAnim,
                transform: [{translateY: bounceAnim}],
              },
            ]}>
            <Feather
              name="message-circle"
              size={width * 0.24}
              color={theme.colors.tertiary}
            />
            <Text style={styles.emptyText}>No messages yet</Text>
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
                <Feather
                  name={'message-circle'}
                  size={width * 0.044}
                  color={theme.colors.primary}
                />
              }
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              !isConnected || !messageText.trim() ? {opacity: 0.5} : {},
            ]}
            onPress={onSendMessage}
            disabled={!isConnected || !messageText.trim()}>
            <FontAwesome6
              name="paper-plane"
              size={width * 0.06}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Message;

// 🎨 Styles remain same
const styles = StyleSheet.create({
  gradientContainer: {flex: 1},
  messagesContainer: {flexGrow: 1, padding: height * 0.02},
  messageBubble: {
    maxWidth: width * 0.8,
    padding: height * 0.015,
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
  },
  userMessageText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
  otherMessageText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.dark,
  },
  messageTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray,
    alignSelf: 'flex-end',
  },
  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.tertiary,
    marginTop: height * 0.02,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height * 0.01,
    borderTopWidth: 2,
    borderTopColor: 'rgba(219, 166, 96, 1)',
    backgroundColor: 'rgba(236, 193, 136, 0.8)',
  },
  inputContainer: {flex: 1, marginRight: width * 0.02},
  sendButton: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
