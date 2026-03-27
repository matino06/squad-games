import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';
import { useTranslation } from '../../context/LanguageContext';
import { useSpectrum } from '../../context/SpectrumContext';

export default function SpectrumTransitionScreen({ navigation }) {
  const { t } = useTranslation();
  const { state, dispatch } = useSpectrum();

  const isCluePhase = state.phase === 'transition_clue';
  const playerIndex = isCluePhase ? state.clueGiverIndex : state.guesserQueue[0];
  const player = state.players[playerIndex] ?? { name: '???' };

  // Pulse animation for player name
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleReady = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isCluePhase) {
      dispatch({ type: 'READY_TO_GIVE_CLUE' });
      navigation.replace('SpectrumClue');
    } else {
      dispatch({ type: 'READY_TO_GUESS' });
      navigation.replace('SpectrumGuess');
    }
  };

  return (
    <LinearGradient colors={['#0d0118', '#1b0424', '#0d0118']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        {/* Main content — centered */}
        <View style={styles.content}>

          {/* "PRIPREMI SE" tag — slightly rotated */}
          <View style={styles.prepareBadgeWrap}>
            <View style={styles.prepareBadge}>
              <Text style={styles.prepareBadgeText}>{t('spectrum.transition.prepare')}</Text>
            </View>
          </View>

          {/* Player name section */}
          <View style={styles.nameSection}>
            <Text style={styles.nextLabel}>{t('spectrum.transition.next_player')}</Text>
            <Animated.Text
              style={[styles.playerName, { transform: [{ scale: pulseAnim }] }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {player.name}
            </Animated.Text>
          </View>

          {/* Hero icon box */}
          <View style={styles.heroWrap}>
            {/* Ambient glow behind */}
            <View style={styles.heroGlow} pointerEvents="none" />
            {/* Box */}
            <View style={styles.heroBox}>
              {/* Hand icon */}
              <MaterialCommunityIcons name="hand-wave" size={96} color="#c683ff" />
              {/* Phone icon — overlaid top-right */}
              <View style={styles.phoneIconWrap}>
                <MaterialCommunityIcons name="cellphone" size={60} color={COLORS.tertiary} />
              </View>
            </View>
          </View>

          {/* Instruction text */}
          <Text style={styles.instructionText}>{t('spectrum.transition.handoff')}</Text>
        </View>

        {/* SPREMAN SAM button — gradient border style */}
        <View style={styles.btnArea}>
          <TouchableOpacity onPress={handleReady} activeOpacity={0.85} style={styles.gradientBorderOuter}>
            <LinearGradient
              colors={['#a533ff', '#cf96ff', '#8eff71']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBorderLayer}
            >
              <View style={styles.gradientBorderInner}>
                <Text style={styles.readyBtnText}>{t('spectrum.transition.ready')}</Text>
                <MaterialCommunityIcons name="play-circle" size={24} color={COLORS.primary} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  safe: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // ── Main centered content ──
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },

  // ── "PRIPREMI SE" badge ──
  prepareBadgeWrap: {
    transform: [{ rotate: '-2deg' }],
    marginBottom: 40,
  },
  prepareBadge: {
    backgroundColor: '#3a1646',
    borderWidth: 1,
    borderColor: 'rgba(90,61,98,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  prepareBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },

  // ── Player name ──
  nameSection: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 36,
  },
  nextLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  playerName: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(207,150,255,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },

  // ── Hero icon box ──
  heroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  heroGlow: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(207,150,255,0.18)',
  },
  heroBox: {
    width: 192,
    height: 192,
    borderRadius: 20,
    backgroundColor: '#32113d',
    borderWidth: 1,
    borderColor: 'rgba(90,61,98,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  phoneIconWrap: {
    position: 'absolute',
    top: 28,
    right: 20,
    transform: [{ rotate: '12deg' }],
  },

  // ── Instruction text ──
  instructionText: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  // ── Gradient border button ──
  btnArea: {
    paddingHorizontal: 8,
    paddingBottom: 40,
  },
  gradientBorderOuter: {
    borderRadius: RADIUS.full,
    shadowColor: '#a533ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientBorderLayer: {
    borderRadius: RADIUS.full,
    padding: 1.5,
  },
  gradientBorderInner: {
    backgroundColor: '#1b0424',
    borderRadius: RADIUS.full,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  readyBtnText: {
    fontSize: SIZES.md,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
