/**
 * Coin Packages Screen
 * Displays all coin packages fetched from backend
 * Allows user to select a package for recharge
 */

import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getPackages} from '../../redux/slices/package.slice';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import Logo from '../../assets/splashScreen/splash-logo.png';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CustomModal from '../../utils/customModals/CustomModal';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('screen');

const PackageCard = ({item, fadeAnim, scaleAnim, navigation}) => {
  const cardScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.95,
      tension: 20,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      tension: 20,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.packageCardWrapper,
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}, {scale: cardScale}],
        },
      ]}>
      <TouchableOpacity
        style={styles.packageCard}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigation.navigate('Transaction', {package: item})}
        activeOpacity={0.9}>
        <View style={styles.coinIconContainer}>
          <FontAwesome5 name="coins" size={width * 0.08} color="#FFD700" />
        </View>

        <View style={styles.coinContainer}>
          <Text style={styles.coinAmount}>{item.coins}</Text>
          <Text style={styles.coinsLabel}>Coins</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>PKR {item.price}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CoinPackages = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {packages, loading, error} = useSelector(state => state.packages);

  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    dispatch(getPackages());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && packages.length > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, packages]);

  return (
    <View style={[globalStyles.container, styles.container]}>
      <Header title="Coin Packages" logo={Logo} />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading Packages...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <FontAwesome5
            name="exclamation-circle"
            size={width * 0.15}
            color={theme.colors.error}
          />
          <Text style={styles.errorText}>
            {error || 'Failed to load packages'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(getPackages())}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <Animated.View
          style={[
            styles.listContainer,
            {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
          ]}>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>Choose Your Package</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.rulesText}>Rules</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            Select the package for your need
          </Text>

          <FlatList
            data={packages}
            keyExtractor={item => item._id}
            renderItem={({item}) => (
              <PackageCard
                item={item}
                fadeAnim={fadeAnim}
                scaleAnim={scaleAnim}
                navigation={navigation}
              />
            )}
            contentContainerStyle={styles.flatListContent}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}

      {/* Rules Modal */}
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Transaction Rules"
        contentList={[
          {
            id: 1,
            text: '💳 Send your payment securely to our official Payoneer account: 1234 5678 9012 3456',
          },
          {
            id: 2,
            text: '📸 After successful payment, upload a clear screenshot of the payment receipt in the app.',
          },
          {
            id: 3,
            text: '⏳ Our admin will review your transaction within 24 hours.',
          },
          {
            id: 4,
            text: '✅ Once approved, the purchased coins will be credited to your account automatically.',
          },
        ]}
      />
    </View>
  );
};

export default CoinPackages;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: height * 0.02,
  },

  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    fontFamily: theme.typography.montserrat.medium,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    gap: height * 0.03,
  },

  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
    fontFamily: theme.typography.montserrat.medium,
    lineHeight: height * 0.03,
  },

  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.015,
    borderRadius: theme.borderRadius.medium,
  },

  retryText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  listContainer: {
    flex: 1,
    paddingHorizontal: width * 0.04,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.primary,
    fontFamily: theme.typography.montserrat.bold,
  },

  rulesText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    fontFamily: theme.typography.montserrat.semiBold,
  },

  sectionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary,
    fontFamily: theme.typography.montserrat.regular,
    marginBottom: height * 0.03,
    lineHeight: height * 0.025,
  },

  flatListContent: {
    paddingBottom: height * 0.05,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: height * 0.025,
  },

  packageCardWrapper: {
    width: (width - width * 0.12) / 2,
  },

  packageCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: width * 0.05,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary + '15',
    position: 'relative',
    minHeight: height * 0.18,
    justifyContent: 'space-between',
  },

  coinIconContainer: {
    marginBottom: height * 0.01,
  },

  coinContainer: {
    alignItems: 'center',
    marginBottom: height * 0.015,
  },

  coinAmount: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    fontFamily: theme.typography.montserrat.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },

  coinsLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary,
    fontFamily: theme.typography.montserrat.medium,
    marginTop: height * 0.005,
  },

  priceContainer: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.05,
    width: '100%',
    alignItems: 'center',
  },

  priceText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: theme.typography.montserrat.semiBold,
  },
});
