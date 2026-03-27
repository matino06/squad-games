import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';
import { useTranslation } from '../../context/LanguageContext';
import { useSpectrum } from '../../context/SpectrumContext';

const BAR_HEIGHT = 420;
const BAR_WIDTH  = 72;

export default function SpectrumClueScreen({ navigation }) {
  const { t } = useTranslation();
  const { state, dispatch } = useSpectrum();
  const [clueText, setClueText] = useState('');

  const clueGiver = state.players[state.clueGiverIndex] ?? { name: '???' };
  const concept   = state.currentConcept ?? { left: '???', right: '???' };

  // Target zone pixel positions inside the bar
  const zonePct    = Math.max(0, state.targetPosition - 10) / 100;
  const zoneTop    = BAR_HEIGHT * zonePct;
  const zoneHeight = BAR_HEIGHT * 0.20;
  // vertical center of zone (for the TARGET arrow label)
  const zoneMidY   = zoneTop + zoneHeight / 2;

  const handleSubmit = () => {
    if (!clueText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: 'SUBMIT_CLUE', payload: clueText.trim() });
    navigation.replace('SpectrumTransition');
  };

  return (
    <LinearGradient colors={['#0d0118', '#1b0424', '#0d0118']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* ── Spectrum bar section ── */}
            <View style={styles.spectrumSection}>

              {/* Top pole label */}
              <Text style={styles.poleTop}>{concept.left}</Text>

              {/* Bar + TARGET arrow side by side */}
              <View style={styles.barRow}>
                {/* The vertical bar */}
                <View style={styles.barShadowWrap}>
                  <LinearGradient
                    colors={['#cf96ff', '#a533ff', '#fd9000', '#8eff71']}
                    style={styles.spectrumBar}
                  >
                    {/* Target zone highlight */}
                    <View style={[styles.targetZone, { top: zoneTop, height: zoneHeight }]}>
                      <View style={styles.targetDot} />
                    </View>
                  </LinearGradient>
                </View>

                {/* TARGET arrow label — floats to the right at zone center */}
                <View style={[styles.targetArrowWrap, { top: zoneMidY - 18 }]}>
                  <MaterialCommunityIcons name="menu-left" size={28} color="white" />
                  <View style={styles.targetBadge}>
                    <Text style={styles.targetBadgeText}>{t('spectrum.clue.target')}</Text>
                  </View>
                </View>
              </View>

              {/* Bottom pole label */}
              <Text style={styles.poleBottom}>{concept.right}</Text>
            </View>

            {/* ── Clue input card ── */}
            <View style={styles.inputCard}>
              <Text style={styles.cardPhaseLabel}>{t('spectrum.clue.role')}</Text>
              <Text style={styles.cardTitle}>{t('spectrum.clue.confirm')}</Text>
              <Text style={styles.cardDesc}>{t('spectrum.clue.instruction')}</Text>

              {/* Floating-label input */}
              <View style={styles.inputOuter}>
                <Text style={styles.floatingLabel}>{t('spectrum.guess.clue_label')}</Text>
                <TextInput
                  style={styles.input}
                  value={clueText}
                  onChangeText={setClueText}
                  placeholder={t('spectrum.clue.input_placeholder')}
                  placeholderTextColor="rgba(138,106,146,0.5)"
                  maxLength={30}
                  returnKeyType="done"
                  autoCapitalize="words"
                  onSubmitEditing={handleSubmit}
                  selectionColor={COLORS.primary}
                />
              </View>

              {/* Confirm button */}
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={clueText.trim() ? 0.85 : 1}
                style={styles.confirmBtnWrap}
              >
                <LinearGradient
                  colors={clueText.trim() ? ['#a533ff', '#cf96ff'] : ['#3a1646', '#2a0b35']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmBtn}
                >
                  <Text style={[styles.confirmBtnText, !clueText.trim() && { color: COLORS.textMuted }]}>
                    {t('spectrum.clue.confirm')}
                  </Text>
                  <MaterialCommunityIcons
                    name="send"
                    size={20}
                    color={clueText.trim() ? '#2a0052' : COLORS.textMuted}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={{ height: 32 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  scroll: { paddingHorizontal: 24, paddingTop: 28 },

  // ── Spectrum section ──
  spectrumSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  poleTop: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
    textShadowColor: 'rgba(207,150,255,0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  poleBottom: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.tertiary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 14,
    textShadowColor: 'rgba(142,255,113,0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  // Bar + TARGET label row
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  barShadowWrap: {
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#cf96ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  spectrumBar: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  // Target zone overlay
  targetZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  targetDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'white',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },

  // TARGET arrow label
  targetArrowWrap: {
    position: 'absolute',
    left: BAR_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetBadge: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  targetBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1b0424',
    letterSpacing: 1,
  },

  // ── Input card ──
  inputCard: {
    backgroundColor: '#22062c',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
    gap: 16,
  },
  cardPhaseLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.tertiary,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
    marginTop: -6,
  },
  cardDesc: {
    fontSize: SIZES.sm,
    color: 'rgba(195,159,202,0.85)',
    lineHeight: 19,
    fontWeight: '500',
  },

  // Floating label input
  inputOuter: {
    borderWidth: 2,
    borderColor: 'rgba(207,150,255,0.45)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 20,
    paddingVertical: 4,
    backgroundColor: '#0d0118',
    position: 'relative',
    marginTop: 8,
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: '#22062c',
    paddingHorizontal: 6,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  input: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    paddingVertical: 14,
    textAlign: 'center',
    letterSpacing: 1,
  },

  // Confirm button
  confirmBtnWrap: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    shadowColor: '#a533ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: RADIUS.full,
  },
  confirmBtnText: {
    fontSize: SIZES.md,
    fontWeight: '900',
    color: '#2a0052',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
