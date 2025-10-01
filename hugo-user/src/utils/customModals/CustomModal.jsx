import React, {useRef, useEffect} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import {theme} from '../../styles/theme';

const {width, height} = Dimensions.get('screen');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const CustomModal = ({visible, onClose, title, contentList}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1)),
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 300,
            delay: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
          Animated.timing(contentOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const backdropOpacity = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const jazzCashIcon = contentList.find(item => item.id === 'JazzCash')?.icon;
  const easyPaisaIcon = contentList.find(item => item.id === 'EasyPaisa')?.icon;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, {opacity: backdropOpacity}]} />
      </TouchableWithoutFeedback>

      <AnimatedLinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[
          styles.sheet,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, height],
                  outputRange: [0, height],
                }),
              },
            ],
          },
        ]}>
        {/* Close Icon */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        {/* Modal Content */}
        <Animated.View style={[styles.container, {opacity: contentOpacity}]}>
          <Text style={styles.title}>{title}</Text>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            {/* Payment Info Banner */}
            <View style={styles.paymentInfoBanner}>
              <View style={styles.paymentIconsContainer}>
                {jazzCashIcon && (
                  <Image
                    source={jazzCashIcon}
                    style={styles.paymentInfoIcon}
                    resizeMode="contain"
                  />
                )}
                {easyPaisaIcon && (
                  <Image
                    source={easyPaisaIcon}
                    style={styles.paymentInfoIcon}
                    resizeMode="contain"
                  />
                )}
              </View>
              <Text style={styles.paymentInfoText}>
                JazzCash and EasyPaisa aren't connected to our app just yet —
                but no worries! You can still make your payment manually through
                the official apps.
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </AnimatedLinearGradient>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.5,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.03,
    overflow: 'hidden',
  },

  header: {
    alignItems: 'flex-end',
    marginBottom: height * 0.01,
  },

  closeButton: {
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.15,
    elevation: 6,
  },

  container: {
    flex: 1,
  },

  title: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.montserrat.bold,
    color: theme.colors.white,
    marginBottom: height * 0.02,
  },

  content: {
    paddingBottom: height * 0.02,
  },

  paymentInfoBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.medium,
    padding: width * 0.04,
    marginBottom: height * 0.03,
  },

  paymentIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * 0.015,
  },

  paymentInfoIcon: {
    width: width * 0.12,
    height: height * 0.06,
    marginHorizontal: width * 0.02,
  },

  paymentInfoText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.montserrat.regular,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 18,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.018,
  },

  icon: {
    width: width * 0.08,
    height: height * 0.04,
    marginRight: width * 0.04,
  },

  textContainer: {
    flex: 1,
  },
});
