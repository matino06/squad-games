import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlias } from '../../context/AliasContext';
import { useLanguage, useTranslation } from '../../context/LanguageContext';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';

export default function AliasReadyScreen({ navigation }) {
  const { state, dispatch } = useAlias();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { currentTeam, teamA, teamB, roundNumber } = state;
  const team      = currentTeam === 'A' ? teamA : teamB;
  const teamColor = currentTeam === 'A' ? '#cf96ff' : '#fd9000';

  // Pulse animation on the team name
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    dispatch({ type: 'START_ROUND', payload: { language } });
    navigation.replace('AliasGame');
  };

  return (
    <LinearGradient colors={['#0d0118', '#1b0424', '#0d0118']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>

        {/* Round badge */}
        <View style={styles.roundBadge}>
          <Text style={styles.roundBadgeText}>
            {t('alias.ready.round')} {roundNumber}
          </Text>
        </View>

        {/* Main content */}
        <View style={styles.centerSection}>
          <Text style={styles.onDeckLabel}>{t('alias.ready.on_deck')}</Text>

          <Animated.Text
            style={[styles.teamName, { color: teamColor, transform: [{ scale: pulse }] }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {team.name}
          </Animated.Text>

          <Text style={styles.readyLabel}>{t('alias.ready.is_ready')}</Text>

          {/* Glowing orb behind the team color */}
          <View style={[styles.glow, { backgroundColor: teamColor }]} />
        </View>

        {/* Start button */}
        <View style={styles.btnWrapper}>
          <TouchableOpacity onPress={handleStart} activeOpacity={0.85}>
            <LinearGradient
              colors={currentTeam === 'A' ? ['#a533ff', '#cf96ff'] : ['#e07000', '#fd9000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startBtn}
            >
              <MaterialCommunityIcons name="play" size={26} color={currentTeam === 'A' ? '#2a0052' : '#3a1800'} />
              <Text style={[styles.startBtnText, { color: currentTeam === 'A' ? '#2a0052' : '#3a1800' }]}>
                {t('alias.ready.start')}
              </Text>
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
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 32,
    paddingBottom: 48,
  },

  // Round badge
  roundBadge: {
    backgroundColor: 'rgba(207,150,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  roundBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // Center
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  onDeckLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  teamName: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -1.5,
    textAlign: 'center',
    maxWidth: '100%',
  },
  readyLabel: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.07,
    zIndex: -1,
  },

  // Button
  btnWrapper: {
    width: '100%',
  },
  startBtn: {
    height: 68,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  startBtnText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
