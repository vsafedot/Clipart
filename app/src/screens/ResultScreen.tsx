// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Animated, Alert, StatusBar, Dimensions, ActivityIndicator, Platform,
  ScrollView,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import {
  COLORS, FONTS, SPACING, RADIUS,
  MODERN_BORDER, MODERN_SHADOW, GLOW_SHADOW, CARD_SHADOW,
} from '../constants/theme';

const { width: SW } = Dimensions.get('window');
const IMG_SIZE = Math.min(SW - SPACING.xl * 2, 320);

export default function ResultScreen({ route, navigation }: any) {
  const { imageUrl, style } = route.params;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const imgScale  = useRef(new Animated.Value(0.88)).current;
  const btnSlide  = useRef(new Animated.Value(30)).current;
  const btnFade   = useRef(new Animated.Value(0)).current;
  const [saving, setSaving]   = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(imgScale, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnFade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(btnSlide, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  /* ── Downloads ── */
  const downloadWeb = async () => {
    setSaving(true);
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `artwork_${style}_${Date.now()}.jpg`;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); document.body.removeChild(a);
    } catch (e) { window.alert('Download failed: ' + e.message); }
    finally { setSaving(false); }
  };

  const downloadNative = async () => {
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Required', 'Storage access needed to save.'); return; }
      const uri = FileSystem.documentDirectory + `artwork_${style}_${Date.now()}.jpg`;
      const dl = await FileSystem.downloadAsync(imageUrl, uri);
      await MediaLibrary.saveToLibraryAsync(dl.uri);
      Alert.alert('Saved! 🎉', 'Artwork saved to your gallery.');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  const handleSave = () => Platform.OS === 'web' ? downloadWeb() : downloadNative();

  const handleShare = async () => {
    setSharing(true);
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) await navigator.share({ title: 'My Clipart Studio Art', url: imageUrl });
        else window.alert('Sharing not supported on this browser.');
        return;
      }
      const uri = FileSystem.documentDirectory + `artwork_${style}_${Date.now()}.jpg`;
      const dl = await FileSystem.downloadAsync(imageUrl, uri);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(dl.uri);
      else Alert.alert('Unavailable', 'Sharing is not available on this device.');
    } catch (e) { if (Platform.OS !== 'web') Alert.alert('Error', e.message); }
    finally { setSharing(false); }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgSecondary} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Success Header ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.successBadge}>
            <Text style={styles.successEmoji}>🎨</Text>
          </View>
          <Text style={styles.title}>Your Artwork is Ready!</Text>
          <Text style={styles.subtitle}>Here's your <Text style={styles.styleHighlight}>{style}</Text> style creation</Text>
        </Animated.View>

        {/* ── Image Card (Polaroid-style) ── */}
        <Animated.View style={[styles.imageCard, { opacity: fadeAnim, transform: [{ scale: imgScale }] }]}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardStyleLabel}>{style}</Text>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>AI Generated</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Action Buttons ── */}
        <Animated.View style={[styles.actions, { opacity: btnFade, transform: [{ translateY: btnSlide }] }]}>
          {/* Primary: Save */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={saving}
            style={styles.btnSave}
          >
            {saving
              ? <ActivityIndicator color={COLORS.textWhite} />
              : <>
                  <Text style={styles.btnIcon}>⬇️</Text>
                  <Text style={styles.btnSaveText}>Save to Gallery</Text>
                </>
            }
          </TouchableOpacity>

          {/* Secondary: Share */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleShare}
            disabled={sharing}
            style={styles.btnShare}
          >
            {sharing
              ? <ActivityIndicator color={COLORS.primary} />
              : <>
                  <Text style={styles.btnIcon}>↗️</Text>
                  <Text style={styles.btnShareText}>Share</Text>
                </>
            }
          </TouchableOpacity>
        </Animated.View>

        {/* Create Another */}
        <Animated.View style={{ opacity: btnFade }}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.popToTop()}
            style={styles.btnNew}
          >
            <Text style={styles.btnNewText}>+ Create Another</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgSecondary },
  scroll: {
    paddingTop: 60, paddingHorizontal: SPACING.lg,
    paddingBottom: 60, alignItems: 'center',
  },

  // ── Header ──
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  successBadge: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.md,
    ...MODERN_SHADOW,
  },
  successEmoji: { fontSize: 38 },
  title: { ...FONTS.title, fontSize: 26, textAlign: 'center', marginBottom: 4 },
  subtitle: { ...FONTS.body, color: COLORS.textSecondary, textAlign: 'center' },
  styleHighlight: { color: COLORS.primary, fontWeight: '700' as const },

  // ── Image Card ──
  imageCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    width: IMG_SIZE + SPACING.md * 2,
    alignItems: 'center',
    ...MODERN_BORDER,
    ...MODERN_SHADOW,
  },
  imageWrapper: {
    width: IMG_SIZE, height: IMG_SIZE,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  cardFooter: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  cardStyleLabel: { ...FONTS.subtitle, fontSize: 15, textTransform: 'capitalize' },
  cardBadge: {
    backgroundColor: COLORS.primaryGlow,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  cardBadgeText: { ...FONTS.caption, color: COLORS.primaryDark, fontWeight: '700' as const },

  // ── Actions ──
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
    marginBottom: SPACING.md,
  },
  btnSave: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 18,
    ...GLOW_SHADOW,
  },
  btnShare: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    paddingVertical: 18,
    ...MODERN_BORDER,
    ...CARD_SHADOW,
  },
  btnIcon: { fontSize: 18 },
  btnSaveText:  { ...FONTS.button },
  btnShareText: { ...FONTS.button, color: COLORS.textPrimary },

  btnNew: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.bgCard,
    ...MODERN_BORDER,
    ...CARD_SHADOW,
    marginTop: SPACING.xs,
  },
  btnNewText: { ...FONTS.button, color: COLORS.textSecondary, fontWeight: '600' as const },
});
