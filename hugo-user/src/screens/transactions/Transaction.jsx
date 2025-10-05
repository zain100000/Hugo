/**
 * Transaction Screen
 * User uploads receipt after sending manual payment
 */
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {buyCoinPackage} from '../../redux/slices/transaction.slice';
import {theme} from '../../styles/theme';
import Header from '../../utils/customComponents/customHeader/Header';
import Logo from '../../assets/splashScreen/splash-logo.png';
import ReceiptUploadModal from '../../utils/customModals/RecieptUploadModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import Button from '../../utils/customComponents/customButton/Button';

const {width, height} = Dimensions.get('screen');

const Transaction = ({route, navigation}) => {
  const {package: selectedPackage} = route.params;
  const dispatch = useDispatch();
  const {loading, error} = useSelector(state => state.transaction);

  const [receipt, setReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleReceiptUpload = image => {
    if (!image) return;

    const newReceipt = {
      uri: image.path,
      type: image.mime || 'image/jpeg',
      fileName: `receipt_${Date.now()}.${
        image.mime ? image.mime.split('/')[1] : 'jpg'
      }`,
    };

    setReceipt(newReceipt);

    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = () => {
    if (!receipt) {
      Toast.show({
        type: 'error',
        text1: 'Receipt Required',
        text2: 'Please upload your payment receipt before submitting.',
      });
      return;
    }

    dispatch(buyCoinPackage({packageId: selectedPackage._id, receipt}))
      .unwrap()
      .then(result => {
        const successMessage =
          result?.message ||
          'Transaction submitted successfully! Awaiting admin approval.';

        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: successMessage,
        });

        setTimeout(() => {
          navigation.navigate('Main');
        }, 2000);
      })
      .catch(err => {
        console.error('Transaction error:', err);

        const errorMessage =
          err?.message || 'Failed to submit transaction. Please try again.';

        Toast.show({
          type: 'error',
          text1: 'Submission Failed',
          text2: errorMessage,
        });
      });
  };

  const renderStepIndicator = (step, title, isCompleted, isCurrent) => (
    <View style={styles.stepContainer}>
      <View
        style={[
          styles.stepCircle,
          isCompleted && styles.stepCompleted,
          isCurrent && styles.stepCurrent,
        ]}>
        {isCompleted ? (
          <MaterialCommunityIcons
            name="check"
            size={width * 0.035}
            color={theme.colors.white}
          />
        ) : (
          <Text
            style={[styles.stepNumber, isCurrent && styles.stepNumberCurrent]}>
            {step}
          </Text>
        )}
      </View>
      <Text
        style={[
          styles.stepTitle,
          (isCompleted || isCurrent) && styles.stepTitleActive,
        ]}>
        {title}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="Complete Transaction" logo={Logo} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.summaryCard,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideUpAnim}],
            },
          ]}>
          <View style={styles.summaryHeader}>
            <MaterialCommunityIcons
              name="package-variant"
              size={width * 0.045}
              color={theme.colors.primary}
            />
            <Text style={styles.summaryTitle}>Package Summary</Text>
          </View>
          <View style={styles.packageDetails}>
            <View style={styles.coinDisplay}>
              <FontAwesome5 name="coins" size={width * 0.05} color="#FFD700" />
              <Text style={styles.coinAmount}>{selectedPackage.coins}</Text>
              <Text style={styles.coinsLabel}>Coins</Text>
            </View>
            <View style={styles.priceDisplay}>
              <Text style={styles.priceLabel}>Total Amount</Text>
              <Text style={styles.priceAmount}>
                {selectedPackage.currency} {selectedPackage.price}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.stepsContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideUpAnim}],
            },
          ]}>
          <Text style={styles.stepsTitle}>Payment Steps</Text>
          <View style={styles.stepsRow}>
            {renderStepIndicator(1, 'Make Payment', true, false)}
            {renderStepIndicator(2, 'Upload Receipt', !!receipt, !receipt)}
            {renderStepIndicator(3, 'Get Approval', false, false)}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.instructionsCard,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideUpAnim}],
            },
          ]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="bank-transfer"
              size={width * 0.045}
              color={theme.colors.primary}
            />
            <Text style={styles.cardTitle}>Payment Instructions</Text>
          </View>

          <View style={styles.instructionItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={width * 0.035}
              color={theme.colors.success}
            />
            <Text style={styles.instructionText}>
              Send exact amount to our secure Payoneer account
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={width * 0.035}
              color={theme.colors.success}
            />
            <Text style={styles.instructionText}>
              Include your username in payment description
            </Text>
          </View>

          <Animated.View
            style={[
              styles.accountContainer,
              {transform: [{scale: pulseAnim}]},
            ]}>
            <Text style={styles.accountLabel}>Account Number</Text>
            <View style={styles.accountNumberContainer}>
              <Text style={styles.accountNumber}>1234 5678 9012 3456</Text>
              <TouchableOpacity style={styles.copyButton}>
                <MaterialCommunityIcons
                  name="content-copy"
                  size={width * 0.035}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            styles.uploadSection,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideUpAnim}],
            },
          ]}>
          <View style={styles.uploadHeader}>
            <MaterialCommunityIcons
              name="receipt"
              size={width * 0.045}
              color={receipt ? theme.colors.success : theme.colors.primary}
            />
            <Text style={styles.uploadTitle}>
              {receipt ? 'Receipt Uploaded' : 'Upload Receipt'}
            </Text>
            {receipt && (
              <Animated.View style={{opacity: successAnim}}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={width * 0.035}
                  color={theme.colors.success}
                />
              </Animated.View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.uploadButton, receipt && styles.uploadButtonSuccess]}
            onPress={() => setShowReceiptModal(true)}>
            {receipt ? (
              <>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={width * 0.045}
                  color={theme.colors.success}
                />
                <Text style={styles.uploadButtonTextSuccess}>
                  Receipt Uploaded
                </Text>
                <Text style={styles.uploadChangeText}>Tap to change</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  name="cloud-upload"
                  size={width * 0.045}
                  color={theme.colors.primary}
                />
                <Text style={styles.uploadButtonText}>
                  Upload Payment Receipt
                </Text>
              </>
            )}
          </TouchableOpacity>

          {receipt && (
            <Animated.View
              style={[styles.previewContainer, {opacity: fadeAnim}]}>
              <Image source={{uri: receipt.uri}} style={styles.previewImage} />
              <View style={styles.previewOverlay}>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => setShowReceiptModal(true)}>
                  <MaterialCommunityIcons
                    name="eye"
                    size={width * 0.035}
                    color={theme.colors.white}
                  />
                  <Text style={styles.previewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View
          animation="fadeInUp"
          duration={800}
          delay={900}
          style={styles.submitContainer}>
          <Button
            title="SUBMIT FOR APPROVAL"
            onPress={handleSubmit}
            width={width * 0.92}
            loading={loading}
            disabled={!receipt || loading}
            iconName={'send-check'}
            backgroundColor={
              receipt ? theme.colors.success : theme.colors.secondary + '60'
            }
            textColor={theme.colors.white}
          />

          {!receipt && (
            <Text style={styles.submitHint}>
              Please upload receipt to continue
            </Text>
          )}
        </Animated.View>

        {error && (
          <Animated.View style={[styles.errorContainer, {opacity: fadeAnim}]}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={width * 0.035}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}
      </ScrollView>

      <ReceiptUploadModal
        visible={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        onUpload={handleReceiptUpload}
      />
    </View>
  );
};

export default Transaction;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: width * 0.04,
    paddingBottom: height * 0.05,
  },

  summaryCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
    gap: width * 0.025,
  },

  summaryTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  packageDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  coinDisplay: {
    alignItems: 'center',
    gap: height * 0.004,
  },

  coinAmount: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    fontFamily: theme.typography.montserrat.bold,
  },

  coinsLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary,
    fontFamily: theme.typography.montserrat.medium,
  },

  priceDisplay: {
    alignItems: 'flex-end',
  },

  priceLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary,
    fontFamily: theme.typography.montserrat.medium,
    marginBottom: height * 0.003,
  },

  priceAmount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.montserrat.bold,
  },

  stepsContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  stepsTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.montserrat.semiBold,
    marginBottom: height * 0.015,
  },

  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },

  stepCircle: {
    width: width * 0.07,
    height: width * 0.07,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.secondary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.008,
  },

  stepCompleted: {
    backgroundColor: theme.colors.success,
  },

  stepCurrent: {
    backgroundColor: theme.colors.primary,
  },

  stepNumber: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  stepNumberCurrent: {
    color: theme.colors.white,
  },

  stepTitle: {
    fontSize: theme.typography.fontSize.xxs,
    color: theme.colors.secondary,
    fontFamily: theme.typography.montserrat.medium,
    textAlign: 'center',
    width: width * 0.18,
  },

  stepTitleActive: {
    color: theme.colors.primary,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  instructionsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
    gap: width * 0.025,
  },

  cardTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
    gap: width * 0.025,
  },

  instructionText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    fontFamily: theme.typography.montserrat.regular,
    flex: 1,
  },

  accountContainer: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.medium,
    padding: width * 0.035,
    marginTop: height * 0.015,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },

  accountLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary,
    fontFamily: theme.typography.montserrat.medium,
    marginBottom: height * 0.006,
  },

  accountNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  accountNumber: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.montserrat.bold,
    letterSpacing: 0.5,
  },

  copyButton: {
    backgroundColor: theme.colors.primary,
    padding: width * 0.015,
    borderRadius: theme.borderRadius.small,
  },

  uploadSection: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
    gap: width * 0.025,
  },

  uploadTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.montserrat.semiBold,
    flex: 1,
  },

  uploadButton: {
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 1.5,
    borderColor: theme.colors.primary + '30',
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.medium,
    padding: width * 0.05,
    alignItems: 'center',
    gap: height * 0.008,
  },

  uploadButtonSuccess: {
    backgroundColor: theme.colors.success + '10',
    borderColor: theme.colors.success + '30',
    borderStyle: 'solid',
  },

  uploadButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  uploadButtonTextSuccess: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  uploadChangeText: {
    fontSize: theme.typography.fontSize.xxs,
    color: theme.colors.secondary,
    fontFamily: theme.typography.montserrat.regular,
  },

  previewContainer: {
    marginTop: height * 0.015,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    position: 'relative',
  },

  previewImage: {
    width: '100%',
    height: height * 0.16,
  },

  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  previewButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.008,
    borderRadius: theme.borderRadius.small,
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.015,
  },

  previewButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  submitContainer: {
    alignItems: 'center',
  },

  submitButton: {
    backgroundColor: theme.colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: width * 0.04,
    borderRadius: theme.borderRadius.medium,
    gap: width * 0.025,
    width: '100%',
    shadowColor: theme.colors.success,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  submitButtonDisabled: {
    backgroundColor: theme.colors.secondary + '60',
    shadowOpacity: 0,
    elevation: 0,
  },

  submitButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  submitHint: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary,
    fontFamily: theme.typography.montserrat.regular,
    marginTop: height * 0.008,
    textAlign: 'center',
  },

  errorContainer: {
    backgroundColor: theme.colors.error + '10',
    padding: width * 0.035,
    borderRadius: theme.borderRadius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.025,
    marginTop: height * 0.015,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error,
  },

  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error,
    fontFamily: theme.typography.montserrat.medium,
    flex: 1,
  },
});
