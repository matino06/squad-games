import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Modal, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGame } from '../../context/GameContext';
import { useTranslation } from '../../context/LanguageContext';
import { ROLES } from '../../constants/roles';
import { COLORS, SIZES, RADIUS, SHADOWS } from '../../constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BTN_W = 120;
const BTN_H = 48;

function randomBtnPos() {
  const x = 24 + Math.random() * (SCREEN_W - BTN_W - 48);
  const y = 60 + Math.random() * (SCREEN_H * 0.38);
  return { left: x, top: y };
}

function getAlivePlayers(players) {
  return players.filter((p) => p.isAlive);
}

function getMafiaLeader(players) {
  const alive = players.filter((p) => p.isAlive && (p.role === 'don' || p.role === 'mafia'));
  if (alive.length > 0) return alive.find((p) => p.role === 'don') ?? alive[0];
  // No mafia/don alive — lady takes over as leader
  return players.find((p) => p.isAlive && p.role === 'lady') ?? null;
}

function getActionType(player, players) {
  const leader = getMafiaLeader(players);
  if (player.role === 'don' || player.role === 'mafia') {
    return leader?.id === player.id ? 'kill' : 'mafia-member';
  }
  if (player.role === 'lady') {
    const mafiaAlive = players.some((p) => p.isAlive && (p.role === 'mafia' || p.role === 'don'));
    // If no mafia/don alive, lady becomes the killer
    return mafiaAlive ? 'silence' : 'kill';
  }
  if (player.role === 'doctor') return 'save';
  if (player.role === 'police') return 'investigate';
  return 'civilian';
}

export default function NightPhaseScreen({ navigation }) {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const { players, doctorLastSaved, ladyLastSilenced } = state;

  const alivePlayers = useMemo(() => getAlivePlayers(players), [players]);

  const [playerIndex, setPlayerIndex] = useState(0);
  const [subPhase, setSubPhase] = useState('handoff');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [policeModal, setPoliceModal] = useState(false);
  const [policeResultData, setPoliceResultData] = useState(null);
  const [btnPos, setBtnPos] = useState(() => randomBtnPos());
  const [countdown, setCountdown] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const countdownScale = useRef(new Animated.Value(1)).current;

  const currentPlayer = alivePlayers[playerIndex];
  const actionType = currentPlayer ? getActionType(currentPlayer, players) : null;

  // Teammates visible to the current player (mafia see mafia+don, lady sees other ladies)
  const getVisibleTeammates = () => {
    if (!currentPlayer) return [];
    const r = currentPlayer.role;
    if (r === 'mafia' || r === 'don' || r === 'lady') {
      return players.filter(p => p.isAlive && (p.role === 'mafia' || p.role === 'don' || p.role === 'lady'));
    }
    return [];
  };
  const visibleTeammates = getVisibleTeammates();

  useEffect(() => {
    if (subPhase === 'action' && actionType === 'civilian') {
      setCountdown(3);
    } else {
      setCountdown(0);
    }
  }, [subPhase, actionType]);

  useEffect(() => {
    if (countdown <= 0) return;
    countdownScale.setValue(1.4);
    Animated.spring(countdownScale, {
      toValue: 1, friction: 4, tension: 80, useNativeDriver: true,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const fadeTransition = (callback) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const advancePlayer = () => {
    const next = playerIndex + 1;
    if (next >= alivePlayers.length) {
      dispatch({ type: 'RESOLVE_NIGHT' });
      navigation.replace('DayPhase');
    } else {
      fadeTransition(() => {
        setPlayerIndex(next);
        setSubPhase('handoff');
        setSelectedTarget(null);
        setBtnPos(randomBtnPos());
      });
    }
  };

  const handleHandoffReady = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fadeTransition(() => {
      setSubPhase('action');
      setSelectedTarget(null);
      setBtnPos(randomBtnPos());
    });
  };

  const handlePassNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    advancePlayer();
  };

  const handleConfirmAction = () => {
    if (selectedTarget === null) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (actionType === 'kill') {
      dispatch({ type: 'SET_NIGHT_ACTION', payload: { group: 'mafia', targetId: selectedTarget } });
      advancePlayer();
    } else if (actionType === 'save') {
      dispatch({ type: 'SET_NIGHT_ACTION', payload: { group: 'doctor', targetId: selectedTarget } });
      advancePlayer();
    } else if (actionType === 'silence') {
      dispatch({ type: 'SET_NIGHT_ACTION', payload: { group: 'lady', targetId: selectedTarget } });
      advancePlayer();
    } else if (actionType === 'investigate') {
      dispatch({ type: 'SET_NIGHT_ACTION', payload: { group: 'police', targetId: selectedTarget } });
      const target = players.find((p) => p.id === selectedTarget);
      if (target) {
        const role = ROLES[target.role];
        const isMafia = role?.team === 'mafia' && target.role !== 'don';
        setPoliceResultData({ name: target.name, isMafia });
        setPoliceModal(true);
      }
    }
  };

  const handlePoliceClose = () => {
    setPoliceModal(false);
    setPoliceResultData(null);
    advancePlayer();
  };

  const allAlive = getAlivePlayers(players);
  const killTargets = allAlive;
  const saveTargets = doctorLastSaved !== null
    ? allAlive.filter((p) => p.id !== doctorLastSaved)
    : allAlive;
  const investigateTargets = allAlive.filter((p) => p.id !== currentPlayer?.id);
  const silenceTargets = ladyLastSilenced !== null
    ? allAlive.filter((p) => p.id !== ladyLastSilenced)
    : allAlive;

  const targetList = () => {
    switch (actionType) {
      case 'kill': return killTargets;
      case 'save': return saveTargets;
      case 'investigate': return investigateTargets;
      case 'silence': return silenceTargets;
      default: return [];
    }
  };

  const actionPrompt = () => {
    switch (actionType) {
      case 'kill': return t('night.kill.prompt');
      case 'save': return t('night.save.prompt');
      case 'investigate': return t('night.investigate.prompt');
      case 'silence': return t('night.silence.prompt');
      default: return '';
    }
  };

  const confirmLabel = () => {
    switch (actionType) {
      case 'kill': return t('night.kill.btn');
      case 'save': return t('night.save.btn');
      case 'investigate': return t('night.investigate.btn');
      case 'silence': return t('night.silence.btn');
      default: return t('night.confirm.default');
    }
  };

  if (!currentPlayer) return null;

  const role = ROLES[currentPlayer.role];
  const roleColor = role?.color ?? COLORS.textSecondary;
  const roleIcon = role?.icon ?? 'account-outline';
  const playerDisplayName = currentPlayer.name || t('night.player_label', { n: currentPlayer.id + 1 });

  const isActionRole = ['kill', 'save', 'investigate', 'silence'].includes(actionType);

  return (
    <LinearGradient colors={['#000000', '#050505', '#0a0a0a']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>

          {/* Night header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="moon-waning-crescent" size={24} color={COLORS.textMuted} />
            <Text style={styles.roundText}>{t('night.round', { n: state.round })}</Text>
          </View>

          {/* Progress dots */}
          <View style={styles.progressRow}>
            {alivePlayers.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i < playerIndex && styles.dotDone,
                  i === playerIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* ── HANDOFF ── */}
          {subPhase === 'handoff' && (
            <View style={styles.handoffSection}>
              <View style={styles.handoffCard}>
                <MaterialCommunityIcons
                  name="cellphone" size={44} color={COLORS.textSecondary}
                  style={{ marginBottom: 20 }}
                />
                <Text style={styles.handoffSub}>{t('night.handoff.subtitle')}</Text>
                <Text style={styles.handoffName}>{playerDisplayName}</Text>
                <Text style={styles.handoffHint}>{t('night.handoff.hint')}</Text>
              </View>
              <TouchableOpacity style={styles.readyBtn} onPress={handleHandoffReady} activeOpacity={0.8}>
                <Text style={styles.readyBtnText}>{t('night.ready')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── ACTION ── */}
          {subPhase === 'action' && (
            <View style={styles.actionOuter}>

              {/* Civilian — countdown then random button */}
              {actionType === 'civilian' && (
                <View style={StyleSheet.absoluteFillObject}>
                  {countdown > 0 ? (
                    <View style={styles.countdownContainer}>
                      <Animated.Text
                        style={[styles.countdownNumber, { transform: [{ scale: countdownScale }] }]}
                      >
                        {countdown}
                      </Animated.Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.randomBtn, { left: btnPos.left, top: btnPos.top }]}
                      onPress={handlePassNext}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.randomBtnText}>{t('night.civilian.btn')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Mafia member (non-leader) */}
              {actionType === 'mafia-member' && (
                <View style={StyleSheet.absoluteFillObject}>
                  <View style={styles.mafiaInfoBox}>
                    <MaterialCommunityIcons name="skull-outline" size={22} color={COLORS.danger} />
                    <Text style={styles.mafiaInfoTitle}>{t('night.mafia_member.title')}</Text>
                    <Text style={styles.mafiaInfoText}>{t('night.mafia_member.text')}</Text>
                    {visibleTeammates.length > 0 && (
                      <View style={styles.teamBox}>
                        <Text style={styles.teamLabel}>{t('night.team_label')}</Text>
                        <View style={styles.teamChips}>
                          {visibleTeammates.map(p => (
                            <View key={p.id} style={[styles.teamChip, p.id === currentPlayer.id && styles.teamChipSelf]}>
                              <MaterialCommunityIcons name={ROLES[p.role].icon} size={11} color={p.id === currentPlayer.id ? '#480079' : ROLES[p.role].color} />
                              <Text style={[styles.teamChipText, p.id === currentPlayer.id && styles.teamChipTextSelf]}>
                                {p.name}{p.id === currentPlayer.id ? ' ★' : ''}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.randomBtn, { left: btnPos.left, top: btnPos.top }]}
                    onPress={handlePassNext}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.randomBtnText}>{t('night.civilian.btn')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Role action screen */}
              {isActionRole && (
                <View style={styles.actionSection}>
                  <View style={[styles.roleBadge, { borderColor: roleColor + '50' }]}>
                    <MaterialCommunityIcons name={roleIcon} size={26} color={roleColor} />
                    <Text style={[styles.roleBadgeName, { color: roleColor }]}>
                      {t(`roles.${currentPlayer.role}.name`)}
                    </Text>
                  </View>

                  {/* Team partners (mafia sees team, lady sees other ladies) */}
                  {visibleTeammates.length > 0 && (
                    <View style={styles.teamBox}>
                      <Text style={styles.teamLabel}>{t('night.team_label')}</Text>
                      <View style={styles.teamChips}>
                        {visibleTeammates.map(p => (
                          <View key={p.id} style={[styles.teamChip, p.id === currentPlayer.id && styles.teamChipSelf]}>
                            <MaterialCommunityIcons name={ROLES[p.role].icon} size={11} color={p.id === currentPlayer.id ? '#480079' : ROLES[p.role].color} />
                            <Text style={[styles.teamChipText, p.id === currentPlayer.id && styles.teamChipTextSelf]}>
                              {p.name}{p.id === currentPlayer.id ? ' ★' : ''}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <Text style={styles.actionPrompt}>{actionPrompt()}</Text>

                  {actionType === 'save' && doctorLastSaved !== null && (
                    <View style={styles.warnBox}>
                      <MaterialCommunityIcons name="information-outline" size={14} color={COLORS.warning} />
                      <Text style={styles.warnText}>{t('night.doctor.warning')}</Text>
                    </View>
                  )}

                  {/* Target list — 2 columns */}
                  <ScrollView
                    style={styles.playerList}
                    contentContainerStyle={styles.playerListContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {targetList().map((p) => {
                      const isSelected = selectedTarget === p.id;
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[
                            styles.playerBtn,
                            isSelected && { borderColor: roleColor, borderWidth: 1.5 },
                          ]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedTarget(p.id);
                          }}
                          activeOpacity={0.7}
                        >
                          {isSelected && (
                            <MaterialCommunityIcons
                              name="check-circle" size={16} color={roleColor}
                              style={styles.playerBtnCheck}
                            />
                          )}
                          <Text
                            style={styles.playerBtnName}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                          >
                            {p.name || t('night.player_label', { n: p.id + 1 })}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <TouchableOpacity
                    style={[
                      styles.confirmBtn,
                      { backgroundColor: roleColor },
                      selectedTarget === null && styles.confirmBtnDisabled,
                    ]}
                    onPress={handleConfirmAction}
                    disabled={selectedTarget === null}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmBtnText}>{confirmLabel()}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </Animated.View>

        {/* Police result modal */}
        <Modal visible={policeModal} transparent animationType="fade" onRequestClose={handlePoliceClose}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <MaterialCommunityIcons
                name="shield-check-outline" size={36} color={COLORS.text}
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.modalTitle}>{t('night.police.title')}</Text>
              <Text style={styles.modalPrivate}>{t('night.police.private')}</Text>
              {policeResultData && (
                <>
                  <Text style={styles.modalName}>{policeResultData.name}</Text>
                  <Text style={[
                    styles.modalVerdict,
                    { color: policeResultData.isMafia ? COLORS.danger : COLORS.success },
                  ]}>
                    {policeResultData.isMafia
                      ? t('night.police.verdict.mafia')
                      : t('night.police.verdict.innocent')}
                  </Text>
                  <Text style={styles.modalMessage}>
                    {policeResultData.isMafia
                      ? t('night.police.is_mafia', { name: policeResultData.name })
                      : t('night.police.is_innocent', { name: policeResultData.name })}
                  </Text>
                </>
              )}
              <TouchableOpacity style={styles.modalBtn} onPress={handlePoliceClose} activeOpacity={0.8}>
                <Text style={styles.modalBtnText}>{t('night.police.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  inner: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingTop: 8, marginBottom: 14,
  },
  roundText: {
    fontSize: SIZES.sm, color: COLORS.textMuted, fontWeight: '600',
    letterSpacing: 1, textTransform: 'uppercase',
  },

  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginBottom: 28 },
  progressDot: { height: 4, width: 16, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCardLight },
  dotDone: { backgroundColor: COLORS.success },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },

  handoffSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  handoffCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 32,
    alignItems: 'center', width: '100%', marginBottom: 24,
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.08)',
  },
  handoffSub: {
    fontSize: SIZES.sm, color: COLORS.textMuted, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  handoffName: { fontSize: 34, fontWeight: '800', color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  handoffHint: { fontSize: SIZES.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
  readyBtn: {
    backgroundColor: COLORS.bgCard, paddingVertical: 16, paddingHorizontal: 48,
    borderRadius: RADIUS.full, borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)', alignSelf: 'stretch', alignItems: 'center',
  },
  readyBtnText: { color: COLORS.text, fontSize: SIZES.lg, fontWeight: '600' },

  actionOuter: { flex: 1 },

  countdownContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  countdownNumber: { fontSize: 96, fontWeight: '900', color: 'rgba(255,255,255,0.08)' },

  randomBtn: {
    position: 'absolute', width: BTN_W, height: BTN_H,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)', ...SHADOWS.sm,
  },
  randomBtnText: { color: COLORS.textSecondary, fontSize: SIZES.md, fontWeight: '600' },

  mafiaInfoBox: {
    backgroundColor: 'rgba(230,57,70,0.08)', borderRadius: RADIUS.xl, padding: 20,
    alignItems: 'center', gap: 8, marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(230,57,70,0.2)',
  },
  mafiaInfoTitle: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.danger },
  mafiaInfoText: { fontSize: SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },

  actionSection: { flex: 1 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    paddingVertical: 14, paddingHorizontal: 18, marginBottom: 18, borderWidth: 1,
  },
  roleBadgeName: { fontSize: SIZES.xl, fontWeight: '800' },
  actionPrompt: {
    fontSize: SIZES.sm, color: COLORS.textMuted, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
  },
  warnBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,214,10,0.08)', borderRadius: RADIUS.md,
    padding: 10, marginBottom: 12,
  },
  warnText: { fontSize: SIZES.sm, color: COLORS.warning, flex: 1, lineHeight: 18 },

  teamBox: { marginTop: 16, marginBottom: 8, width: '100%' },
  teamLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6,
  },
  teamChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  teamChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(207,150,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(207,150,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full,
  },
  teamChipSelf: {
    backgroundColor: '#cf96ff',
    borderColor: '#cf96ff',
  },
  teamChipText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  teamChipTextSelf: { color: '#480079', fontWeight: '800' },

  playerList: { flex: 1, marginBottom: 12 },
  playerListContent: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 4 },
  playerBtn: {
    backgroundColor: COLORS.bgCard, paddingVertical: 18, paddingHorizontal: 10,
    borderRadius: RADIUS.lg, width: '48.5%', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'transparent', minHeight: 58, position: 'relative',
  },
  playerBtnCheck: { position: 'absolute', top: 7, right: 8 },
  playerBtnName: { fontSize: SIZES.lg, color: COLORS.text, fontWeight: '600', textAlign: 'center' },
  confirmBtn: { paddingVertical: 18, borderRadius: RADIUS.full, alignItems: 'center', marginBottom: 12, ...SHADOWS.md },
  confirmBtnDisabled: { opacity: 0.3 },
  confirmBtnText: { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, alignItems: 'center', justifyContent: 'center', padding: 28 },
  modalBox: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 28, width: '100%',
    alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: { fontSize: SIZES.xl, color: COLORS.text, fontWeight: '800', marginBottom: 6 },
  modalPrivate: { fontSize: SIZES.sm, color: COLORS.warning, marginBottom: 24, textAlign: 'center', fontStyle: 'italic' },
  modalName: { fontSize: SIZES.xxl, color: COLORS.text, fontWeight: '700', marginBottom: 10 },
  modalVerdict: { fontSize: SIZES.xxxl, fontWeight: '900', marginBottom: 10, letterSpacing: 1 },
  modalMessage: { fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  modalBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: RADIUS.full, alignItems: 'center', width: '100%' },
  modalBtnText: { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
});
