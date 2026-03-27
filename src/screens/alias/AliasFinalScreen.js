import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';
import { useTranslation } from '../../context/LanguageContext';
import { useAlias } from '../../context/AliasContext';

export default function AliasFinalScreen({ navigation }) {
  const { t } = useTranslation();
  const { state, dispatch } = useAlias();

  const { teamA, teamB } = state;

  const isTie = teamA.score === teamB.score;
  const winner = !isTie
    ? (teamA.score > teamB.score ? teamA : teamB)
    : null;
  const winnerColor = !isTie
    ? (teamA.score > teamB.score ? '#cf96ff' : '#fd9000')
    : null;

  const bounceAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, []);

  const trophyScale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const handleNewGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: 'RESET_KEEP_SETTINGS' });
    navigation.navigate('AliasSetup');
  };

  const handleHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch({ type: 'RESET' });
    navigation.navigate('Home');
  };

  return (
    <LinearGradient colors={['#0d0118', '#1b0424', '#0d0118']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>

        {/* Ambient glow */}
        <View style={styles.ambientContainer} pointerEvents="none">
          {[380, 310, 245, 185, 130, 80, 40].map((size, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: 'rgba(165,51,255,0.022)',
              }}
            />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ══ Winner Hero ══ */}
          <View style={styles.heroSection}>
            <Animated.View style={[styles.trophyWrap, { transform: [{ scale: trophyScale }] }]}>
              <View style={styles.glowOuter} />
              <View style={styles.glowInner} />
              <View style={styles.trophyCircle}>
                <MaterialCommunityIcons name="trophy" size={60} color="#fd9000" />
              </View>
            </Animated.View>

            <Text style={styles.winnerLabel}>
              {isTie ? t('alias.final.tie') : t('alias.final.winner')}
            </Text>

            {!isTie && (
              <Text style={[styles.winnerName, { color: winnerColor }]}>
                {winner.name.toUpperCase()}
              </Text>
            )}

            {!isTie && (
              <View style={styles.scoreChip}>
                <MaterialCommunityIcons name="star-four-points" size={14} color="#fff6f1" />
                <Text style={styles.scoreChipText}>{winner.score} pts</Text>
              </View>
            )}
          </View>

          {/* ══ Scores Card ══ */}
          <View style={styles.scoresCard}>
            {/* Team A */}
            <View style={[styles.teamRow, teamA.score > teamB.score && styles.teamRowWinner]}>
              <LinearGradient colors={['#2d0050', '#1d003a']} style={styles.teamRowInner}>
                <View style={[styles.teamDot, { backgroundColor: '#cf96ff' }]} />
                <Text style={styles.teamRowName} numberOfLines={1}>{teamA.name}</Text>
                <Text style={[styles.teamRowScore, { color: '#cf96ff' }]}>{teamA.score}</Text>
                <Text style={styles.teamRowRounds}>{teamA.rounds} rnd</Text>
              </LinearGradient>
            </View>

            {/* Team B */}
            <View style={[styles.teamRow, teamB.score > teamA.score && styles.teamRowWinner]}>
              <LinearGradient colors={['#2a1500', '#1a0d00']} style={styles.teamRowInner}>
                <View style={[styles.teamDot, { backgroundColor: '#fd9000' }]} />
                <Text style={styles.teamRowName} numberOfLines={1}>{teamB.name}</Text>
                <Text style={[styles.teamRowScore, { color: '#fd9000' }]}>{teamB.score}</Text>
                <Text style={styles.teamRowRounds}>{teamB.rounds} rnd</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={{ height: 200 }} />
        </ScrollView>

        {/* ══ Fixed footer ══ */}
        <LinearGradient
          colors={['transparent', 'rgba(27,4,36,0.9)', '#1b0424']}
          style={styles.footer}
          pointerEvents="box-none"
        >
          <TouchableOpacity onPress={handleNewGame} activeOpacity={0.85} style={styles.newGameBtnWrap}>
            <LinearGradient
              colors={['#a533ff', '#cf96ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.newGameBtn}
            >
              <Text style={styles.newGameBtnText}>{t('alias.final.new_game')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleHome} activeOpacity={0.8} style={styles.homeBtn}>
            <Text style={styles.homeBtnText}>{t('alias.final.home')}</Text>
          </TouchableOpacity>
        </LinearGradient>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  scroll: { paddingHorizontal: 24, paddingTop: 25 },

  ambientContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 420,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Hero ──
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 4,
  },
  trophyWrap: {
    width: 200, height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  glowOuter: {
    position: 'absolute',
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: 'rgba(253,144,0,0.01)',
    shadowColor: '#fd9000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 90,
  },
  glowInner: {
    position: 'absolute',
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: 'rgba(253,144,0,0.06)',
    shadowColor: '#fd9000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 40,
  },
  trophyCircle: {
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: '#3a1646',
    borderWidth: 4,
    borderColor: '#fd9000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fd9000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  winnerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fd9000',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  winnerName: {
    fontSize: 44,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(207,150,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  scoreChip: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#8e4e00',
  },
  scoreChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff6f1',
    letterSpacing: 1.5,
  },

  // ── Scores Card ──
  scoresCard: {
    gap: 10,
  },
  teamRow: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.12)',
  },
  teamRowWinner: {
    borderColor: '#fd9000',
    shadowColor: '#fd9000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  teamRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  teamDot: {
    width: 10, height: 10, borderRadius: 5,
  },
  teamRowName: {
    flex: 1,
    fontSize: SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  teamRowScore: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
  },
  teamRowRounds: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1,
    minWidth: 30,
    textAlign: 'right',
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 48,
    gap: 14,
  },
  newGameBtnWrap: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    shadowColor: '#a533ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 10,
  },
  newGameBtn: {
    paddingVertical: 20,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newGameBtnText: {
    fontSize: SIZES.lg,
    fontWeight: '900',
    color: '#480079',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  homeBtn: {
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#421b4f',
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.2)',
  },
  homeBtnText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: '#cf96ff',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});
