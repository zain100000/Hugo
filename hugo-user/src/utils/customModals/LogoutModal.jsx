/**
 * Logout confirmation modal with animated illustration and authentication cleanup
 * Handles user logout process with Redux state management and navigation
 * @param {Object} props - Component properties
 * @param {boolean} props.visible - Controls modal visibility
 * @param {string} props.title - Modal title text
 * @param {string} props.description - Modal description text
 * @param {Function} props.onClose - Close modal callback
 */

import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';
import logoutAnimation from '../../assets/animations/logout.json';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../styles/theme';
import {logoutUser} from '../../redux/slices/auth.slice';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const {width, height} = Dimensions.get('screen');

const LogoutModal = ({visible, title, description, onClose}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const resultAction = await dispatch(logoutUser()).unwrap();

      if (resultAction.success) {
        await AsyncStorage.removeItem('authToken');

        Toast.show({
          type: 'success',
          text1: 'Logout Successful',
          text2:
            resultAction.message || 'You have been logged out successfully',
        });

        setTimeout(() => {
          navigation.replace('Signin');
        }, 2000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Logout Failed',
          text2: resultAction.message || 'Unknown error occurred',
        });
      }
    } catch (error) {
      const backendMessage =
        error?.backendMessage || error?.message || 'Something went wrong';
      Toast.show({
        type: 'error',
        text1: 'Logout Error',
        text2: backendMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <LottieView
            source={logoutAnimation}
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={styles.modalText}>{title}</Text>
          <Text style={styles.descriptionText}>{description}</Text>

          <View style={styles.btnContainer}>
            <TouchableOpacity onPress={onClose}>
              <View style={styles.cancelContainer}>
                <View style={styles.icon}>
                  <Ionicons
                    name="close-circle"
                    size={width * 0.05}
                    color={theme.colors.white}
                  />
                </View>
                <Text style={styles.cancelText}>Cancel</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout}>
              <View style={styles.proceedContainer}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  }}>
                  {loading ? (
                    <ActivityIndicator size={width * 0.05} color={theme.colors.white} />
                  ) : (
                    <>
                      <View style={styles.icon}>
                        <Ionicons
                          name="checkmark-circle"
                          size={width * 0.05}
                          color={theme.colors.white}
                        />
                      </View>
                      <Text style={styles.proceedText}>Proceed</Text>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  modalView: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: height * 0.02,
    alignItems: 'center',
    width: width * 0.92,
    height: height * 0.48,
  },

  animation: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: height * 0.04,
  },

  modalText: {
    marginBottom: height * 0.02,
    textAlign: 'center',
    fontSize: width * 0.05,
    color: theme.colors.dark,
    fontFamily: theme.typography.montserrat.regular,
  },

  descriptionText: {
    textAlign: 'center',
    color: theme.colors.secondary,
    fontFamily: theme.typography.montserrat.regular,
    fontSize: width * 0.04,
    marginBottom: height * 0.04,
  },

  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: theme.gap(2),
    width: '100%',
  },

  cancelContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.dark,
    borderRadius: theme.borderRadius.medium,
    gap: theme.gap(1),
    paddingVertical: height * 0.022,
    paddingHorizontal: height * 0.02,
    width: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  proceedContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.medium,
    gap: theme.gap(1),
    paddingVertical: height * 0.022,
    paddingHorizontal: height * 0.02,
    width: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelText: {
    fontSize: width * 0.04,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.regular,
  },

  proceedText: {
    fontSize: width * 0.04,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.regular,
  },

  icon: {
    marginRight: width * 0.01,
  },
});
