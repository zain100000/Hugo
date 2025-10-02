/**
 * PrivacyPolicy screen for Hugo app
 * Displays the app's privacy policy including information collection, usage, and contact details
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

const PrivacyPolicy = () => {
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
        <Header title="Privacy Policy" logo={Logo} />
      </View>

      <View style={styles.headerTextContainer}>
        <Text
          style={[styles.headerDescriptionText, {color: theme.colors.white}]}>
          How we handle your data at Hugo.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.heading, {color: theme.colors.white}]}>
          Introduction
        </Text>
        <Text style={[styles.description, {color: theme.colors.gray}]}>
          Welcome to Hugo! We care about your privacy and are committed to
          protecting your personal data. This Privacy Policy outlines how we
          collect, use, and protect your information while you connect with
          others through our platform.
        </Text>

        <Text style={[styles.heading, {color: theme.colors.white}]}>
          Information Collection
        </Text>
        <Text style={[styles.description, {color: theme.colors.gray}]}>
          We collect the following information:
        </Text>

        <View style={styles.bulletContainer}>
          <Ionicons
            name="person-outline"
            size={width * 0.06}
            color={theme.colors.white}
            style={styles.bulletIcon}
          />
          <Text style={[styles.bulletText, {color: theme.colors.white}]}>
            Profile Details: Name, age, gender, photos, preferences.
          </Text>
        </View>

        <View style={styles.bulletContainer}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={width * 0.06}
            color={theme.colors.white}
            style={styles.bulletIcon}
          />
          <Text style={[styles.bulletText, {color: theme.colors.white}]}>
            Conversations: Messages exchanged with other users.
          </Text>
        </View>

        <View style={styles.bulletContainer}>
          <Ionicons
            name="location-outline"
            size={width * 0.06}
            color={theme.colors.white}
            style={styles.bulletIcon}
          />
          <Text style={[styles.bulletText, {color: theme.colors.white}]}>
            Location Data: To show matches near you.
          </Text>
        </View>

        <Text style={[styles.heading, {color: theme.colors.white}]}>
          How We Use Your Information
        </Text>
        <Text style={[styles.description, {color: theme.colors.gray}]}>
          Your information is used to:
        </Text>

        <View style={styles.bulletContainer}>
          <Ionicons
            name="heart-outline"
            size={width * 0.06}
            color={theme.colors.white}
            style={styles.bulletIcon}
          />
          <Text style={[styles.bulletText, {color: theme.colors.gray}]}>
            Match you with compatible users based on your preferences.
          </Text>
        </View>

        <View style={styles.bulletContainer}>
          <Ionicons
            name="notifications-outline"
            size={width * 0.06}
            color={theme.colors.white}
            style={styles.bulletIcon}
          />
          <Text style={[styles.bulletText, {color: theme.colors.gray}]}>
            Send you updates, match alerts, and important notifications.
          </Text>
        </View>

        <View style={styles.bulletContainer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={width * 0.06}
            color={theme.colors.white}
            style={styles.bulletIcon}
          />
          <Text style={[styles.bulletText, {color: theme.colors.gray}]}>
            Ensure the safety and authenticity of user profiles and
            communications.
          </Text>
        </View>

        <Text style={[styles.heading, {color: theme.colors.white}]}>
          Contact Us
        </Text>
        <Text style={[styles.description, {color: theme.colors.gray}]}>
          If you have any questions about our Privacy Policy, contact us at:
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

export default PrivacyPolicy;

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
