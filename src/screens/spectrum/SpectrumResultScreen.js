import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';
import { useLanguage, useTranslation } from '../../context/LanguageContext';
import { useSpectrum } from '../../context/SpectrumContext';

const BAR_H       = 24;
const ABOVE       = 52;   // space above bar for pin line
const BELOW       = 36;   // space below bar for circle
const CIRCLE_SIZE = 32;

function getVerdict(score, t) {
  if (score === 4) return { text: t('spectrum.result.bullseye'), color: COLORS.tertiary };
  if (score === 2) return { text: t('spectrum.result.close'),   color: COLORS.primary };
  if (score === 1) return { text: t('spectrum.result.okay'),    color: COLORS.secondary };
  return             { text: t('spectrum.result.miss'),          color: '#ff6e84' };
}

export default function SpectrumResultScreen({ navigation }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { state, dispatch } = useSpectrum();
  const [barWidth, setBarWidth] = useState(0);

  const concept = state.currentConcept ?? { left: '???', right: '???' };

  // Build per-player round data: playerIndex → {score, guessPosition}
  const roundDataMap = {};
  state.roundScores.forEach(({ playerIndex, score, guessPosition }) => {
    roundDataMap[playerIndex] = { score, guessPosition };
  });

  // Default: show the guesser with the best score this round
  const bestEntry = state.roundScores.reduce(
    (best, entry) => (entry.score > (best?.score ?? -1) ? entry : best),
    null
  );
  const [selectedIdx, setSelectedIdx] = useState(bestEntry?.playerIndex ?? null);

  const selected = selectedIdx !== null ? roundDataMap[selectedIdx] : null;
  const displayGuessPos = selected?.guessPosition ?? 50;
  const displayScore    = selected?.score ?? 0;
  const verdict = getVerdict(displayScore, t);

  // Map player name → playerIndex (for sorted list)
  const nameToIdx = {};
  state.players.forEach((p, i) => { nameToIdx[p.name] = i; });

  const sorted = [...state.players].sort((a, b) => b.score - a.score);

  // Pixel positions inside the bar
  const targetLeft  = barWidth > 0 ? barWidth * Math.max(0, state.targetPosition - 10) / 100 : 0;
  const targetZoneW = barWidth > 0 ? barWidth * 0.20 : 0;
  const pinCenterX  = barWidth > 0 ? barWidth * displayGuessPos / 100 : 0;

  const hasWinner = state.players.some(p => p.score >= state.winScore);

  const handleNextRound = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (hasWinner) {
      navigation.replace('SpectrumFinal');
    } else {
      dispatch({ type: 'NEXT_ROUND', payload: { language } });
      navigation.replace('SpectrumTransition');
    }
  };

  return (
    <LinearGradient colors={['#0d0118', '#1b0424', '#0d0118']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Result Card ── */}
          <View style={styles.resultCard}>

            {/* Card header */}
            <View style={styles.cardHeader}>
              <Text style={styles.roundCompleteLabel}>{t('spectrum.result.round_end')}</Text>
              <Text style={[styles.verdictText, {
                color: verdict.color,
                textShadowColor: verdict.color + '88',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 16,
              }]}>
                {verdict.text}
              </Text>
            </View>

            {/* Spectrum reveal */}
            <View style={styles.spectrumSection}>

              {/* Bar + overlaid elements container */}
              <View
                style={styles.barContainer}
                onLayout={e => setBarWidth(e.nativeEvent.layout.width)}
              >
                {/* The gradient bar */}
                <LinearGradient
                  colors={['#a533ff', '#cf96ff', '#8eff71', '#fd9000', '#ff6e84']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.bar}
                />

                {/* Target zone — extends above and below bar */}
                {barWidth > 0 && (
                  <View style={[styles.targetZone, {
                    left: targetLeft,
                    width: targetZoneW,
                    top: ABOVE - 12,
                    height: BAR_H + 24,
                  }]}>
                    {/* Inner accent + score */}
                    <View style={styles.targetZoneInner}>
                      <Text style={styles.targetZoneScore}>+{displayScore}</Text>
                    </View>
                  </View>
                )}

                {/* Guess pin line — goes from top down to bar bottom */}
                {barWidth > 0 && (
                  <View style={[styles.pinLine, {
                    left: pinCenterX - 2,
                    top: 0,
                    height: ABOVE + BAR_H,
                  }]} />
                )}

                {/* Guess pin circle — sits below bar */}
                {barWidth > 0 && (
                  <View style={[styles.pinCircle, {
                    left: pinCenterX - CIRCLE_SIZE / 2,
                    top: ABOVE + BAR_H - CIRCLE_SIZE / 4,
                  }]}>
                    <MaterialCommunityIcons name="account-group" size={14} color="#480079" />
                  </View>
                )}
              </View>

              {/* Scale labels */}
              <View style={styles.scaleLabels}>
                <View>
                  <Text style={styles.scalePoleHint}>{t('spectrum.result.left_pole')}</Text>
                  <Text style={styles.scalePole}>{concept.left}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.scalePoleHint}>{t('spectrum.result.right_pole')}</Text>
                  <Text style={styles.scalePole}>{concept.right}</Text>
                </View>
              </View>

              {/* Prompt quote */}
              <Text style={styles.promptQuote}>
                "{state.clue}" — {concept.left} → {concept.right}
              </Text>
            </View>

            {/* Leaderboard */}
            <View style={styles.leaderboardSection}>
              <View style={styles.leaderboardDivider} />
              <Text style={styles.leaderboardTitle}>{t('spectrum.result.leaderboard')}</Text>
              {sorted.map((player, idx) => {
                const isFirst    = idx === 0;
                const pIdx       = nameToIdx[player.name];
                const roundData  = roundDataMap[pIdx];
                const isGuesser  = roundData !== undefined;
                const isSelected = pIdx === selectedIdx;
                return (
                  <TouchableOpacity
                    key={player.name + idx}
                    activeOpacity={isGuesser ? 0.7 : 1}
                    onPress={() => {
                      if (!isGuesser) return;
                      Haptics.selectionAsync();
                      setSelectedIdx(pIdx);
                    }}
                    style={[
                      styles.lbRow,
                      !isFirst && { opacity: 0.85 },
                      isSelected && styles.lbRowSelected,
                    ]}
                  >
                    <View style={[styles.rankCircle, isFirst && styles.rankCircleFirst]}>
                      <Text style={[styles.rankText, isFirst && { color: COLORS.primary }]}>
                        {idx + 1}
                      </Text>
                    </View>
                    <Text style={[styles.lbName, isFirst && { color: COLORS.text, fontWeight: '700' }]}>
                      {player.name}
                    </Text>
                    {isGuesser ? (
                      <View style={[styles.roundScoreChip, isSelected && styles.roundScoreChipSelected]}>
                        <Text style={styles.roundScoreChipText}>+{roundData.score}</Text>
                      </View>
                    ) : null}
                    <Text style={[styles.lbScore, isFirst && { color: isFirst ? COLORS.primary : COLORS.text }]}>
                      {player.score}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Action buttons (outside card) ── */}
          <TouchableOpacity onPress={handleNextRound} activeOpacity={0.85} style={styles.nextBtnWrap}>
            <LinearGradient
              colors={['#a533ff', '#cf96ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextBtn}
            >
              <MaterialCommunityIcons
                name={hasWinner ? 'trophy' : 'fast-forward'}
                size={26}
                color="#480079"
              />
              <Text style={styles.nextBtnText}>
                {hasWinner ? t('spectrum.result.see_winner') : t('spectrum.result.next_round')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  scroll: { paddingHorizontal: 20, paddingTop: 24, gap: 16 },

  // ── Result Card ──
  resultCard: {
    backgroundColor: '#2a0b35',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(90,61,98,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 12,
    overflow: 'hidden',
  },

  // Card header
  cardHeader: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    gap: 6,
  },
  roundCompleteLabel: {
    fontSize: 11, fontWeight: '800', color: COLORS.tertiary,
    letterSpacing: 3.5, textTransform: 'uppercase',
  },
  verdictText: {
    fontSize: 44, fontWeight: '900', fontStyle: 'italic',
    letterSpacing: -1.5,
  },

  // Spectrum section
  spectrumSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },

  // Bar container — tall enough for pin above + bar + circle below
  barContainer: {
    height: ABOVE + BAR_H + BELOW,
    position: 'relative',
  },
  bar: {
    position: 'absolute',
    left: 0, right: 0,
    top: ABOVE,
    height: BAR_H,
    borderRadius: BAR_H / 2,
    opacity: 0.85,
  },

  // Target zone
  targetZone: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.tertiary,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.tertiary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  targetZoneInner: {
    width: '50%',
    height: '100%',
    backgroundColor: 'rgba(142,255,113,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  targetZoneScore: {
    fontSize: 11, fontWeight: '900', color: COLORS.tertiary, letterSpacing: 1,
  },

  // Guess pin
  pinLine: {
    position: 'absolute',
    width: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  pinCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE, height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.text,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },

  // Scale labels
  scaleLabels: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  scalePoleHint: {
    fontSize: 9, fontWeight: '800', color: 'rgba(138,106,146,0.7)',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2,
  },
  scalePole: {
    fontSize: 16, fontWeight: '900', color: COLORS.text, letterSpacing: 0.5,
  },

  // Prompt quote
  promptQuote: {
    fontSize: 13, fontStyle: 'italic',
    color: 'rgba(251,219,255,0.5)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  // Leaderboard
  leaderboardSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  leaderboardDivider: {
    height: 1,
    backgroundColor: 'rgba(90,61,98,0.18)',
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 10, fontWeight: '800', color: 'rgba(138,106,146,0.8)',
    letterSpacing: 3, textTransform: 'uppercase',
    textAlign: 'center', marginBottom: 16,
  },
  lbRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#22062c',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(90,61,98,0.12)',
  },
  rankCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(90,61,98,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  rankCircleFirst: { backgroundColor: 'rgba(207,150,255,0.15)' },
  rankText: {
    fontSize: 13, fontWeight: '800', color: 'rgba(138,106,146,0.8)',
  },
  lbName: {
    flex: 1, fontSize: SIZES.md, fontWeight: '600', color: 'rgba(251,219,255,0.75)',
  },
  lbRowSelected: {
    borderColor: 'rgba(207,150,255,0.4)',
    borderWidth: 1,
    backgroundColor: '#2e0e3d',
  },
  roundScoreChip: {
    backgroundColor: 'rgba(142,255,113,0.1)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  roundScoreChipSelected: {
    backgroundColor: 'rgba(142,255,113,0.25)',
  },
  roundScoreChipText: {
    fontSize: 11, fontWeight: '900', color: COLORS.tertiary, letterSpacing: 1,
  },
  lbScore: {
    fontSize: 20, fontWeight: '900', color: 'rgba(251,219,255,0.75)',
    minWidth: 30, textAlign: 'right',
  },

  // ── Action buttons ──
  nextBtnWrap: {
    borderRadius: 18, overflow: 'hidden',
    shadowColor: '#cf96ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingVertical: 20, borderRadius: 18,
  },
  nextBtnText: {
    fontSize: SIZES.lg, fontWeight: '900', color: '#480079',
    letterSpacing: 2, textTransform: 'uppercase',
  },
});
