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
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {theme} from '../../styles/theme';
import * as socketActions from '../../utils/customSocket/socketActions/Socket.Actions.utility';
import InputField from '../../utils/customComponents/customInputField/InputField';
import Loader from '../../utils/customComponents/customLoader/Loader';
import Header from '../../utils/customComponents/customHeader/Header';
import Logo from '../../assets/splashScreen/splash-logo.png';

const {width, height} = Dimensions.get('screen');

const ClubDetail = () => {
  const route = useRoute();
  const {clubId, clubName} = route.params;

  const currentUser = useSelector(state => state.auth?.user);
  const currentUserId = currentUser?._id || currentUser?.id;

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true); // assume connected for now

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Fetch club messages
  useEffect(() => {
    socketActions.getClubMessageHistory({clubId, limit: 50});

    socketActions.listenToClubMessageHistory(data => {
      if (data.clubId === clubId) {
        setMessages(data.messages || []);
        setIsLoading(false);
      }
    });

    socketActions.listenToNewClubMessage(data => {
      if (data.clubId === clubId) {
        setMessages(prev => [...prev, data.message || data]);
      }
    });

    return () => {
      socketActions.removeClubMessageHistoryListener();
      socketActions.removeNewClubMessageListener();
    };
  }, [clubId]);

  // Animate empty state
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

  // Send a new message
  const onSendMessage = () => {
    if (!messageText.trim() || !isConnected) return;

    socketActions.sendClubMessage({
      clubId,
      text: messageText.trim(),
      type: 'TEXT',
    });
    setMessageText('');
  };

  const renderMessage = ({item}) => {
    const senderId =
      item?.sender?._id || item?.sender?.id || item?.sender?.$oid || item?.sender;
    const isUser = senderId === currentUserId;

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.otherMessage,
        ]}>
        <Text style={isUser ? styles.userMessageText : styles.otherMessageText}>
          {item.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            {color: isUser ? 'rgba(255,255,255,0.7)' : theme.colors.gray},
          ]}>
          {new Date(item.sentAt?.$date || item.sentAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.gradientContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header title={clubName} logo={Logo} />

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
              Start a conversation in this club!
            </Text>
          </Animated.View>
        )}

        {/* Input Field & Send Button */}
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

export default ClubDetail;

const styles = StyleSheet.create({
  gradientContainer: {flex: 1},
  container: {flex: 1},
  messagesContainer: {flexGrow: 1, padding: height * 0.02, paddingBottom: height * 0.1},
  messageBubble: {maxWidth: width * 0.75, padding: height * 0.018, borderRadius: theme.borderRadius.large, marginBottom: height * 0.015},
  userMessage: {alignSelf: 'flex-end', backgroundColor: theme.colors.primary, borderBottomRightRadius: 0},
  otherMessage: {alignSelf: 'flex-start', backgroundColor: theme.colors.white, borderBottomLeftRadius: 0, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)'},
  userMessageText: {fontSize: theme.typography.fontSize.sm, fontFamily: theme.typography.montserrat.regular, color: theme.colors.white},
  otherMessageText: {fontSize: theme.typography.fontSize.sm, fontFamily: theme.typography.montserrat.regular, color: theme.colors.dark},
  messageTime: {fontSize: theme.typography.fontSize.xs, alignSelf: 'flex-end', marginTop: 4, fontFamily: theme.typography.montserrat.semiBold},
  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.gap(1)},
  emptyText: {fontSize: theme.typography.fontSize.md, color: theme.colors.white, fontFamily: theme.typography.montserrat.semiBold, marginTop: height * 0.02},
  emptySubtext: {fontSize: theme.typography.fontSize.sm, color: theme.colors.gray, fontFamily: theme.typography.montserrat.regular},
  inputWrapper: {flexDirection: 'row', alignItems: 'center', padding: height * 0.015, borderTopWidth: 2, borderTopColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.9)'},
  inputContainer: {flex: 1, marginRight: width * 0.03},
  inputField: {borderRadius: theme.borderRadius.circle},
  sendButton: {width: width * 0.12, height: width * 0.12, borderRadius: theme.borderRadius.circle, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 2, elevation: 5, marginBottom: height * 0.002},
  sendButtonDisabled: {backgroundColor: theme.colors.gray, opacity: 0.7},
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
