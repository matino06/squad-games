import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useIntrigue } from '../../context/IntrigueContext';
import { useTranslation } from '../../context/LanguageContext';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';

export default function IntrigueVictoryScreen({ navigation }) {
  const { state, dispatch } = useIntrigue();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { players, winner } = state;
  const winnerPlayer = players.find((p) => p.id === winner);

  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNewGame = () => {
    Haptics.selectionAsync();
    dispatch({ type: 'RESET' });
    navigation.replace('IntrigueSetup');
  };

  const handleExit = () => {
    Haptics.selectionAsync();
    dispatch({ type: 'RESET' });
    navigation.navigate('Home');
  };

  // Show final card status for all players
  const survivors = players.filter((p) => p.cards.some((c) => !c.revealed));
  const eliminated = players.filter((p) => p.cards.every((c) => c.revealed));

  return (
    <LinearGradient
      colors={['#0d0118', '#1b0424', '#0d0118']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>

          {/* Trophy icon */}
          <Animated.View
            style={[
              styles.trophyWrap,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          >
            <LinearGradient
              colors={['#2a2200', '#3a3200', '#2a2200']}
              style={styles.trophyBg}
            >
              <MaterialCommunityIcons name="crown" size={70} color="#FFD700" />
            </LinearGradient>
            {/* Glow rings */}
            <View style={styles.glowRing1} />
            <View style={styles.glowRing2} />
          </Animated.View>

          {/* Title */}
          <Animated.View style={{ opacity: opacityAnim, alignItems: 'center' }}>
            <Text style={styles.victoryTitle}>{t('intrigue.victory.title')}</Text>
            <Text style={styles.victorySubtitle}>{t('intrigue.victory.subtitle')}</Text>
          </Animated.View>

          {/* Winner card */}
          <Animated.View style={[styles.winnerCard, { opacity: opacityAnim }]}>
            <LinearGradient
              colors={['#2a2200', '#3a3200', '#2a2200']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.winnerCardGrad}
            >
              <Text style={styles.winnerLabel}>POBJEDNIK</Text>
              <Text style={styles.winnerName}>{winnerPlayer?.name ?? '—'}</Text>
              <View style={styles.winnerCards}>
                {winnerPlayer?.cards.filter((c) => !c.revealed).map((c, idx) => (
                  <View key={idx} style={styles.winnerCardChip}>
                    <MaterialCommunityIcons name="cards-outline" size={14} color="#FFD700" />
                    <Text style={styles.winnerCardChipText}>{c.character}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Eliminated players */}
          {eliminated.length > 0 && (
            <View style={styles.eliminatedSection}>
              <Text style={styles.eliminatedTitle}>Eliminirani igrači:</Text>
              {eliminated.map((p) => (
                <View key={p.id} style={styles.eliminatedRow}>
                  <MaterialCommunityIcons name="skull-outline" size={16} color={COLORS.textMuted} />
                  <Text style={styles.eliminatedName}>{p.name}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ flex: 1 }} />

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity onPress={handleNewGame} activeOpacity={0.85}>
              <LinearGradient
                colors={['#8B0000', '#C0392B', '#8B0000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtn}
              >
                <MaterialCommunityIcons name="refresh" size={20} color="#FFD700" />
                <Text style={styles.primaryBtnText}>{t('intrigue.victory.new_game')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExit}
              style={styles.secondaryBtn}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="home-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.secondaryBtnText}>{t('intrigue.victory.exit')}</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 24,
    paddingTop: 40,
  },

  trophyWrap: {
    marginBottom: 24,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyBg: {
    width: 130,
    height: 130,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.3)',
    zIndex: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  glowRing1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
    zIndex: 1,
  },
  glowRing2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.06)',
    zIndex: 0,
  },

  victoryTitle: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 2,
    textShadowColor: 'rgba(255,215,0,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 6,
  },
  victorySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 24,
  },

  winnerCard: {
    width: '100%',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.3)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  winnerCardGrad: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  winnerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,215,0,0.6)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  winnerName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: -1,
    textAlign: 'center',
  },
  winnerCards: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  winnerCardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  winnerCardChipText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
  },

  eliminatedSection: {
    width: '100%',
    gap: 6,
    marginBottom: 12,
  },
  eliminatedTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  eliminatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a0428',
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.06)',
  },
  eliminatedName: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },

  buttons: { width: '100%', gap: 10 },
  primaryBtn: {
    height: 60,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#C0392B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryBtnText: {
    fontSize: SIZES.xl,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1.5,
  },
  secondaryBtn: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});
