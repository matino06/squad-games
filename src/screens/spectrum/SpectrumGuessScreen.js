import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  PanResponder,
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

export default function SpectrumGuessScreen({ navigation }) {
  const { t } = useTranslation();
  const { state, dispatch } = useSpectrum();

  const guesser = state.players[state.guesserQueue[0]] ?? { name: '???' };
  const concept = state.currentConcept ?? { left: '???', right: '???' };
  const guessPos = state.guessPosition; // 0–100

  const dispatchRef      = useRef(dispatch);
  const initialPctRef    = useRef(0);
  dispatchRef.current = dispatch;

  // Guess marker pixel position inside bar
  const markerTop = (guessPos / 100) * (BAR_HEIGHT - 36);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (e) => {
        Haptics.selectionAsync();
        const pct = Math.max(0, Math.min(100, (e.nativeEvent.locationY / BAR_HEIGHT) * 100));
        initialPctRef.current = pct;
        dispatchRef.current({ type: 'SET_GUESS_POSITION', payload: Math.round(pct) });
      },
      onPanResponderMove: (_, gestureState) => {
        const pct = Math.max(0, Math.min(100,
          initialPctRef.current + (gestureState.dy / BAR_HEIGHT) * 100
        ));
        dispatchRef.current({ type: 'SET_GUESS_POSITION', payload: Math.round(pct) });
      },
      onPanResponderRelease: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    })
  ).current;

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const hasMoreGuessers = state.guesserQueue.length > 1;
    dispatch({ type: 'SUBMIT_GUESS' });
    if (hasMoreGuessers) {
      navigation.replace('SpectrumTransition');
    } else {
      navigation.replace('SpectrumResult');
    }
  };

  return (
    <LinearGradient colors={['#0d0118', '#1b0424', '#0d0118']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.content}>

          {/* ── Player banner ── */}
          <View style={styles.playerBanner}>
            <Text style={styles.playerBannerText}>
              {t('spectrum.guess.current_player')}: {guesser.name.toUpperCase()}
            </Text>
          </View>

          {/* ── Clue display ── */}
          <View style={styles.clueArea}>
            <View style={styles.clueBadge}>
              <Text style={styles.clueBadgeText}>{t('spectrum.guess.clue_label')}</Text>
            </View>
            <Text style={styles.clueWord}>"{state.clue}"</Text>
            <Text style={styles.clueSubtext}>{t('spectrum.guess.instruction')}</Text>
          </View>

          {/* ── Spectrum bar section ── */}
          <View style={styles.spectrumSection}>

            <Text style={styles.poleTop}>{concept.left}</Text>

            <View style={styles.barRow}>
              {/* Outer touch wrapper — NO overflow:hidden so gestures aren't clipped */}
              <View style={styles.barTouchWrapper} {...panResponder.panHandlers}>
                {/* Inner visual wrapper — overflow:hidden only for border radius */}
                <View style={styles.barShadowWrap} pointerEvents="none">
                  <LinearGradient
                    colors={['#cf96ff', '#a533ff', '#fd9000', '#8eff71']}
                    style={styles.spectrumBar}
                  >
                    <View style={[styles.guessMarker, { top: markerTop }]}>
                      <View style={styles.guessDot} />
                    </View>
                  </LinearGradient>
                </View>
              </View>

              {/* GUESS arrow label */}
              <View style={[styles.guessArrowWrap, { top: markerTop }]}>
                <MaterialCommunityIcons name="menu-left" size={28} color="white" />
                <View style={styles.guessBadge}>
                  <Text style={styles.guessBadgeText}>{t('spectrum.guess.your_guess')}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.poleBottom}>{concept.right}</Text>
          </View>

          {/* ── Submit button ── */}
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            style={styles.submitBtnWrap}
          >
            <LinearGradient
              colors={['#a533ff', '#cf96ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              <Text style={styles.submitBtnText}>{t('spectrum.guess.submit')}</Text>
              <MaterialCommunityIcons name="lightning-bolt" size={22} color="#480079" />
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  // ── Player banner ──
  playerBanner: { alignItems: 'center' },
  playerBannerText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#c683ff',
    letterSpacing: 3.5,
    textTransform: 'uppercase',
  },

  // ── Clue area ──
  clueArea: { alignItems: 'center', gap: 10 },
  clueBadge: {
    backgroundColor: '#32113d',
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  clueBadgeText: {
    fontSize: 10, fontWeight: '800', color: COLORS.tertiary, letterSpacing: 2, textTransform: 'uppercase',
  },
  clueWord: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
    textAlign: 'center',
  },
  clueSubtext: {
    fontSize: SIZES.md,
    fontStyle: 'italic',
    color: 'rgba(195,159,202,0.75)',
    textAlign: 'center',
  },

  // ── Spectrum section (mirrors ClueScreen) ──
  spectrumSection: {
    alignItems: 'center',
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

  // Bar + GUESS label row
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  // Outer touch area — no overflow:hidden, gestures pass through freely
  barTouchWrapper: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    shadowColor: '#cf96ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  // Inner visual container — overflow:hidden only for border radius clipping
  barShadowWrap: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: 40,
    overflow: 'hidden',
  },
  spectrumBar: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  // Guess marker overlay
  guessMarker: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  guessDot: {
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

  // GUESS arrow label
  guessArrowWrap: {
    position: 'absolute',
    left: BAR_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
  },
  guessBadge: {
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
  guessBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1b0424',
    letterSpacing: 1,
  },

  // Submit button
  submitBtnWrap: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    shadowColor: '#a533ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: RADIUS.full,
  },
  submitBtnText: {
    fontSize: SIZES.md,
    fontWeight: '900',
    color: '#480079',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
});
