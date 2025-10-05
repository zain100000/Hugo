/**
 * Receipt Upload Modal
 * User can upload payment receipt using Camera or Gallery
 * Only two options, no extra buttons
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

const ReceiptUploadModal = ({visible, onClose, onUpload}) => {
  const [loading, setLoading] = useState(false);

  const handleImageSelection = image => {
    if (!image) return;
    setLoading(false);
    onUpload(image); // return full image object (uri, mime, etc.)
    onClose();
  };

  const handlePickImage = async () => {
    setLoading(true);
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
      });
      handleImageSelection(image);
    } catch (error) {
      console.error('Image Picker Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Image Selection Failed',
        text2: 'Something went wrong while picking the image.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCamera = async () => {
    setLoading(true);
    try {
      const image = await ImagePicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
      });
      handleImageSelection(image);
    } catch (error) {
      console.error('Camera Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Camera Error',
        text2: 'Something went wrong while opening the camera.',
      });
    } finally {
      setLoading(false);
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
          {uploadAnimation ? (
            <LottieView
              source={uploadAnimation}
              autoPlay
              loop
              style={styles.animation}
            />
          ) : (
            <Text style={{color: 'red', marginBottom: 10}}>
              Animation failed to load.
            </Text>
          )}

          <Text style={styles.modalText}>Upload Receipt</Text>
          <Text style={styles.descriptionText}>
            Choose your payment receipt from camera or gallery
          </Text>

          <View style={styles.btnContainer}>
            <TouchableOpacity onPress={handleOpenCamera}>
              <View style={styles.cameraContainer}>
                <MaterialCommunityIcons
                  name="camera"
                  size={width * 0.05}
                  color={theme.colors.white}
                  style={styles.icon}
                />
                <Text style={styles.cameraText}>Camera</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePickImage}>
              <View style={styles.galleryContainer}>
                {loading ? (
                  <ActivityIndicator
                    size={width * 0.05}
                    color={theme.colors.white}
                  />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="image"
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

export default ReceiptUploadModal;

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
