import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useAlias } from '../../context/AliasContext';
import { useTranslation } from '../../context/LanguageContext';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';

const CIRCLE_RADIUS = 80;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function AliasGameScreen({ navigation }) {
  const { state, dispatch } = useAlias();
  const { t } = useTranslation();

  const { roundDuration, currentTeam, teamA, teamB, currentWords, wordIndex } = state;
  const team = currentTeam === 'A' ? teamA : teamB;
  const teamColor = currentTeam === 'A' ? '#cf96ff' : '#fd9000';

  const [timeLeft, setTimeLeft] = useState(roundDuration);
  const [ended, setEnded]       = useState(false);

  // Track intentional navigation (timer end) so swipe-back is the only unintentional exit
  const intentionalNav = useRef(false);

  // Reset scores on swipe-back
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', () => {
      if (!intentionalNav.current) dispatch({ type: 'RESET_KEEP_SETTINGS' });
    });
    return unsub;
  }, [navigation, dispatch]);

  // Animated value for the circular timer arc
  const animProgress = useRef(new Animated.Value(1)).current;

  // strokeDashoffset = circumference * (1 - progress)
  const strokeDashoffset = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCLE_CIRCUMFERENCE, 0],
  });

  // Countdown effect
  useEffect(() => {
    if (ended) return;

    // Animate the circle from full to empty over roundDuration seconds
    Animated.timing(animProgress, {
      toValue: 0,
      duration: roundDuration * 1000,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When timer hits 0, end round and navigate
  useEffect(() => {
    if (timeLeft === 0 && !ended) {
      setEnded(true);
      intentionalNav.current = true;
      dispatch({ type: 'END_ROUND' });
      navigation.replace('AliasScore');
    }
  }, [timeLeft, ended, dispatch, navigation]);

  const currentWord = currentWords[wordIndex] ?? '—';

  const handleAnswer = (correct) => {
    Haptics.impactAsync(
      correct ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    dispatch({ type: 'NEXT_WORD', payload: { correct } });
  };

  // Determine timer color based on remaining time
  const timerColor = timeLeft > 20
    ? teamColor
    : timeLeft > 10
    ? '#fd9000'
    : '#ff6e84';

  const correctCount = state.roundResults.filter((r) => r.correct).length;

  return (
    <LinearGradient colors={['#0d0118', '#1b0424', '#0d0118']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>

        {/* ── Top info bar ── */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Text style={styles.playingLabel}>{t('alias.game.playing_now')}</Text>
            <Text style={[styles.teamNameText, { color: teamColor }]}>{team.name}</Text>
          </View>
          <View style={styles.scoreChip}>
            <Text style={styles.scoreLabel}>{t('alias.game.score')}</Text>
            <Text style={[styles.scoreValue, { color: teamColor }]}>{team.score + correctCount}</Text>
          </View>
        </View>

        {/* ── Timer ── */}
        <View style={styles.timerSection}>
          <Svg width={200} height={200} style={styles.timerSvg}>
            {/* Background track */}
            <Circle
              cx={100}
              cy={100}
              r={CIRCLE_RADIUS}
              stroke="rgba(207,150,255,0.08)"
              strokeWidth={10}
              fill="none"
            />
            {/* Animated progress arc */}
            <AnimatedCircle
              cx={100}
              cy={100}
              r={CIRCLE_RADIUS}
              stroke={timerColor}
              strokeWidth={10}
              fill="none"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin="100, 100"
            />
          </Svg>
          <View style={styles.timerCenter} pointerEvents="none">
            <Text style={[styles.timerNumber, { color: timerColor }]}>{timeLeft}</Text>
          </View>
        </View>

        {/* ── Describe hint ── */}
        <Text style={styles.describeHint}>{t('alias.game.describe')}</Text>

        {/* ── Word card ── */}
        <View style={styles.wordCardWrapper}>
          <LinearGradient
            colors={['rgba(207,150,255,0.25)', 'rgba(165,51,255,0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wordCardBorder}
          >
            <View style={styles.wordCard}>
              <Text style={styles.wordText}>{currentWord}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* ── Action buttons ── */}
        <View style={styles.actionsRow}>
          {/* SKIP */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.skipBtn]}
            onPress={() => handleAnswer(false)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="close" size={30} color="#ff6e84" />
            <Text style={styles.skipBtnText}>{t('alias.game.skip')}</Text>
          </TouchableOpacity>

          {/* CORRECT */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.correctBtn]}
            onPress={() => handleAnswer(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="check" size={30} color="#8eff71" />
            <Text style={styles.correctBtnText}>{t('alias.game.correct')}</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24, paddingTop: 12, backgroundColor: 'transparent' },

  // ── Top bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 12,
    marginHorizontal: 16,
  },
  topBarLeft: { gap: 2 },
  playingLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  teamNameText: {
    fontSize: SIZES.xxl,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  scoreChip: {
    backgroundColor: '#2a0b35',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.12)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },

  // ── Timer ──
  timerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
    height: 200,
  },
  timerSvg: {
    position: 'absolute',
  },
  timerCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  timerNumber: {
    fontSize: 60,
    fontWeight: '900',
    letterSpacing: -3,
  },

  // ── Describe hint ──
  describeHint: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },

  // ── Word card ──
  wordCardWrapper: {
    marginHorizontal: 16,
    marginBottom: 32,
    transform: [{ rotate: '1deg' }],
    shadowColor: '#a533ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  wordCardBorder: {
    padding: 2,
    borderRadius: 20,
  },
  wordCard: {
    backgroundColor: '#2a0b35',
    borderRadius: 18,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
  wordText: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 46,
  },

  // ── Action buttons ──
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    height: 84,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
  },
  skipBtn: {
    backgroundColor: 'rgba(255,110,132,0.1)',
    borderColor: 'rgba(255,110,132,0.4)',
  },
  skipBtnText: {
    fontSize: SIZES.sm,
    fontWeight: '800',
    color: '#ff6e84',
    letterSpacing: 1.5,
  },
  correctBtn: {
    backgroundColor: 'rgba(142,255,113,0.1)',
    borderColor: 'rgba(142,255,113,0.4)',
  },
  correctBtnText: {
    fontSize: SIZES.sm,
    fontWeight: '800',
    color: '#8eff71',
    letterSpacing: 1.5,
  },
});
