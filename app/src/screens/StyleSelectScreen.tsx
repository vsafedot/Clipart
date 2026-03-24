import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, Animated, StatusBar,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, MODERN_BORDER, MODERN_SHADOW, CARD_SHADOW, GLOW_SHADOW } from '../constants/theme';

const STYLES = [
  { id: 'cartoon',           label: 'Cartoon 3D',      icon: '✨', description: 'Pixar-style vibrant render',           color: COLORS.accentOrange, bg: '#FFF7ED' },
  { id: 'anime',             label: 'Anime',            icon: '🌸', description: 'Studio Ghibli watercolour',           color: COLORS.accentPink,   bg: '#FDF2F8' },
  { id: 'pixel art',         label: 'Pixel Art',        icon: '🕹️', description: 'Retro 16-bit gaming style',           color: COLORS.accentBlue,   bg: '#EFF6FF' },
  { id: 'sketch',            label: 'Pencil Sketch',   icon: '✏️', description: 'Detailed hand-drawn style',           color: COLORS.accentPurple, bg: '#F5F3FF' },
  { id: 'flat illustration', label: 'Flat Vector',      icon: '🎨', description: 'Clean minimalist vector art',         color: COLORS.accentTeal,   bg: '#F0FDFA' },
];

export default function StyleSelectScreen({ route, navigation }: any) {
  const { imageBase64, imageUri } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(STYLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start(() => {
      Animated.stagger(
        80,
        cardAnims.map((a) => Animated.spring(a, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }))
      ).start();
    });
  }, []);

  const handleSelect = (style: string) => navigation.navigate('Processing', { imageBase64, style });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Header / Photo preview ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.previewWrapper}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            <View style={styles.previewOverlay}>
              <Text style={styles.previewOverlayText}>Your Photo</Text>
            </View>
          </View>

          <Text style={styles.headTitle}>Choose a Style</Text>
          <Text style={styles.headSub}>Select the art style for your clipart</Text>
        </Animated.View>

        {/* ── Style Cards ── */}
        <View style={styles.cardList}>
          {STYLES.map((s, i) => (
            <Animated.View
              key={s.id}
              style={{
                opacity: cardAnims[i],
                transform: [{ translateY: cardAnims[i].interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
              }}
            >
              <TouchableOpacity activeOpacity={0.78} onPress={() => handleSelect(s.id)} style={styles.styleCard}>
                <View style={[styles.iconBox, { backgroundColor: s.bg }]}>
                  <Text style={styles.styleIcon}>{s.icon}</Text>
                </View>
                <View style={styles.styleInfo}>
                  <Text style={styles.styleName}>{s.label}</Text>
                  <Text style={styles.styleDesc}>{s.description}</Text>
                </View>
                <View style={[styles.arrowCircle, { backgroundColor: s.bg }]}>
                  <Text style={[styles.arrowText, { color: s.color }]}>›</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgSecondary },
  scroll: { paddingTop: 56, paddingHorizontal: SPACING.lg, paddingBottom: 60 },

  // ── Header ──
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  backBtn: {
    alignSelf: 'flex-start',
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...MODERN_BORDER,
    ...CARD_SHADOW,
  },
  backIcon: { fontSize: 20, color: COLORS.textPrimary, lineHeight: 22 },

  previewWrapper: {
    width: 160, height: 160,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...MODERN_SHADOW,
  },
  previewImage: { width: '100%', height: '100%' },
  previewOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.overlay,
    paddingVertical: 6,
    alignItems: 'center',
  },
  previewOverlayText: { ...FONTS.caption, color: COLORS.textWhite },

  headTitle: { ...FONTS.title, fontSize: 26, textAlign: 'center', marginBottom: 4 },
  headSub: { ...FONTS.body, color: COLORS.textSecondary, textAlign: 'center' },

  // ── Cards ──
  cardList: { gap: SPACING.md },
  styleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    ...MODERN_BORDER,
    ...CARD_SHADOW,
  },
  iconBox: {
    width: 56, height: 56,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleIcon: { fontSize: 26 },
  styleInfo: { flex: 1 },
  styleName: { ...FONTS.subtitle, fontSize: 16, color: COLORS.textPrimary, marginBottom: 2 },
  styleDesc: { ...FONTS.caption, color: COLORS.textSecondary },
  arrowCircle: {
    width: 36, height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: { fontSize: 22, fontWeight: '600' as const, lineHeight: 24 },
});
