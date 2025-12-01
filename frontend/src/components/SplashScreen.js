import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const mortarAnim = useRef(new Animated.Value(0)).current;
  const pestleAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Mortar and pestle grinding animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pestleAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pestleAnim, {
          toValue: -20,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate leaf icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Finish splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Gradient-like background effect with overlays */}
      <View style={styles.backgroundGradient} />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Rotating leaf background */}
        <Animated.Text
          style={[
            styles.leafBackground,
            { transform: [{ rotate }] },
          ]}
        >
          🌿
        </Animated.Text>

        {/* Mortar and Pestle Animation */}
        <View style={styles.medicinePreparation}>
          <Text style={styles.mortarIcon}>🥣</Text>
          <Animated.Text
            style={[
              styles.pestleIcon,
              { transform: [{ translateY: pestleAnim }] },
            ]}
          >
            🥄
          </Animated.Text>
        </View>

        <Text style={styles.logoText}>VaidyaAI</Text>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Smart Prescription Assistant</Text>
          <View style={styles.subtitleUnderline} />
        </View>

        <View style={styles.loadingDots}>
          <Text style={styles.loadingText}>Preparing your workspace</Text>
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotDelay1]} />
            <View style={[styles.dot, styles.dotDelay2]} />
          </View>
        </View>
      </Animated.View>

      <Text style={styles.footerText}>Powered by AI • Made with 💚</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#053445',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#053445',
    opacity: 0.95,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  leafBackground: {
    fontSize: 120,
    position: 'absolute',
    opacity: 0.1,
    top: -60,
  },
  medicinePreparation: {
    position: 'relative',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  mortarIcon: {
    fontSize: 70,
    position: 'absolute',
    bottom: 0,
  },
  pestleIcon: {
    fontSize: 50,
    position: 'absolute',
    top: 0,
    right: 15,
    transform: [{ rotate: '45deg' }],
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#6DB4CD',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 1,
    textShadowColor: 'rgba(109, 180, 205, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B95AF',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitleUnderline: {
    width: 60,
    height: 2,
    backgroundColor: '#297691',
    marginTop: 8,
    borderRadius: 2,
  },
  loadingDots: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: '#4B95AF',
    fontSize: 14,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6DB4CD',
    opacity: 0.3,
  },
  dotDelay1: {
    opacity: 0.6,
  },
  dotDelay2: {
    opacity: 1,
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    color: '#4B95AF',
    fontSize: 12,
    fontWeight: '500',
  },
});
