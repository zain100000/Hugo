import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../../styles/theme';

const {width, height} = Dimensions.get('screen');

const MessageHeader = ({userName = 'User Name', profilePicture}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <MaterialCommunityIcons
          name="chevron-left"
          size={width * 0.08}
          color={theme.colors.white}
        />
      </TouchableOpacity>

      {/* Profile Picture */}
      <Image
        source={
          profilePicture
            ? {uri: profilePicture}
            : require('../../../assets/placeholders/default-avatar.png')
        }
        style={styles.avatar}
      />

      {/* Username */}
      <Text style={styles.userName} numberOfLines={1}>
        {userName}
      </Text>

      {/* Placeholder for spacing (to center title properly) */}
      <View style={{width: width * 0.08}} />
    </View>
  );
};

export default MessageHeader;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: height * 0.08,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
    backgroundColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  backButton: {
    width: width * 0.08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  userName: {
    flex: 1,
    marginLeft: width * 0.03,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.montserrat.semiBold,
    color: theme.colors.white,
  },
});
