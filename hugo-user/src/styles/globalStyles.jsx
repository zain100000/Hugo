/**
 * Global styles configuration for the Hugo application
 * Provides scalable and consistent styling across components with responsive scaling
 */
import {theme} from './theme';
import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('screen');

const scale = size => width * (size / 375);
const verticalScale = size => height * (size / 912);
const moderateScale = (size, factor = 0) =>
  size + (scale(size) - size) * factor;

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  textPrimary: {
    color: theme.colors.primary,
    fontFamily: theme.typography.montserrat.regular,
    fontSize: moderateScale(theme.typography.fontSize.xs),
  },

  textSecondary: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.montserrat.regular,
    fontSize: moderateScale(theme.typography.fontSize.xs),
  },

  textTertiary: {
    color: theme.colors.tertiary,
    fontFamily: theme.typography.montserrat.regular,
    fontSize: moderateScale(theme.typography.fontSize.xs),
  },

  textWhite: {
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.medium,
    fontSize: moderateScale(theme.typography.fontSize.xs),
  },

  textBlack: {
    color: theme.colors.dark,
    fontFamily: theme.typography.montserrat.semiBold,
    fontSize: moderateScale(theme.typography.fontSize.xs),
  },

  textError: {
    color: theme.colors.error,
    fontFamily: theme.typography.montserrat.medium,
    fontSize: moderateScale(theme.typography.fontSize.xs),
    left: width * 0.014,
    top: height * 0.01
  },

  textSuccess: {
    color: theme.colors.success,
    fontFamily: theme.typography.montserrat.medium,
    fontSize: moderateScale(theme.typography.fontSize.xs),
    left: width * 0.014,
  },

  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    paddingVertical: verticalScale(theme.spacing(1.8)),
    paddingHorizontal: scale(theme.spacing(4)),
    borderRadius: moderateScale(theme.borderRadius.large),
    alignItems: 'center',
    minWidth: width * 0.4,
  },

  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: verticalScale(theme.spacing(2)),
    paddingHorizontal: scale(theme.spacing(4)),
    borderRadius: moderateScale(theme.borderRadius.large),
    alignItems: 'center',
    minWidth: width * 0.4,
    minHeight: height * 0.06,
  },

  buttonTextPrimary: {
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.regular,
    fontSize: moderateScale(theme.typography.fontSize.md),
  },

  buttonTextSecondary: {
    color: theme.colors.white,
    fontFamily: theme.typography.montserrat.regular,
    fontSize: moderateScale(theme.typography.fontSize.md),
  },

  inputContainer: {
    marginVertical: verticalScale(theme.spacing(1.5)),
  },

  input: {
    backgroundColor: theme.colors.white,
    borderWidth: moderateScale(1),
    borderColor: theme.colors.gray,
    borderRadius: moderateScale(theme.borderRadius.medium),
    paddingVertical: verticalScale(theme.spacing(1)), 
    paddingHorizontal: scale(theme.spacing(2.5)), 
    fontSize: moderateScale(theme.typography.fontSize.md),
    fontFamily: theme.typography.montserrat.regular,
    color: theme.colors.dark,
    minHeight: height * 0.06, 
  },

  inputLabel: {
    fontFamily: theme.typography.montserrat.medium,
    fontSize: moderateScale(theme.typography.fontSize.xs),
    left: width * 0.014,
    color: theme.colors.dark,
  },

  card: {
    backgroundColor: theme.colors.white,
    borderRadius: moderateScale(theme.borderRadius.medium),
    padding: moderateScale(theme.spacing(2)),
    gap: verticalScale(theme.gap(1)),
    ...theme.elevation.depth2,
    minWidth: width * 0.9,
  },

  cardTitle: {
    fontFamily: theme.typography.montserrat.semiBold,
    fontSize: moderateScale(theme.typography.fontSize.md),
    color: theme.colors.dark,
    marginBottom: verticalScale(theme.spacing(1)),
  },

  cardContent: {
    fontFamily: theme.typography.montserrat.regular,
    fontSize: moderateScale(theme.typography.fontSize.md),
    color: theme.colors.secondary,
    lineHeight: moderateScale(theme.typography.lineHeight.xs),
  },

  divider: {
    height: verticalScale(1),
    backgroundColor: theme.colors.gray,
    marginVertical: verticalScale(theme.spacing(1)),
  },

  shadowDepth1: {
    ...theme.elevation.depth1,
  },

  shadowDepth3: {
    ...theme.elevation.depth3,
  },
});
