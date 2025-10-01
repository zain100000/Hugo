/**
 * Versatile input field component supporting text input and dropdown picker
 * Includes icon support, validation states, and customizable styling
 */
import React, {useState} from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {globalStyles} from '../../../styles/globalStyles';
import {theme} from '../../../styles/theme';

const {width, height} = Dimensions.get('screen');

const InputField = ({
  value,
  onChangeText,
  placeholder,
  style,
  inputStyle,
  secureTextEntry,
  editable,
  dropdownOptions,
  selectedValue,
  onValueChange,
  keyboardType,
  multiline,
  leftIcon,
  rightIcon,
  onRightIconPress,
}) => {
  const [open, setOpen] = useState(false);

  if (dropdownOptions) {
    return (
      <View style={[styles.dropdownWrapper, style]}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <DropDownPicker
          open={open}
          value={selectedValue}
          items={dropdownOptions}
          setOpen={setOpen}
          setValue={onValueChange}
          placeholder={placeholder}
          listMode="MODAL"
          modalProps={{
            animationType: 'fade',
          }}
          dropDownContainerStyle={[
            {
              backgroundColor: theme.colors.white,
              borderColor: theme.colors.primary,
            },
            inputStyle,
          ]}
          style={[
            {
              borderWidth: 0,
              backgroundColor: theme.colors.white,
              flex: 1,
              minHeight: height * 0.055,
            },
            inputStyle,
          ]}
          textStyle={{
            fontSize: theme.typography.fontSize.sm,
            fontFamily: theme.typography.montserrat.regular,
            color: theme.colors.primary,
          }}
          zIndex={5}
        />
      </View>
    );
  }

  return (
    <View style={[styles.inputWrapper, style]}>
      {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.primary}
        style={[
          globalStyles.input,
          styles.textInput,
          {
            backgroundColor: theme.colors.white,
            color: theme.colors.primary,
            borderWidth: 0,
          },
          multiline && {height: 160},
          inputStyle,
        ]}
        secureTextEntry={secureTextEntry}
        editable={editable}
        keyboardType={keyboardType}
        multiline={multiline}
      />
      {rightIcon && (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={onRightIconPress}
          activeOpacity={0.7}>
          {rightIcon}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.medium,
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.025,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    minHeight: height * 0.055,
  },

  dropdownWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
    minHeight: height * 0.055,
  },

  leftIconContainer: {
    paddingHorizontal: width * 0.034,
    zIndex: 1,
  },

  rightIconContainer: {
    paddingHorizontal: width * 0.014,
    padding: height * 0.012,
  },
});
