/**
 * Confirmation modal for account deletion with animated Lottie illustration
 * Features warning animation, confirmation text, and action buttons
 * @param {Object} props - Component properties
 * @param {boolean} props.visible - Controls modal visibility
 * @param {string} props.title - Modal title text
 * @param {string} props.description - Modal description text
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onDeleteConfirm - Delete confirmation callback
 * @param {boolean} props.loading - Loading state for delete action
 */

import React from 'react';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../../styles/theme';

import deleteAnimation from '../../assets/animations/delete.json';

const {width, height} = Dimensions.get('screen');

const DeleteAccountModal = ({
  visible,
  title,
  description,
  onClose,
  onDeleteConfirm,
  loading = true,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {deleteAnimation ? (
            <LottieView
              source={deleteAnimation}
              autoPlay
              loop
              style={styles.animation}
            />
          ) : (
            <MaterialCommunityIcons
              name="warning"
              size={80}
              color={theme.colors.error}
              style={{marginBottom: 10}}
            />
          )}

          <Text style={styles.modalText}>{title}</Text>
          <Text style={styles.descriptionText}>{description}</Text>

          <View style={styles.btnContainer}>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <View style={styles.cancelContainer}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={width * 0.05}
                  color={theme.colors.white}
                  style={styles.icon}
                />
                <Text style={styles.cancelText}>Cancel</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={onDeleteConfirm} disabled={loading}>
              <View style={styles.deleteContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {loading ? (
                    <ActivityIndicator size={width * 0.05} color={theme.colors.white} />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="trash-can"
                        size={width * 0.05}
                        color={theme.colors.white}
                        style={styles.icon}
                      />
                      <Text style={styles.deleteText}>Delete</Text>
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

export default DeleteAccountModal;

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

  deleteContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.error,
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

  deleteText: {
    fontSize: width * 0.04,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.regular,
  },

  icon: {
    marginRight: width * 0.01,
  },
});
