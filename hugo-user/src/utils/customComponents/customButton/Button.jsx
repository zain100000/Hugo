/**
 * Customizable button component with loading states, icons, and multiple variants
 * Supports left/right icon positioning, disabled states, and custom styling
 * @param {Object} props - Component properties
 * @param {Function} props.onPress - Callback function when button is pressed
 * @param {string} props.title - Text content of the button
 * @param {boolean} props.loading - Loading state that shows activity indicator
 * @param {Object} props.style - Additional container styles
 * @param {Object} props.textStyle - Additional text styles
 * @param {number} props.width - Custom width for the button
 * @param {boolean} props.disabled - Disabled state of the button
 * @param {string} props.backgroundColor - Background color of the button
 * @param {string} props.textColor - Text color of the button
 * @param {string} props.iconName - Feather icon name for button icon
 * @param {number} props.iconSize - Size of the icon
 * @param {string} props.iconColor - Color of the icon
 * @param {Object} props.iconStyle - Additional icon styles
 * @param {string} props.iconPosition - Position of icon ('left' or 'right')
 */

import React from 'react';
import {TouchableOpacity, Text, ActivityIndicator, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {globalStyles} from '../../../styles/globalStyles';
import {theme} from '../../../styles/theme';

const Button = ({
  onPress,
  title,
  loading,
  style,
  textStyle,
  width,
  disabled,
  backgroundColor,
  textColor,
  iconName,
  iconSize = 20,
  iconColor,
  iconStyle,
  iconPosition = 'left',
}) => {
  const renderIcon = () =>
    iconName ? (
      <Feather
        name={iconName}
        size={iconSize}
        color={iconColor || textColor}
        style={[{marginHorizontal: 6}, iconStyle]}
      />
    ) : null;

  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          globalStyles.buttonPrimary,
          style,
          {
            width: width || 'auto',
            backgroundColor: disabled ? theme.colors.gray : backgroundColor,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 50,
          },
        ]}
        activeOpacity={disabled ? 1 : 0.9}>
        {loading ? (
          <View style={{height: 24}}>
            <ActivityIndicator
              color={textColor}
              size="small"
              style={{transform: [{scale: 1.2}]}}
            />
          </View>
        ) : (
          <>
            {iconPosition === 'left' && renderIcon()}
            <Text
              style={[globalStyles.textPrimary, textStyle, {color: textColor}]}>
              {title}
            </Text>
            {iconPosition === 'right' && renderIcon()}
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Button;
