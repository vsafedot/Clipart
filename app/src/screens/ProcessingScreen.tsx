import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated,
  StatusBar, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, MODERN_BORDER, MODERN_SHADOW, GLOW_SHADOW } from '../constants/theme';
import { generateClipart, pollStatus } from '../services/api';

const STEPS = [
  { emoji: '🔍', text: 'Analyzing your photo...' },
  { emoji: '🎨', text: 'Choosing the perfect style...' },
  { emoji: '⚡', text: 'Running AI generation...' },
  { emoji: '✨', text: 'Adding finishing touches...' },
  { emoji: '🖼️', text: 'Almost ready...' },
];

export default function ProcessingScreen({ route, navigation }: any) {
  const { imageBase64, style } = route.params;
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.85)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;
  const stepFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade-in entry
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    // Pulsing ring loop
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, { toValue: 1.14, duration: 900, useNativeDriver: true }),
          Animated.timing(ringScale, { toValue: 0.85, duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0.15, duration: 900, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.6, duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Step cycling
    let idx = 0;
    const interval = setInterval(() => {
      Animated.timing(stepFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        idx = (idx + 1) % STEPS.length;
        setStepIdx(idx);
        Animated.timing(stepFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 3500);

    startGeneration();
    return () => clearInterval(interval);
  }, []);

  const startGeneration = async () => {
    try {
      setError(null);
      const response = await generateClipart(imageBase64, style);
      if (response.output && response.output.length > 0) {
        navigation.replace('Result', { imageUrl: response.output[0], style });
        return;
      }
      if (response.predictionId) {
        const url = await pollStatus(response.predictionId);
        navigation.replace('Result', { imageUrl: url, style });
        return;
      }
      throw new Error('Unexpected server response');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  /* ── Error State ── */
  if (error) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgSecondary} />
        <View style={styles.errorCard}>
          <View style={styles.errorIconBox}>
            <Text style={styles.errorEmoji}>⚠️</Text>
          </View>
          <Text style={styles.errorTitle}>Oops, something went wrong</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={startGeneration} activeOpacity={0.85}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── Loading State ── */
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgSecondary} />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* Pulsing ring + spinner */}
        <View style={styles.spinnerContainer}>
          <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
          <View style={styles.spinnerInner}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.mainTitle}>Generating Artwork</Text>
        <View style={styles.styleTag}>
          <Text style={styles.styleTagText}>{style}</Text>
        </View>

        {/* Animated step label */}
        <Animated.View style={[styles.stepBox, { opacity: stepFade }]}>
          <Text style={styles.stepEmoji}>{STEPS[stepIdx].emoji}</Text>
          <Text style={styles.stepText}>{STEPS[stepIdx].text}</Text>
        </Animated.View>

        {/* Progress dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === stepIdx && styles.dotActive]} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  content: { alignItems: 'center', width: '100%' },

  // ── Spinner ring ──
  spinnerContainer: {
    width: 120, height: 120,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  ring: {
    position: 'absolute',
    width: 120, height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryGlow,
  },
  spinnerInner: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center', alignItems: 'center',
    ...MODERN_SHADOW,
  },

  mainTitle: { ...FONTS.title, fontSize: 26, marginBottom: SPACING.sm, textAlign: 'center' },
  styleTag: {
    backgroundColor: COLORS.primaryGlow,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    marginBottom: SPACING.xl,
  },
  styleTagText: { ...FONTS.caption, color: COLORS.primaryDark, fontWeight: '700' as const, textTransform: 'capitalize' },

  stepBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    width: '100%',
    ...MODERN_BORDER,
    marginBottom: SPACING.xl,
  },
  stepEmoji: { fontSize: 22 },
  stepText: { ...FONTS.body, color: COLORS.textSecondary, flex: 1 },

  dots: { flexDirection: 'row', gap: SPACING.xs },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.primary, width: 20 },

  // ── Error ──
  errorCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    ...MODERN_BORDER,
    ...MODERN_SHADOW,
  },
  errorIconBox: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  errorEmoji: { fontSize: 34 },
  errorTitle: { ...FONTS.subtitle, color: COLORS.textPrimary, textAlign: 'center', marginBottom: SPACING.sm },
  errorMsg: { ...FONTS.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
  retryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    width: '100%', alignItems: 'center',
    marginBottom: SPACING.md,
    ...GLOW_SHADOW,
  },
  retryText: { ...FONTS.button },
  backLink: { paddingVertical: SPACING.sm },
  backLinkText: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 14 },
});
