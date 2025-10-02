/**
 * Custom Bottom Sheet Component for selecting height, weight, nationality, or address
 * @param {Object} props - Component properties
 * @param {boolean} props.visible - Controls visibility
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onConfirm - Confirm selection callback
 * @param {string} props.type - 'height', 'weight', 'nationality', 'address'
 * @param {any} props.currentValue - Current selected value
 */

import React, {useRef, useEffect, useState} from 'react';
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
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../../../styles/theme';

const {width, height} = Dimensions.get('screen');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const BottomSheet = ({visible, onClose, onConfirm, type, currentValue}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const [selectedValue, setSelectedValue] = useState(currentValue);

  const countries = [
    {code: 'PK', name: 'Pakistan', flag: '🇵🇰'},
    {code: 'DE', name: 'Germany', flag: '🇩🇪'},
    {code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦'},
    {code: 'EG', name: 'Egypt', flag: '🇪🇬'},
    {code: 'LB', name: 'Lebanon', flag: '🇱🇧'},
    {code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪'},
    {code: 'KW', name: 'Kuwait', flag: '🇰🇼'},
    {code: 'OM', name: 'Oman', flag: '🇴🇲'},
    {code: 'QA', name: 'Qatar', flag: '🇶🇦'},
    {code: 'BH', name: 'Bahrain', flag: '🇧🇭'},
    {code: 'JO', name: 'Jordan', flag: '🇯🇴'},
    {code: 'MA', name: 'Morocco', flag: '🇲🇦'},
    {code: 'LY', name: 'Libya', flag: '🇱🇾'},
    {code: 'PS', name: 'Palestinian Territory', flag: '🇵🇸'},
    {code: 'TR', name: 'Turkey', flag: '🇹🇷'},
    {code: 'IN', name: 'India', flag: '🇮🇳'},
    {code: 'ID', name: 'Indonesia', flag: '🇮🇩'},
    {code: 'MY', name: 'Malaysia', flag: '🇲🇾'},
    {code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿'},
  ];

  const getOptions = () => {
    switch (type) {
      case 'height':
        return Array.from({length: 71}, (_, i) => 140 + i);
      case 'weight':
        return Array.from({length: 81}, (_, i) => 40 + i);
      case 'nationality':
      case 'address':
        return countries;
      default:
        return [];
    }
  };

  const options = getOptions();

  const getTitleAndUnit = () => {
    switch (type) {
      case 'height':
        return {title: 'What is your height?', unit: 'cm'};
      case 'weight':
        return {title: 'What is your weight?', unit: 'kg'};
      case 'nationality':
        return {title: 'Select Nationality', unit: ''};
      case 'address':
        return {title: 'Select Current Address', unit: ''};
      default:
        return {title: 'Select', unit: ''};
    }
  };

  const {title, unit} = getTitleAndUnit();

  useEffect(() => {
    if (visible) {
      setSelectedValue(currentValue);
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

  const handleConfirm = () => {
    if (selectedValue !== null && selectedValue !== undefined)
      onConfirm(selectedValue);
    onClose();
  };

  const handleCancel = () => {
    setSelectedValue(currentValue);
    onClose();
  };

  const renderOption = (option, index) => {
    const isSelected =
      type === 'nationality' || type === 'address'
        ? option.name === selectedValue?.name
        : option === selectedValue;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.option,
          isSelected && styles.selectedOption,
          {transform: [{scale: isSelected ? 1.05 : 1}]},
        ]}
        onPress={() => setSelectedValue(option)}>
        {type === 'nationality' || type === 'address' ? (
          <>
            <Text style={styles.flagText}>{option.flag}</Text>
            <Text
              style={[styles.countryName, isSelected && styles.selectedText]}>
              {option.name}
            </Text>
          </>
        ) : (
          <Text style={[styles.optionText, isSelected && styles.selectedText]}>
            {option} {unit}
          </Text>
        )}
        {isSelected && (
          <MaterialCommunityIcons
            name="check"
            size={22}
            color={theme.colors.success}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal transparent visible={visible} onRequestClose={handleCancel}>
      <TouchableWithoutFeedback onPress={handleCancel}>
        <Animated.View style={[styles.overlay, {opacity: backdropOpacity}]} />
      </TouchableWithoutFeedback>

      <AnimatedLinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.sheet, {transform: [{translateY: slideAnim}]}]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <MaterialCommunityIcons
              name="close"
              size={22}
              color={theme.colors.error}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.confirmTextContainer}>
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.container, {opacity: contentOpacity}]}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}>
            {options.map((option, index) => renderOption(option, index))}
          </ScrollView>
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
    height: height * 0.65,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.03,
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmTextContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  confirmText: {
    color: theme.colors.success,
    fontSize: 16,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  container: {flex: 1},

  title: {
    fontSize: 18,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: height * 0.02,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  optionsContainer: {flex: 1},

  optionsContent: {paddingBottom: 10},

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  selectedOption: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: theme.colors.success,
  },

  optionText: {
    color: theme.colors.white,
    flex: 1,
    fontFamily: theme.typography.montserrat.medium,
  },

  countryName: {
    color: theme.colors.white,
    flex: 1,
    marginLeft: 8,
    fontFamily: theme.typography.montserrat.medium,
  },

  selectedText: {
    fontFamily: theme.typography.montserrat.semiBold,
    color: theme.colors.white,
  },

  flagText: {fontSize: 18},
});
