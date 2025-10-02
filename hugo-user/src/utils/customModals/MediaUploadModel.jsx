/**
 * Media selection modal with camera and gallery options
 * Supports both images and videos with upload handling
 * @param {Object} props - Component properties
 * @param {boolean} props.visible - Controls modal visibility
 * @param {string} props.title - Modal title text
 * @param {string} props.description - Modal description text
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onMediaUpload - Media selection callback
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import {theme} from '../../styles/theme';
import uploadAnimation from '../../assets/animations/image.json';

const {width, height} = Dimensions.get('screen');

const MediaUploadModal = ({
  visible,
  title,
  description,
  onClose,
  onMediaUpload,
}) => {
  const [picking, setPicking] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleMediaSelection = async media => {
    if (!media) return;
    setPicking(false);
    setUploading(true);
    try {
      await onMediaUpload({
        path: media.path,
        mime: media.mime,
        size: media.size,
        width: media.width,
        height: media.height,
        duration: media.duration,
        type: media.mime?.includes('video') ? 'video' : 'photo',
      });
      onClose();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: err.message || 'Something went wrong while uploading media.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePickMedia = async () => {
    setPicking(true);
    try {
      const media = await ImagePicker.openPicker({mediaType: 'any'});
      await handleMediaSelection(media);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Toast.show({
          type: 'error',
          text1: 'Gallery Error',
          text2: 'Something went wrong while picking media.',
        });
      }
    } finally {
      setPicking(false);
    }
  };

  const handleOpenCamera = async () => {
    setPicking(true);
    try {
      const media = await ImagePicker.openCamera({mediaType: 'any'});
      await handleMediaSelection(media);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Toast.show({
          type: 'error',
          text1: 'Camera Error',
          text2: 'Something went wrong while opening the camera.',
        });
      }
    } finally {
      setPicking(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <LottieView
            source={uploadAnimation}
            autoPlay
            loop
            style={styles.animation}
          />

          <Text style={styles.modalText}>{title}</Text>
          <Text style={styles.descriptionText}>{description}</Text>

          <View style={styles.btnContainer}>
            <TouchableOpacity disabled={uploading} onPress={handleOpenCamera}>
              <View style={styles.cameraContainer}>
                {picking && !uploading ? (
                  <ActivityIndicator
                    size={width * 0.05}
                    color={theme.colors.white}
                  />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="camera"
                      size={width * 0.05}
                      color={theme.colors.white}
                      style={styles.icon}
                    />
                    <Text style={styles.cameraText}>Camera</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity disabled={uploading} onPress={handlePickMedia}>
              <View style={styles.galleryContainer}>
                {picking || uploading ? (
                  <ActivityIndicator
                    size={width * 0.05}
                    color={theme.colors.white}
                  />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="image-multiple"
                      size={width * 0.05}
                      color={theme.colors.white}
                      style={styles.icon}
                    />
                    <Text style={styles.galleryText}>Gallery</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MediaUploadModal;

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

  cameraContainer: {
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

  galleryContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    gap: theme.gap(1),
    paddingVertical: height * 0.022,
    paddingHorizontal: height * 0.02,
    width: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraText: {
    fontSize: width * 0.04,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.regular,
  },

  galleryText: {
    fontSize: width * 0.04,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.regular,
  },

  icon: {
    marginRight: width * 0.01,
  },
});
