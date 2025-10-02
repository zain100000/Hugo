/**
 * EditProfile Screen Component
 *
 * Screen for updating user profile information including profile picture, username,
 * media gallery, and personal information display.
 *
 * @component
 * @param {Object} route - React Navigation route object containing user data
 * @param {Object} navigation - React Navigation navigation object
 * @returns {React.Component} Edit profile screen
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Text,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../../../styles/theme';
import {globalStyles} from '../../../styles/globalStyles';
import Header from '../../../utils/customComponents/customHeader/Header';
import Logo from '../../../assets/splashScreen/splash-logo.png';
import ImageUploadModal from '../../../utils/customModals/ImageUploadModal';
import InputField from '../../../utils/customComponents/customInputField/InputField';
import {useDispatch, useSelector} from 'react-redux';
import {updateUser, getUser} from '../../../redux/slices/user.slice';
import Toast from 'react-native-toast-message';
import BottomSheet from '../../../utils/customComponents/customBottomSheet/BottomSheet';
import countriesData from '../../../utils/json/Countries.json';
import MediaUploadModal from '../../../utils/customModals/MediaUploadModel';
import {uploadMedia} from '../../../redux/slices/media.slice';

const {width, height} = Dimensions.get('screen');

const EditProfile = ({route, navigation}) => {
  const dispatch = useDispatch();
  const user = route.params?.user;

  // Get updated user data from Redux store
  const {user: updatedUser, loading: userLoading} = useSelector(
    state => state.user,
  );

  // Use Redux store data when available, otherwise use route params
  const currentUser = updatedUser || user;

  const userMedia = currentUser?.media || [];
  const mediaCount = userMedia.length;

  const [photoURL, setPhotoURL] = useState(currentUser?.profilePicture || '');
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(
    currentUser?.userName || '',
  );
  const [username, setUsername] = useState(currentUser?.userName || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState(currentUser?.bio || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // Bottom Sheet States
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetType, setBottomSheetType] = useState('');
  const [bottomSheetCurrentValue, setBottomSheetCurrentValue] = useState(null);
  const [userHeight, setUserHeight] = useState(currentUser?.height || null);
  const [userWeight, setUserWeight] = useState(currentUser?.weight || null);
  const [userNationality, setUserNationality] = useState(
    currentUser?.nationality || null,
  );
  const [userAddress, setUserAddress] = useState(
    currentUser?.currentAddress || null,
  );

  // Media States
  const [showMediaUploadModal, setShowMediaUploadModal] = useState(false);
  const [userMediaList, setUserMediaList] = useState(userMedia); // local media state

  // Fetch latest user data when component mounts or when updatedUser changes
  useEffect(() => {
    if (currentUser?._id) {
      // Update local states when Redux store updates
      setUsername(currentUser.userName || '');
      setBio(currentUser.bio || '');
      setPhotoURL(currentUser.profilePicture || '');
      setUserHeight(currentUser.height || null);
      setUserWeight(currentUser.weight || null);
      setUserNationality(currentUser.nationality || null);
      setUserAddress(currentUser.currentAddress || null);
      setUserMediaList(currentUser.media || []);
    }
  }, [currentUser]);

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
    StatusBar.setBarStyle('light-content');
  }, []);

  const handleImageUpload = url => {
    setPhotoURL(url);
    setShowImageUploadModal(false);
  };

  const calculateAge = dob => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate)) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatRegistrationDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const dobString = currentUser?.dob?.$date || currentUser?.dob;
  const age = calculateAge(dobString);
  const isMale = currentUser?.gender?.toUpperCase() === 'MALE';

  const handleUpdateName = async () => {
    if (!editedUsername.trim()) {
      Toast.show({type: 'error', text1: 'Username cannot be empty'});
      return;
    }
    if (editedUsername.trim() === username) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    try {
      const resultAction = await dispatch(
        updateUser({
          userId: currentUser._id,
          formData: {userName: editedUsername.trim()},
        }),
      );
      if (updateUser.fulfilled.match(resultAction)) {
        const response = resultAction.payload;

        // Update local state immediately
        setUsername(editedUsername.trim());
        setIsEditing(false);

        // Refresh user data from server
        dispatch(getUser(currentUser._id));

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.message || 'Username updated successfully',
        });
      } else {
        const error = resultAction.payload || resultAction.error;
        throw new Error(error?.message || 'Failed to update username');
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failure',
        text2: err.message || 'Failed to update username',
      });
      setEditedUsername(username);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBio = async () => {
    if (!editedBio.trim()) {
      Toast.show({type: 'error', text1: 'Bio cannot be empty'});
      return;
    }
    if (editedBio.trim() === bio) {
      setIsEditingBio(false);
      return;
    }
    setLoading(true);
    try {
      const resultAction = await dispatch(
        updateUser({
          userId: currentUser._id,
          formData: {bio: editedBio.trim()},
        }),
      );
      if (updateUser.fulfilled.match(resultAction)) {
        const response = resultAction.payload;

        // Update local state immediately
        setBio(editedBio.trim());
        setIsEditingBio(false);

        // Refresh user data from server
        dispatch(getUser(currentUser._id));

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.message || 'Bio updated successfully',
        });
      } else {
        const error = resultAction.payload || resultAction.error;
        throw new Error(error?.message || 'Failed to update bio');
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failure',
        text2: err.message || 'Failed to update bio',
      });
      setEditedBio(bio);
    } finally {
      setLoading(false);
    }
  };

  const cancelEditingBio = () => {
    setEditedBio(bio);
    setIsEditingBio(false);
  };

  const startEditingBio = () => {
    setEditedBio(bio);
    setIsEditingBio(true);
  };

  const cancelEditing = () => {
    setEditedUsername(username);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditedUsername(username);
    setIsEditing(true);
  };

  const handleMediaNavigate = () => {
    navigation.navigate('Media_Gallery', {media: userMediaList});
  };

  const getZodiacSign = dob => {
    if (!dob) return 'N/A';
    const date = new Date(dob);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
      return 'Aquarius';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20))
      return 'Pisces';
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19))
      return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
      return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
      return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22))
      return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22))
      return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
      return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
      return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
      return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
      return 'Capricorn';
    return 'N/A';
  };

  const handleInfoEdit = field => {
    // Editable fields only
    switch (field) {
      case 'height':
        navigation.navigate('EditHeight', {user: currentUser});
        break;
      case 'weight':
        navigation.navigate('EditWeight', {user: currentUser});
        break;
      case 'occupation':
        navigation.navigate('EditOccupation', {user: currentUser});
        break;
      case 'address':
        navigation.navigate('EditAddress', {user: currentUser});
        break;
      default:
        break;
    }
  };

  const InformationRow = ({label, value, iconName, field}) => {
    const nonEditableFields = ['birthday', 'constellation', 'registration'];

    // Get flag by country name
    const getCountryFlag = countryName => {
      if (!countryName) return '';
      const country = countriesData.countries.find(
        c => c.name.toLowerCase() === countryName.toLowerCase(),
      );
      return country ? country.flag : '';
    };

    const handlePress = () => {
      if (nonEditableFields.includes(field)) return;

      let currentValue;
      switch (field) {
        case 'height':
          currentValue = userHeight || 170;
          handleOpenBottomSheet('height', currentValue);
          break;
        case 'weight':
          currentValue = userWeight || 65;
          handleOpenBottomSheet('weight', currentValue);
          break;
        case 'nationality':
          currentValue =
            countriesData.countries.find(
              country => country.name === userNationality,
            ) || countriesData.countries[0];
          handleOpenBottomSheet('nationality', currentValue);
          break;
        case 'address':
          currentValue =
            countriesData.countries.find(
              country => country.name === userAddress,
            ) || countriesData.countries[0];
          handleOpenBottomSheet('address', currentValue);
          break;
        default:
          break;
      }
    };

    const showFlag = field === 'nationality' || field === 'address';

    return (
      <TouchableOpacity
        style={styles.infoRow}
        onPress={handlePress}
        activeOpacity={nonEditableFields.includes(field) ? 1 : 0.7}>
        <View style={styles.infoLeft}>
          <MaterialCommunityIcons
            name={iconName}
            size={width * 0.05}
            color={theme.colors.white}
            style={styles.infoIcon}
          />
          <Text style={styles.infoLabel}>{label}</Text>
        </View>

        <View style={styles.infoRight}>
          {showFlag && (
            <Text style={{fontSize: width * 0.05, marginRight: 6}}>
              {getCountryFlag(value)}
            </Text>
          )}
          <Text style={styles.infoValue}>{value || 'N/A'}</Text>
          {!nonEditableFields.includes(field) && (
            <MaterialCommunityIcons
              name="chevron-right"
              size={width * 0.05}
              color={theme.colors.white}
              style={styles.chevronIcon}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleOpenBottomSheet = (type, currentValue) => {
    setBottomSheetType(type);
    setBottomSheetCurrentValue(currentValue);
    setShowBottomSheet(true);
  };

  const handleBottomSheetConfirm = async selectedValue => {
    try {
      let formData = {};

      switch (bottomSheetType) {
        case 'height':
          formData = {height: selectedValue};
          setUserHeight(selectedValue); // update local UI state immediately
          break;
        case 'weight':
          formData = {weight: selectedValue};
          setUserWeight(selectedValue);
          break;
        case 'nationality':
          formData = {nationality: selectedValue.name};
          setUserNationality(selectedValue.name);
          break;
        case 'address':
          formData = {currentAddress: selectedValue.name};
          setUserAddress(selectedValue.name);
          break;
        default:
          return;
      }

      const resultAction = await dispatch(
        updateUser({
          userId: currentUser._id,
          formData,
        }),
      );

      if (updateUser.fulfilled.match(resultAction)) {
        const backendMessage =
          resultAction.payload?.message ||
          `${bottomSheetType} updated successfully`;

        // Update local state immediately
        switch (bottomSheetType) {
          case 'height':
            setUserHeight(selectedValue);
            break;
          case 'weight':
            setUserWeight(selectedValue);
            break;
          case 'nationality':
            setUserNationality(selectedValue.name);
            break;
          case 'address':
            setUserAddress(selectedValue.name);
            break;
        }

        // Refresh user data from server
        dispatch(getUser(currentUser._id));

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: backendMessage,
        });
      } else {
        const backendError =
          resultAction.payload?.message ||
          resultAction.error?.message ||
          `Failed to update ${bottomSheetType}`;
        throw new Error(backendError);
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || `Failed to update ${bottomSheetType}`,
      });
    }
  };

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
        setUserMediaList(prev => [...prev, uploaded]);

        // Refresh user data from server to get updated media list
        dispatch(getUser(currentUser._id));

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

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[globalStyles.container, styles.container]}>
      <SafeAreaView style={globalStyles.container}>
        <Header title="Update Profile Picture" logo={Logo} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.imgContainer}>
            {photoURL ? (
              <Image source={{uri: photoURL}} style={styles.img} />
            ) : (
              <Image
                source={require('../../../assets/placeholders/default-avatar.png')}
                style={styles.img}
              />
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowImageUploadModal(true)}
              style={styles.cameraIconContainer}>
              <MaterialCommunityIcons
                name="camera"
                size={width * 0.08}
                color={theme.colors.white}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.usernameContainer}>
            {isEditing ? (
              <View style={styles.editingContainer}>
                <InputField
                  value={editedUsername}
                  onChangeText={setEditedUsername}
                  placeholder="Enter username"
                  style={styles.inputField}
                  autoFocus
                  onSubmitEditing={handleUpdateName}
                  returnKeyType="done"
                  rightIcon={
                    <View style={styles.editIconsContainer}>
                      <TouchableOpacity
                        onPress={handleUpdateName}
                        style={styles.iconButton}
                        disabled={loading}>
                        {loading ? (
                          <MaterialCommunityIcons
                            name="loading"
                            size={width * 0.05}
                            color={theme.colors.secondary}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name="check"
                            size={width * 0.05}
                            color={theme.colors.success}
                          />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={cancelEditing}
                        style={styles.iconButton}
                        disabled={loading}>
                        <MaterialCommunityIcons
                          name="close"
                          size={width * 0.05}
                          color={theme.colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  }
                />
              </View>
            ) : (
              <View style={styles.displayContainer}>
                <Text style={styles.userNameText}>{username}</Text>
                <TouchableOpacity
                  onPress={startEditing}
                  style={styles.iconButton}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={width * 0.05}
                    color={theme.colors.white}
                  />
                </TouchableOpacity>
              </View>
            )}

            {isEditingBio ? (
              <View style={styles.editingContainer}>
                <InputField
                  value={editedBio}
                  onChangeText={setEditedBio}
                  placeholder="Enter bio"
                  style={[styles.inputField, {marginTop: height * 0.015}]}
                  autoFocus
                  onSubmitEditing={handleUpdateBio}
                  returnKeyType="done"
                  rightIcon={
                    <View style={styles.editIconsContainer}>
                      <TouchableOpacity
                        onPress={handleUpdateBio}
                        style={styles.iconButton}
                        disabled={loading}>
                        {loading ? (
                          <MaterialCommunityIcons
                            name="loading"
                            size={width * 0.05}
                            color={theme.colors.secondary}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name="check"
                            size={width * 0.05}
                            color={theme.colors.success}
                          />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={cancelEditingBio}
                        style={styles.iconButton}
                        disabled={loading}>
                        <MaterialCommunityIcons
                          name="close"
                          size={width * 0.05}
                          color={theme.colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  }
                />
              </View>
            ) : (
              <View style={styles.displayContainer}>
                <Text style={[styles.bioText, !bio && styles.placeholderText]}>
                  {bio || 'Add a bio'}
                </Text>
                <TouchableOpacity
                  onPress={startEditingBio}
                  style={styles.iconButton}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={width * 0.05}
                    color={theme.colors.white}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.ageContainer}>
            {age !== null && (
              <View
                style={[
                  styles.ageCircle,
                  {backgroundColor: isMale ? '#4A90E2' : '#FF69B4'},
                ]}>
                <MaterialCommunityIcons
                  name={isMale ? 'gender-male' : 'gender-female'}
                  size={width * 0.05}
                  color={theme.colors.white}
                  style={{marginRight: width * 0.01}}
                />
                <Text style={styles.ageText}>{age}</Text>
              </View>
            )}
          </View>

          <View style={styles.mediaContainer}>
            <View style={styles.separator} />
            <View style={styles.mediaHeaderContainer}>
              <Text style={styles.headerText}>Media</Text>

              <TouchableOpacity
                style={styles.mediaCountContainer}
                onPress={handleMediaNavigate}>
                <Text style={styles.mediaCountText}>
                  {userMediaList.length}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={width * 0.06}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </View>

            {userMediaList.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.mediaScroll}>
                {userMediaList.map((item, index) => (
                  <Image
                    key={index}
                    source={{uri: item.url}}
                    style={styles.mediaThumbnail}
                  />
                ))}

                {/* Add Media Button - Same size as thumbnails */}
                {userMediaList.length && (
                  <TouchableOpacity
                    style={styles.addMediaBox}
                    onPress={() => setShowMediaUploadModal(true)}>
                    <MaterialCommunityIcons
                      name="plus"
                      size={width * 0.08}
                      color={theme.colors.white}
                    />
                  </TouchableOpacity>
                )}
              </ScrollView>
            ) : (
              <View style={styles.noMediaContainer}>
                <MaterialCommunityIcons
                  name="image-off"
                  size={width * 0.1}
                  color={theme.colors.white + '80'}
                />
                <View style={styles.noMediaTextContainer}>
                  <Text style={styles.noMediaText}>No Media Uploaded</Text>
                  <TouchableOpacity
                    style={styles.smallAddMediaBox}
                    onPress={() => setShowMediaUploadModal(true)}>
                    <MaterialCommunityIcons
                      name="plus"
                      size={width * 0.05}
                      color={theme.colors.white}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.separator} />
          </View>

          <View style={styles.informationContainer}>
            <View style={styles.infoHeaderContainer}>
              <Text style={styles.headerText}>Information</Text>
            </View>

            <View style={styles.infoContent}>
              <InformationRow
                label="Height"
                value={userHeight ? `${userHeight}cm` : 'N/A'}
                iconName="human-male-height"
                field="height"
              />
              <InformationRow
                label="Weight"
                value={userWeight ? `${userWeight}kg` : 'N/A'}
                iconName="weight-kilogram"
                field="weight"
              />
              <InformationRow
                label="Occupation"
                value={currentUser?.occupation || 'N/A'}
                iconName="briefcase-outline"
                field="occupation"
              />
              <InformationRow
                label="Current Address"
                value={userAddress || 'N/A'}
                iconName="map-marker-outline"
                field="address"
              />
              <InformationRow
                label="Nationality"
                value={userNationality || 'N/A'}
                iconName="flag-outline"
                field="nationality"
              />
              <InformationRow
                label="Birthday"
                value={formatDate(dobString)}
                iconName="cake-variant-outline"
                field="birthday"
              />
              <InformationRow
                label="Constellation"
                value={getZodiacSign(dobString)}
                iconName="star"
                field="constellation"
              />
              <InformationRow
                label="Registration"
                value={formatRegistrationDate(
                  currentUser?.createdAt?.$date || currentUser?.createdAt,
                )}
                iconName="calendar-clock"
                field="registration"
              />
            </View>
          </View>
        </ScrollView>

        <ImageUploadModal
          visible={showImageUploadModal}
          onClose={() => setShowImageUploadModal(false)}
          onImageUpload={handleImageUpload}
          title="Upload Profile Picture"
          description="Choose your profile picture from camera or gallery"
        />

        <BottomSheet
          visible={showBottomSheet}
          onClose={() => setShowBottomSheet(false)}
          onConfirm={handleBottomSheetConfirm}
          type={bottomSheetType}
          currentValue={bottomSheetCurrentValue}
        />

        <MediaUploadModal
          visible={showMediaUploadModal}
          onClose={() => setShowMediaUploadModal(false)}
          title="Upload Media"
          description="Choose photo or video (max 3)"
          currentCount={userMediaList.length}
          allowVideos={true}
          onMediaUpload={handleMediaUpload}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {flex: 1},

  imgContainer: {
    position: 'relative',
    width: '100%',
    height: height * 0.34,
  },

  img: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    borderWidth: 0,
    resizeMode: 'cover',
  },

  cameraIconContainer: {
    position: 'absolute',
    bottom: height * 0.01,
    right: width * 0.04,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    padding: width * 0.015,
    justifyContent: 'center',
    alignItems: 'center',
  },

  usernameContainer: {
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.04,
  },

  editingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: height * 0.01,
  },

  inputField: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
  },

  editIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  userNameText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.bold,
    flex: 1,
  },

  bioText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.medium,
    flex: 1,
  },

  placeholderText: {
    color: theme.colors.white + '80',
    fontStyle: 'italic',
  },

  iconButton: {
    padding: width * 0.01,
    marginLeft: width * 0.02,
  },

  ageContainer: {
    paddingHorizontal: width * 0.04,
  },

  ageCircle: {
    flexDirection: 'row',
    width: width * 0.24,
    height: width * 0.074,
    borderRadius: (width * 0.074) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.009,
    paddingHorizontal: width * 0.03,
  },

  ageText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.bold,
  },

  separator: {
    height: 1.6,
    backgroundColor: theme.colors.white,
    marginVertical: height * 0.02,
    marginHorizontal: width * 0.04,
  },

  mediaHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.01,
    paddingHorizontal: width * 0.04,
  },

  headerText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  mediaCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  mediaCountText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    marginRight: width * 0.014,
  },

  mediaThumbnail: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: theme.borderRadius.small,
    resizeMode: 'cover',
    marginRight: width * 0.04,
  },

  mediaScroll: {
    paddingHorizontal: width * 0.04,
  },

  noMediaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.04,
  },

  noMediaTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.01,
  },

  noMediaText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white + '80',
    fontFamily: theme.typography.montserrat.medium,
    marginRight: width * 0.02,
  },

  informationContainer: {
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.03,
  },

  infoHeaderContainer: {
    marginBottom: height * 0.02,
  },

  infoContent: {
    borderRadius: theme.borderRadius.medium,
    paddingTop: width * 0.02,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.012,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.white + '30',
  },

  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    marginRight: width * 0.03,
  },

  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.medium,
    flex: 1,
  },

  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.semiBold,
    marginRight: width * 0.02,
  },

  chevronIcon: {
    marginLeft: width * 0.01,
  },

  addMediaBox: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: theme.borderRadius.small,
    borderWidth: 2,
    borderColor: theme.colors.white,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '40',
    marginRight: width * 0.04,
  },

  smallAddMediaBox: {
    width: width * 0.06,
    height: width * 0.06,
    borderRadius: theme.borderRadius.circle,
    borderWidth: 1.5,
    borderColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
});
