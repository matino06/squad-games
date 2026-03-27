import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Modal, TextInput, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GameAppBar from '../../components/GameAppBar';
import { useAlias } from '../../context/AliasContext';
import { useTranslation } from '../../context/LanguageContext';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';

const DURATIONS = [60, 90, 120];
const WIN_SCORES = [25, 50, 75, 100];

const HELP_RULES = [
  { icon: 'account-group-outline', key: 'rule1' },
  { icon: 'star-outline',          key: 'rule2' },
  { icon: 'timer-outline',         key: 'rule3' },
  { icon: 'swap-horizontal',       key: 'rule4' },
];

export default function AliasSetupScreen({ navigation }) {
  const { state, dispatch } = useAlias();
  const { t } = useTranslation();

  // Svaki put kad se vrati na setup — resetiraj bodove ali zadrži imena i trajanje
  useFocusEffect(
    React.useCallback(() => {
      dispatch({ type: 'RESET_KEEP_SETTINGS' });
    }, [dispatch])
  );

  const [helpVisible, setHelpVisible]     = useState(false);
  const [editTeam, setEditTeam]           = useState(null); // 'A' | 'B' | null
  const [editName, setEditName]           = useState('');

  const handleEditOpen = (team) => {
    setEditTeam(team);
    setEditName(team === 'A' ? state.teamA.name : state.teamB.name);
  };

  const handleEditSave = () => {
    if (editTeam && editName.trim()) {
      dispatch({ type: 'SET_TEAM_NAME', payload: { team: editTeam, name: editName.trim() } });
    }
    setEditTeam(null);
  };

  const handleDuration = (dur) => {
    Haptics.selectionAsync();
    dispatch({ type: 'SET_ROUND_DURATION', payload: dur });
  };

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('AliasReady');
  };

  return (
    <LinearGradient colors={['#0d0118', '#1b0424', '#0d0118']} style={styles.container}>
      <View style={styles.statusBarFill} />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>

        <GameAppBar
          title="ALIAS"
          subtitle={t('alias.setup.subtitle')}
          onBack={() => navigation.goBack()}
          onHelp={() => setHelpVisible(true)}
        />

        {/* ── Scrollable content ── */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Teams ── */}
          <Text style={styles.sectionLabel}>{t('alias.setup.teams')}</Text>
          <View style={styles.teamsRow}>
            {/* Team A */}
            <TouchableOpacity
              style={[styles.teamCard, { borderColor: 'rgba(207,150,255,0.3)' }]}
              onPress={() => handleEditOpen('A')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2d0050', '#1d003a']}
                style={styles.teamCardInner}
              >
                <View style={[styles.teamColorDot, { backgroundColor: '#cf96ff' }]} />
                <Text style={styles.teamLabel}>{t('alias.setup.team_a')}</Text>
                <Text style={[styles.teamName, { color: '#cf96ff' }]} numberOfLines={1}>
                  {state.teamA.name}
                </Text>
                <View style={styles.teamEditRow}>
                  <MaterialCommunityIcons name="pencil-outline" size={14} color="rgba(207,150,255,0.6)" />
                  <Text style={styles.teamEditText}>{t('alias.setup.edit_name')}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* VS divider */}
            <View style={styles.vsDivider}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {/* Team B */}
            <TouchableOpacity
              style={[styles.teamCard, { borderColor: 'rgba(253,144,0,0.3)' }]}
              onPress={() => handleEditOpen('B')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2a1500', '#1a0d00']}
                style={styles.teamCardInner}
              >
                <View style={[styles.teamColorDot, { backgroundColor: '#fd9000' }]} />
                <Text style={styles.teamLabel}>{t('alias.setup.team_b')}</Text>
                <Text style={[styles.teamName, { color: '#fd9000' }]} numberOfLines={1}>
                  {state.teamB.name}
                </Text>
                <View style={styles.teamEditRow}>
                  <MaterialCommunityIcons name="pencil-outline" size={14} color="rgba(253,144,0,0.6)" />
                  <Text style={[styles.teamEditText, { color: 'rgba(253,144,0,0.6)' }]}>
                    {t('alias.setup.edit_name')}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ── Round duration ── */}
          <Text style={styles.sectionLabel}>{t('alias.setup.duration')}</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((dur) => {
              const isSelected = state.roundDuration === dur;
              return (
                <TouchableOpacity
                  key={dur}
                  onPress={() => handleDuration(dur)}
                  activeOpacity={0.7}
                  style={[styles.durationPill, isSelected && styles.durationPillSelected]}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={['#a533ff', '#cf96ff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.durationPillGradient}
                    >
                      <Text style={[styles.durationText, styles.durationTextSelected]}>
                        {dur}S
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.durationPillGradient}>
                      <Text style={styles.durationText}>{dur}S</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Win score ── */}
          <Text style={styles.sectionLabel}>{t('alias.setup.win_score')}</Text>
          <View style={styles.durationRow}>
            {WIN_SCORES.map((s) => {
              const isSelected = state.winScore === s;
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    Haptics.selectionAsync();
                    dispatch({ type: 'SET_WIN_SCORE', payload: s });
                  }}
                  activeOpacity={0.7}
                  style={[styles.durationPill, isSelected && styles.durationPillSelected]}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={['#a533ff', '#cf96ff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.durationPillGradient}
                    >
                      <Text style={[styles.durationText, styles.durationTextSelected]}>
                        {s}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.durationPillGradient}>
                      <Text style={styles.durationText}>{s}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Min players note */}
          <View style={styles.minPlayersRow}>
            <MaterialCommunityIcons name="account-group-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.minPlayersText}>{t('alias.setup.min_players')}</Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── Fixed bottom start button ── */}
        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={handleStart} activeOpacity={0.85} style={styles.startBtnWrap}>
            <LinearGradient
              colors={['#a533ff', '#cf96ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startBtn}
            >
              <MaterialCommunityIcons name="play" size={22} color="#2a0052" style={{ marginRight: 8 }} />
              <Text style={styles.startBtnText}>{t('alias.setup.start')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </SafeAreaView>

      {/* ── Edit Team Name Modal ── */}
      <Modal
        visible={editTeam !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditTeam(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditTeam(null)}>
          <Pressable style={styles.editModalBox} onPress={() => {}}>
            <Text style={styles.editModalTitle}>
              {editTeam === 'A' ? t('alias.setup.team_a') : t('alias.setup.team_b')}
            </Text>
            <TextInput
              style={[
                styles.editInput,
                editTeam === 'B' && styles.editInputB,
              ]}
              value={editName}
              onChangeText={setEditName}
              maxLength={20}
              autoFocus
              selectionColor={editTeam === 'A' ? '#cf96ff' : '#fd9000'}
              placeholderTextColor={COLORS.textMuted}
            />
            <TouchableOpacity onPress={handleEditSave} activeOpacity={0.85}>
              <LinearGradient
                colors={editTeam === 'A' ? ['#a533ff', '#cf96ff'] : ['#c05500', '#fd9000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editSaveBtn}
              >
                <Text style={styles.editSaveBtnText}>{t('alias.setup.edit_name')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Help Modal ── */}
      <Modal
        visible={helpVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHelpVisible(false)}
      >
        <TouchableOpacity
          style={styles.helpOverlay}
          activeOpacity={1}
          onPress={() => setHelpVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.helpBox}>
            <View style={styles.modalHandle} />
            <View style={styles.helpTitleRow}>
              <MaterialCommunityIcons name="help-circle-outline" size={22} color={COLORS.primary} />
              <Text style={styles.helpTitle}>{t('alias.setup.help.title')}</Text>
            </View>
            {HELP_RULES.map(({ icon, key }) => (
              <View key={key} style={styles.helpRule}>
                <View style={styles.helpRuleIcon}>
                  <MaterialCommunityIcons name={icon} size={18} color="rgba(188,111,255,0.8)" />
                </View>
                <Text style={styles.helpRuleText}>{t(`alias.setup.help.${key}`)}</Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => setHelpVisible(false)}
              activeOpacity={0.85}
              style={styles.helpCloseBtnWrap}
            >
              <LinearGradient
                colors={['#a533ff', '#cf96ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.helpCloseBtn}
              >
                <Text style={styles.helpCloseBtnText}>{t('alias.setup.help.close')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  statusBarFill: { position: 'absolute', top: 0, left: 0, right: 0, height: 60, backgroundColor: '#22062c' },

  // ── Scroll ──
  scroll: { paddingHorizontal: 20, paddingTop: 24, gap: 12 },

  // ── Section label ──
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 4,
  },

  // ── Teams ──
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  teamCardInner: {
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  teamColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 2,
  },
  teamLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  teamName: {
    fontSize: SIZES.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  teamEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  teamEditText: {
    fontSize: 10,
    color: 'rgba(207,150,255,0.6)',
    fontWeight: '600',
  },
  vsDivider: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a0b35',
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },

  // ── Duration ──
  durationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationPill: {
    flex: 1,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    backgroundColor: '#2a0b35',
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.12)',
  },
  durationPillSelected: {
    borderColor: 'transparent',
  },
  durationPillGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    fontSize: SIZES.md,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  durationTextSelected: {
    color: '#2a0052',
  },

  // ── Min players ──
  minPlayersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  minPlayersText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
  },

  // ── Bottom bar ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    backgroundColor: 'rgba(13,1,24,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(207,150,255,0.08)',
  },
  startBtnWrap: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  startBtn: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
  },
  startBtnText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2a0052',
    letterSpacing: 3,
  },

  // ── Edit Name Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13,1,24,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  editModalBox: {
    backgroundColor: '#2a0b35',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.15)',
    gap: 16,
  },
  editModalTitle: {
    fontSize: SIZES.xl,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
    textAlign: 'center',
  },
  editInput: {
    backgroundColor: '#1d003a',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(207,150,255,0.3)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  editInputB: {
    borderColor: 'rgba(253,144,0,0.4)',
  },
  editSaveBtn: {
    height: 56,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editSaveBtnText: {
    fontSize: SIZES.lg,
    fontWeight: '900',
    color: '#2a0052',
    letterSpacing: 1,
  },

  // ── Help Modal ──
  helpOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13,1,24,0.85)',
    justifyContent: 'flex-end',
  },
  helpBox: {
    backgroundColor: '#22062c',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: 'rgba(207,150,255,0.12)',
    gap: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(207,150,255,0.25)',
    alignSelf: 'center',
    marginBottom: 4,
  },
  helpTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fbdbff',
  },
  helpRule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpRuleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(188,111,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  helpRuleText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(195,159,202,0.9)',
    lineHeight: 19,
    fontWeight: '500',
  },
  helpCloseBtnWrap: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginTop: 8,
  },
  helpCloseBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCloseBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2a0052',
    letterSpacing: 1,
  },
});
