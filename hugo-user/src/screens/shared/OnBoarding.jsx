/**
 * OnBoarding Screen for Hugo App
 * Displays a colorful, animated onboarding slider with vibrant gradients,
 * animated transitions, and engaging imagery to introduce users to the Hugo app
 */
import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Image,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
  Text,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Button from '../../utils/customComponents/customButton/Button';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('screen');

const images = {
  image1: require('../../assets/onBoardingScreen/onBoard-1.jpg'),
  image2: require('../../assets/onBoardingScreen/onBoard-2.jpg'),
  image3: require('../../assets/onBoardingScreen/onBoard-3.jpg'),
};

const slides = [
  {
    key: '1',
    image: images.image1,
    title: 'Where Love Finds You',
    description:
      'Hugo connects hearts with authenticity. Start real conversations that matter.',
  },
  {
    key: '2',
    image: images.image2,
    title: 'Your Match Awaits',
    description:
      'Discover meaningful matches, tailored just for you. Find someone who truly clicks.',
  },
  {
    key: '3',
    image: images.image3,
    title: 'Begin Your Journey',
    description:
      'From sparks to soulmates — your love story starts here with Hugo.',
  },
];

const OnBoarding = () => {
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.8)).current;
  const textSlideAnim = useRef(new Animated.Value(50)).current;
  const buttonSlideAnim = useRef(new Animated.Value(100)).current;

  const gradientColors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.tertiary,
  ];

  useEffect(() => {
    const statusBarColor = theme.colors.tertiary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(imageScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(textSlideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(buttonSlideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeIndex]);

  const handleSlideChange = index => {
    setActiveIndex(index);
    fadeAnim.setValue(0);
    imageScale.setValue(0.8);
    textSlideAnim.setValue(50);
    buttonSlideAnim.setValue(100);
  };

  const handleOnComplete = () => {
    navigation.replace('Signin');
  };

  const renderItem = ({item, index}) => (
    <LinearGradient
      colors={gradientColors}
      style={[globalStyles.container, styles.primaryContainer]}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: fadeAnim,
              transform: [
                {scale: imageScale},
                {
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      index === activeIndex
                        ? 0
                        : index < activeIndex
                        ? -width * 0.25
                        : width * 0.25,
                      0,
                    ],
                  }),
                },
              ],
            },
          ]}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              transform: [{translateY: textSlideAnim}],
              opacity: fadeAnim,
            },
          ]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.btnContainer,
            {
              transform: [{translateY: buttonSlideAnim}],
              opacity: fadeAnim,
            },
          ]}>
          {index === slides.length - 1 ? (
            <Button
              title="GET STARTED"
              width={width * 0.9}
              onPress={handleOnComplete}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
            />
          ) : null}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderPagination = () => (
    <Animated.View style={[styles.paginationContainer, {opacity: fadeAnim}]}>
      {slides.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            activeIndex === index && styles.activeDot,
            {
              backgroundColor:
                activeIndex === index
                  ? theme.colors.primary
                  : 'rgba(255,255,255,0.5)',
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1.3],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </Animated.View>
  );

  return (
    <AppIntroSlider
      ref={sliderRef}
      renderItem={renderItem}
      data={slides}
      renderPagination={renderPagination}
      onSlideChange={handleSlideChange}
      showSkipButton={false}
      showDoneButton={false}
      showNextButton={false}
    />
  );
};

export default OnBoarding;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  imageContainer: {
    flex: 1,
    marginHorizontal: width * 0.06,
    marginTop: height * 0.06,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
  },

  textContainer: {
    flex: 0.8,
    paddingHorizontal: width * 0.08,
    justifyContent: 'center',
  },

  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.montserrat.bold,
    textAlign: 'center',
    marginBottom: height * 0.02,
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  description: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.montserrat.medium,
    textAlign: 'center',
    lineHeight: 26,
    color: theme.colors.white,
    opacity: 0.9,
  },

  btnContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.06,
  },

  paginationContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  dot: {
    width: width * 0.028,
    height: width * 0.028,
    borderRadius: width * 0.014,
    marginHorizontal: width * 0.012,
  },

  activeDot: {
    width: width * 0.03,
    height: width * 0.03,
    borderRadius: width * 0.014,
    marginHorizontal: width * 0.012,
    marginBottom: height * 0.054,
  },
});
