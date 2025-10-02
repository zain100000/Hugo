/**
 * MediaGallery screen component
 */

import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  StatusBar,
  Dimensions,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../../../styles/theme';
import {globalStyles} from '../../../styles/globalStyles';
import Header from '../../../utils/customComponents/customHeader/Header';
import Logo from '../../../assets/splashScreen/splash-logo.png';
import {useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {uploadMedia} from '../../../redux/slices/media.slice';
import {getUser} from '../../../redux/slices/user.slice';
import MediaUploadModal from '../../../utils/customModals/MediaUploadModel';
import Toast from 'react-native-toast-message';

const {width, height} = Dimensions.get('screen');

const MediaGallery = () => {
  const route = useRoute();
  const dispatch = useDispatch();

  // Get user data from Redux store
  const user = useSelector(state => state.auth.user);
  const userProfile = useSelector(state => state.user.user);

  // Get media from route params or user profile
  const mediaFromParams = route.params?.media || [];
  const mediaFromProfile = userProfile?.media || [];
  const initialMedia =
    mediaFromParams.length > 0 ? mediaFromParams : mediaFromProfile;

  const [mediaList, setMediaList] = useState(initialMedia);
  const [showMediaUploadModal, setShowMediaUploadModal] = useState(false);

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
    StatusBar.setBarStyle('light-content');
  }, []);

  // Update media list when user profile changes
  useEffect(() => {
    if (userProfile?.media) {
      setMediaList(userProfile.media);
    }
  }, [userProfile?.media]);

  const gradientColors = [theme.colors.primary, theme.colors.tertiary];

  const handleMediaUpload = async media => {
    try {
      const formData = new FormData();
      formData.append('mediaImage', {
        uri: media.path,
        type: media.mime,
        name: `media_${Date.now()}.${media.mime.split('/')[1]}`,
      });

      const result = await dispatch(uploadMedia(formData));

      if (uploadMedia.fulfilled.match(result)) {
        const uploaded = result.payload.media;

        // Update local state immediately
        setMediaList(prev => [...prev, uploaded]);

        // Refresh user data from server to get updated media list
        if (user?.id) {
          dispatch(getUser(user.id));
        }

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: result.payload?.message || 'Media uploaded successfully',
        });
      } else {
        throw new Error(result.payload?.message || 'Failed to upload media');
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failure',
        text2: err.message,
      });
    } finally {
      setShowMediaUploadModal(false);
    }
  };

  const renderMediaGrid = () => {
    return (
      <ScrollView contentContainerStyle={styles.gridContainer}>
        {/* Add Media Button */}
        <TouchableOpacity
          style={styles.addMediaButton}
          onPress={() => setShowMediaUploadModal(true)}>
          <MaterialCommunityIcons
            name="plus"
            size={width * 0.08}
            color={theme.colors.white}
          />
        </TouchableOpacity>

        {/* Media Items */}
        {mediaList.map((item, index) => (
          <TouchableOpacity key={index} style={styles.mediaItem}>
            <Image
              source={{uri: item.url}}
              style={styles.mediaImage}
              resizeMode="cover"
            />
            {item.type === 'video' && (
              <View style={styles.videoIndicator}>
                <MaterialCommunityIcons
                  name="play"
                  size={width * 0.04}
                  color={theme.colors.white}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[globalStyles.container, styles.container]}>
      <View style={styles.headerContainer}>
        <Header title="Media Gallery" logo={Logo} />
      </View>

      <View style={styles.contentContainer}>
        {/* Media Grid */}
        {renderMediaGrid()}
      </View>

      {/* Media Upload Modal */}
      <MediaUploadModal
        visible={showMediaUploadModal}
        onClose={() => setShowMediaUploadModal(false)}
        title="Upload Media"
        description="Choose photo or video"
        currentCount={mediaList.length}
        maxCount={30}
        allowVideos={true}
        onMediaUpload={handleMediaUpload}
      />
    </LinearGradient>
  );
};

export default MediaGallery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    width: '100%',
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.04,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: height * 0.02,
    gap: theme.gap(1),
  },

  addMediaButton: {
    width: (width - width * 0.12) / 3,
    height: (width - width * 0.12) / 3,
    borderRadius: theme.borderRadius.small,
    borderWidth: 2,
    borderColor: theme.colors.white,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '40',
    marginBottom: width * 0.02,
  },

  mediaItem: {
    width: (width - width * 0.12) / 3,
    height: (width - width * 0.12) / 3,
    borderRadius: theme.borderRadius.small,
    overflow: 'hidden',
    marginBottom: width * 0.02,
    position: 'relative',
  },

  mediaImage: {
    width: '100%',
    height: '100%',
  },

  videoIndicator: {
    position: 'absolute',
    top: height * 0.008,
    right: width * 0.008,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: theme.borderRadius.circle,
    width: width * 0.06,
    height: width * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
