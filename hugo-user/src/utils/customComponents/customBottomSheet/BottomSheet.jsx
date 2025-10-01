/**
 * Animated bottom sheet component for displaying order summaries and cart items
 * Features smooth slide animations, gradient backgrounds, and interactive elements
 * @param {Object} props - Component properties
 * @param {boolean} props.visible - Controls the visibility of the bottom sheet
 * @param {Function} props.onClose - Callback function when bottom sheet is closed
 * @param {Array} props.cartItems - Array of cart items to display in the summary
 */

import React, {useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Text,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import {theme} from '../../../styles/theme';

const {width, height} = Dimensions.get('screen');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const BottomSheet = ({visible, onClose, cartItems}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );

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
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={width * 0.054} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.container, {opacity: contentOpacity}]}>
          <Text style={styles.title}>Order Summary</Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather
                name="shopping-bag"
                size={20}
                color={theme.colors.white}
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionLabel}>Your Items</Text>
            </View>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemContent}>
                  <Text style={styles.itemText} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemSubtext}>
                    {item.quantity} × PKR {item.unitPrice.toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  PKR {(item.unitPrice * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </AnimatedLinearGradient>
    </Modal>
  );
};

export default BottomSheet;

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
    height: height * 0.6,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    paddingHorizontal: width * 0.04,
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
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.montserrat.semiBold,
    color: theme.colors.white,
    marginBottom: height * 0.02,
  },

  section: {
    marginBottom: height * 0.02,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },

  sectionIcon: {
    marginRight: width * 0.02,
  },

  sectionLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.montserrat.medium,
    color: theme.colors.white,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  itemContent: {
    flex: 1,
    marginRight: width * 0.02,
  },

  itemText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.medium,
    color: theme.colors.white,
  },

  itemSubtext: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.regular,
    color: theme.colors.gray,
  },

  itemPrice: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.semiBold,
    color: theme.colors.white,
  },
});
