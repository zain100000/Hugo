/**
 * AppUsage screen for Hugo app
 * Displays the app's Terms & Conditions including user conduct, subscription, privacy, and contact details
 */

import React, {useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {theme} from '../../../styles/theme';
import Header from '../../../utils/customComponents/customHeader/Header';
import {globalStyles} from '../../../styles/globalStyles';
import LinearGradient from 'react-native-linear-gradient';
import Logo from '../../../assets/splashScreen/splash-logo.png';

const {width, height} = Dimensions.get('screen');

const AppUsage = () => {
  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
    StatusBar.setBarStyle('light-content');
  }, []);

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[globalStyles.container, styles.primaryContainer]}>
      <View style={styles.headerContainer}>
        <Header title="Terms & Conditions" logo={Logo} />
      </View>

      <View style={styles.headerTextContainer}>
        <Text style={[styles.headerDescriptionText, {color: theme.colors.white}]}>
          Guidelines for using Hugo.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.heading, {color: theme.colors.white}]}>
          Introduction
        </Text>
        <Text style={[styles.description, {color: theme.colors.gray}]}>
          By accessing and using Hugo, you agree to comply with these Terms and Conditions. Please read them carefully before using our services.
        </Text>

        <Text style={[styles.heading, {color: theme.colors.white}]}>
          User Conduct
        </Text>
        <Text style={[styles.description, {color: theme.colors.gray}]}>
          Users must treat others with respect, refrain from harassment or offensive behavior, and use the platform in a lawful manner.
        </Text>

        <View style={styles.bulletContainer}>
          <Ionicons
            name="person-outline"
            size={width * 0.06}
            color={theme.colors.white}
            style={styles.bulletIcon}
          />
          <Text style={[styles.bulletText, {color: theme.colors.white}]}>
            Do not share misleading information or impersonate others.
          </Text>
        </View>

        <View style={styles.bulletContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={width * 0.06}
            color={theme.colors.white}
            style={styles.bulletIcon}
          />
          <Text style={[styles.bulletText, {color: theme.colors.white}]}>
            Inappropriate content or behavior may result in suspension or banning of the account.
          </Text>
        </View>

        <Text style={[styles.heading, {color: theme.colors.white}]}>
          Subscription and Payments
        </Text>
        <Text style={[styles.description, {color: theme.colors.gray}]}>
          Hugo offers optional premium features through subscriptions. Charges apply as per selected plans and are non-refundable unless stated otherwise.
        </Text>

        <View style={styles.bulletContainer}>
          <Ionicons
            name="card-outline"
            size={width * 0.06}
            color={theme.colors.white}
            style={styles.bulletIcon}
          />
          <Text style={[styles.bulletText, {color: theme.colors.white}]}>
            Users can cancel subscriptions anytime via account settings.
          </Text>
        </View>

        <Text style={[styles.heading, {color: theme.colors.white}]}>
          Privacy and Safety
        </Text>
        <Text style={[styles.description, {color: theme.colors.gray}]}>
          Your privacy is important to us. We encourage you to report any suspicious activity. Use caution when sharing personal information.
        </Text>

        <View style={styles.bulletContainer}>
          <Ionicons
            name="shield-outline"
            size={width * 0.06}
            color={theme.colors.white}
            style={styles.bulletIcon}
          />
          <Text style={[styles.bulletText, {color: theme.colors.white}]}>
            Hugo is not liable for interactions or outcomes from matches.
          </Text>
        </View>

        <Text style={[styles.heading, {color: theme.colors.white}]}>
          Contact Us
        </Text>
        <Text style={[styles.description, {color: theme.colors.gray}]}>
          For support or inquiries, reach out to us at:
        </Text>

        <View style={styles.contactContainer}>
          <Ionicons
            name="mail-outline"
            size={width * 0.06}
            style={styles.contactIcon}
            color={theme.colors.white}
          />
          <Text style={[styles.contactText, {color: theme.colors.gray}]}>
            support@hugoapp.com
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default AppUsage;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
  },

  headerTextContainer: {
    marginTop: height * 0.04,
    marginHorizontal: width * 0.04,
  },

  headerDescriptionText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.montserrat.medium,
    top: height * 0.01,
  },

  contentContainer: {
    marginTop: height * 0.02,
    marginHorizontal: width * 0.04,
  },

  heading: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.montserrat.semiBold,
    marginVertical: height * 0.02,
  },

  description: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.montserrat.regular,
    marginBottom: height * 0.02,
    lineHeight: theme.typography.lineHeight.md,
    textAlign: 'justify',
  },

  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
    marginHorizontal: width * 0.04,
  },

  bulletIcon: {
    right: width * 0.05,
  },

  bulletText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.montserrat.regular,
    lineHeight: theme.typography.lineHeight.md,
  },

  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
    marginTop: height * 0.03,
  },

  contactIcon: {
    marginRight: width * 0.03,
  },

  contactText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.montserrat.regular,
    lineHeight: theme.typography.lineHeight.md,
  },
});
