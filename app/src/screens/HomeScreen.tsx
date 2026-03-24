import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { COLORS, FONTS, SPACING, RADIUS, GLOW_SHADOW, CARD_SHADOW, MODERN_BORDER } from '../constants/theme';

const { width: W, height: H } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const fadeHeader = useRef(new Animated.Value(0)).current;
  const slideHeader = useRef(new Animated.Value(30)).current;
  const scaleBtn1 = useRef(new Animated.Value(0)).current;
  const scaleBtn2 = useRef(new Animated.Value(0)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeHeader, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideHeader, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.stagger(120, [
        Animated.spring(scaleBtn1, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
        Animated.spring(scaleBtn2, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
      ]),
    ]).start();

    // Subtle AI badge pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
        Animated.timing(badgePulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const compressImage = async (uri: string): Promise<string> => {
    const m = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    return `data:image/jpeg;base64,${m.base64}`;
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      let result: ImagePicker.ImagePickerResult;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera access is needed to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.85,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Gallery access is needed to pick photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.85,
        });
      }
      if (!result.canceled && result.assets[0]) {
        const imageBase64 = await compressImage(result.assets[0].uri);
        navigation.navigate('StyleSelect', { imageBase64, imageUri: result.assets[0].uri });
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to pick image');
    }
  };

  const AnimatedTouch = Animated.createAnimatedComponent(TouchableOpacity);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.heroGradientA} translucent />

      {/* ── Hero Banner ── */}
      <View style={styles.hero}>
        {/* Decorative circles */}
        <View style={styles.deco1} />
        <View style={styles.deco2} />

        <Animated.View style={{ opacity: fadeHeader, transform: [{ translateY: slideHeader }], alignItems: 'center' }}>
          {/* AI Badge */}
          <Animated.View style={[styles.aiBadge, { transform: [{ scale: badgePulse }] }]}>
            <Text style={styles.aiBadgeText}>✦ AI Powered</Text>
          </Animated.View>

          <Text style={styles.heroTitle}>Clipart{'\n'}Studio</Text>
          <Text style={styles.heroSub}>Transform any photo into stunning{'\n'}AI-generated clipart art</Text>
        </Animated.View>
      </View>

      {/* ── Action Card ── */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>GET STARTED</Text>
        <Text style={styles.cardTitle}>Choose a photo</Text>
        <Text style={styles.cardDesc}>Pick from your gallery or take a new photo to begin.</Text>

        <View style={styles.btnGroup}>
          <AnimatedTouch
            activeOpacity={0.85}
            onPress={() => pickImage('camera')}
            style={[styles.btnPrimary, { transform: [{ scale: scaleBtn1 }] }]}
          >
            <Text style={styles.btnPrimaryIcon}>📷</Text>
            <Text style={styles.btnPrimaryText}>Take a Photo</Text>
          </AnimatedTouch>

          <AnimatedTouch
            activeOpacity={0.85}
            onPress={() => pickImage('gallery')}
            style={[styles.btnSecondary, { transform: [{ scale: scaleBtn2 }] }]}
          >
            <Text style={styles.btnSecondaryIcon}>🖼️</Text>
            <Text style={styles.btnSecondaryText}>Choose from Gallery</Text>
          </AnimatedTouch>
        </View>

        {/* Feature pills */}
        <View style={styles.pills}>
          {['5 Art Styles', 'AI-Powered', 'Instant Download'].map((p) => (
            <View key={p} style={styles.pill}>
              <Text style={styles.pillText}>{p}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgSecondary },

  // ── Hero ──
  hero: {
    backgroundColor: COLORS.heroGradientA,
    paddingTop: 70,
    paddingBottom: 60,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  deco1: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.heroGradientB,
    opacity: 0.4,
    top: -60, right: -60,
  },
  deco2: {
    position: 'absolute', width: 140, height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.25,
    bottom: -40, left: -30,
  },
  aiBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  aiBadgeText: { ...FONTS.caption, color: COLORS.textWhite, letterSpacing: 1 },
  heroTitle: {
    ...FONTS.hero,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSub: {
    ...FONTS.body,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
  },

  // ── Card ──
  card: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    marginTop: -RADIUS.xxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  cardLabel: { ...FONTS.label, marginBottom: SPACING.xs },
  cardTitle: { ...FONTS.title, fontSize: 26, marginBottom: SPACING.xs },
  cardDesc: { ...FONTS.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },

  btnGroup: { gap: SPACING.md },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 18,
    ...GLOW_SHADOW,
  },
  btnPrimaryIcon: { fontSize: 20 },
  btnPrimaryText: { ...FONTS.button, fontSize: 17 },

  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    paddingVertical: 18,
    ...MODERN_BORDER,
    ...CARD_SHADOW,
  },
  btnSecondaryIcon: { fontSize: 20 },
  btnSecondaryText: { ...FONTS.button, color: COLORS.textPrimary },

  pills: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  pill: {
    backgroundColor: COLORS.primaryGlow,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },
  pillText: { ...FONTS.caption, color: COLORS.primaryDark, fontWeight: '600' as const },
});
