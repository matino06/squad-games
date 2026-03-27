import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlias } from '../../context/AliasContext';
import { useTranslation } from '../../context/LanguageContext';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';

export default function AliasScoreScreen({ navigation }) {
  const { state, dispatch } = useAlias();
  const { t } = useTranslation();

  const { teamA, teamB, currentTeam, roundResults, roundNumber, gameOver } = state;

  const intentionalNav = useRef(false);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', () => {
      if (!intentionalNav.current) dispatch({ type: 'RESET_KEEP_SETTINGS' });
    });
    return unsub;
  }, [navigation, dispatch]);

  // The team that just played
  const playingTeam  = currentTeam === 'A' ? teamA : teamB;
  const teamColor    = currentTeam === 'A' ? '#cf96ff' : '#fd9000';

  const correctWords = roundResults.filter((r) => r.correct);
  const skippedWords = roundResults.filter((r) => !r.correct);
  const correctCount = correctWords.length;

  // Determine who leads
  const leadingTeam = teamA.score > teamB.score
    ? teamA.name
    : teamB.score > teamA.score
    ? teamB.name
    : null;

  const dominatesText = leadingTeam
    ? t('alias.score.dominates').replace('{{team}}', leadingTeam)
    : null;

  const handleNextRound = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    intentionalNav.current = true;
    if (state.gameOver) {
      navigation.replace('AliasFinal');
    } else {
      dispatch({ type: 'NEXT_ROUND' });
      navigation.replace('AliasReady');
    }
  };

  const handleNewGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    intentionalNav.current = true;
    dispatch({ type: 'RESET_KEEP_SETTINGS' });
    navigation.navigate('AliasSetup');
  };

  const handleExit = () => {
    Haptics.selectionAsync();
    intentionalNav.current = true;
    dispatch({ type: 'RESET' });
    navigation.navigate('Home');
  };

  return (
    <LinearGradient colors={['#0d0118', '#1b0424', '#0d0118']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.roundEndLabel}>{t('alias.score.round_end')}</Text>

            {/* +N points circle */}
            <View style={styles.pointsCircle}>
              <LinearGradient
                colors={[teamColor + '33', teamColor + '11']}
                style={styles.pointsCircleInner}
              >
                <Text style={[styles.pointsNumber, { color: teamColor }]}>+{correctCount}</Text>
                <Text style={[styles.pointsLabel, { color: teamColor + 'aa' }]}>
                  {t('alias.score.points')}
                </Text>
              </LinearGradient>
            </View>

            {/* Dominates text */}
            {dominatesText && (
              <Text style={styles.dominatesText}>{dominatesText}</Text>
            )}
          </View>

          {/* ── Words this round ── */}
          <Text style={styles.sectionLabel}>{t('alias.score.guessed_words')}</Text>
          <View style={styles.wordList}>
            {correctWords.map((item, i) => (
              <View key={`c-${i}`} style={[styles.wordRow, styles.wordRowCorrect]}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#8eff71" />
                <Text style={styles.wordRowText}>{item.word}</Text>
              </View>
            ))}
            {skippedWords.map((item, i) => (
              <View key={`s-${i}`} style={[styles.wordRow, styles.wordRowSkipped]}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#ff6e84" />
                <Text style={[styles.wordRowText, styles.wordRowTextSkipped]}>{item.word}</Text>
              </View>
            ))}
            {roundResults.length === 0 && (
              <Text style={styles.emptyText}>—</Text>
            )}
          </View>

          {/* Result summary */}
          <View style={styles.resultSummary}>
            <Text style={styles.resultText}>
              {t('alias.score.result')
                .replace('{{correct}}', correctCount)
                .replace('{{total}}', roundResults.length)}
            </Text>
          </View>

          {/* ── Score comparison ── */}
          <View style={styles.scoresRow}>
            <View style={[styles.scoreCard, { borderColor: 'rgba(207,150,255,0.3)' }]}>
              <LinearGradient colors={['#2d0050', '#1d003a']} style={styles.scoreCardInner}>
                <View style={[styles.scoreColorDot, { backgroundColor: '#cf96ff' }]} />
                <Text style={styles.scoreCardName} numberOfLines={1}>{teamA.name}</Text>
                <Text style={[styles.scoreCardValue, { color: '#cf96ff' }]}>{teamA.score}</Text>
                <Text style={styles.scoreCardRounds}>
                  {teamA.rounds} {t('alias.score.rounds')}
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.scoreDivider}>
              <Text style={styles.scoreDividerText}>:</Text>
            </View>

            <View style={[styles.scoreCard, { borderColor: 'rgba(253,144,0,0.3)' }]}>
              <LinearGradient colors={['#2a1500', '#1a0d00']} style={styles.scoreCardInner}>
                <View style={[styles.scoreColorDot, { backgroundColor: '#fd9000' }]} />
                <Text style={styles.scoreCardName} numberOfLines={1}>{teamB.name}</Text>
                <Text style={[styles.scoreCardValue, { color: '#fd9000' }]}>{teamB.score}</Text>
                <Text style={styles.scoreCardRounds}>
                  {teamB.rounds} {t('alias.score.rounds')}
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* ── Buttons ── */}
          <View style={styles.btnsCol}>
            {/* Next round / See winner */}
            <TouchableOpacity onPress={handleNextRound} activeOpacity={0.85}>
              <LinearGradient
                colors={['#a533ff', '#cf96ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextBtn}
              >
                <MaterialCommunityIcons
                  name={gameOver ? 'trophy' : 'swap-horizontal'}
                  size={20}
                  color="#2a0052"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.nextBtnText}>
                  {gameOver ? t('alias.score.see_winner') : t('alias.score.next_round')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* New game */}
            <TouchableOpacity onPress={handleNewGame} activeOpacity={0.85} style={styles.exitBtn}>
              <Text style={styles.exitBtnText}>{t('alias.score.new_game')}</Text>
            </TouchableOpacity>

            {/* Exit */}
            <TouchableOpacity onPress={handleExit} activeOpacity={0.85} style={styles.exitBtn}>
              <Text style={styles.exitBtnText}>{t('alias.score.exit')}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: 20, paddingTop: 32, gap: 16 },

  // ── Header ──
  header: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  roundEndLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  pointsCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#a533ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  pointsCircleInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsNumber: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -2,
  },
  pointsLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dominatesText: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // ── Section label ──
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },

  // ── Word list ──
  wordList: {
    backgroundColor: '#22062c',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.08)',
    overflow: 'hidden',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
  },
  wordRowCorrect: {
    borderLeftColor: '#8eff71',
    backgroundColor: 'rgba(142,255,113,0.04)',
  },
  wordRowSkipped: {
    borderLeftColor: '#ff6e84',
    backgroundColor: 'rgba(255,110,132,0.04)',
  },
  wordRowText: {
    flex: 1,
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  wordRowTextSkipped: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    padding: 20,
    fontSize: SIZES.md,
  },

  // ── Result summary ──
  resultSummary: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
  },

  // ── Scores ──
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  scoreCardInner: {
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  scoreColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scoreCardName: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  scoreCardValue: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
  },
  scoreCardRounds: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1,
    textAlign: 'center',
  },
  scoreDivider: {
    width: 32,
    alignItems: 'center',
  },
  scoreDividerText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textMuted,
  },

  // ── Buttons ──
  btnsCol: {
    gap: 12,
    marginTop: 8,
  },
  nextBtn: {
    height: 62,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a533ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  nextBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2a0052',
    letterSpacing: 1.5,
  },
  exitBtn: {
    height: 54,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: 'rgba(207,150,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
});
