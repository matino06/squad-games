import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GameAppBar from '../../components/GameAppBar';
import { useImposter } from '../../context/ImposterContext';
import { useTranslation, useLanguage } from '../../context/LanguageContext';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';

const HELP_RULES = [
  { icon: 'format-quote-open', key: 'rule1' },
  { icon: 'chat-outline',      key: 'rule2' },
  { icon: 'eye-outline',       key: 'rule3' },
  { icon: 'vote-outline',      key: 'rule4' },
];

export default function ImposterSetupScreen({ navigation }) {
  const { state, dispatch } = useImposter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [playerCount, setPlayerCount] = useState(5);
  const [hintEnabled, setHintEnabled] = useState(state.hintEnabled ?? true);
  const [helpVisible, setHelpVisible] = useState(false);

  const changePlayer = (delta) => {
    setPlayerCount((prev) => Math.max(3, Math.min(12, prev + delta)));
  };

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: 'START_GAME', payload: { playerCount, language, hintEnabled } });
    navigation.navigate('ImposterReveal');
  };

  return (
    <LinearGradient colors={['#0d0118', '#1b0424', '#0d0118']} style={styles.container}>
      <View style={styles.statusBarFill} />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>

        <GameAppBar
          title="IMPOSTER"
          subtitle={t('imposter.setup.subtitle')}
          onBack={() => navigation.goBack()}
          onHelp={() => setHelpVisible(true)}
        />

        {/* ── Scrollable content ── */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Player count stepper */}
          <View style={styles.stepperCard}>
            <View style={styles.stepperBlob} pointerEvents="none" />
            <Text style={styles.stepperTitle}>{t('imposter.setup.players_label')}</Text>
            <Text style={styles.stepperHint}>{t('imposter.setup.players_hint') ?? 'Preporučeno: 3–12 igrača'}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[styles.stepBtn, playerCount <= 3 && styles.stepBtnDisabled]}
                onPress={() => changePlayer(-1)}
                disabled={playerCount <= 3}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="minus" size={28} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{playerCount}</Text>
              <TouchableOpacity
                style={[styles.stepBtn, playerCount >= 12 && styles.stepBtnDisabled]}
                onPress={() => changePlayer(1)}
                disabled={playerCount >= 12}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="plus" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hint toggle */}
          <View style={styles.hintCard}>
            <View style={styles.hintCardLeft}>
              <MaterialCommunityIcons name="tag-outline" size={20} color={COLORS.primary} />
              <View style={styles.hintCardText}>
                <Text style={styles.hintCardTitle}>{t('imposter.setup.hint_label')}</Text>
                <Text style={styles.hintCardDesc}>
                  {hintEnabled ? t('imposter.setup.hint_on_desc') : t('imposter.setup.hint_off_desc')}
                </Text>
              </View>
            </View>
            <View style={styles.hintToggleRow}>
              {[true, false].map((val) => {
                const sel = hintEnabled === val;
                return (
                  <TouchableOpacity
                    key={String(val)}
                    onPress={() => { Haptics.selectionAsync(); setHintEnabled(val); }}
                    style={[styles.hintPill, sel && styles.hintPillSelected]}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.hintPillText, sel && styles.hintPillTextSelected]}>
                      {val ? t('imposter.setup.hint_on') : t('imposter.setup.hint_off')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* KRENI button */}
          <TouchableOpacity onPress={handleStart} activeOpacity={0.85}>
            <LinearGradient
              colors={['#a533ff', '#cf96ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startBtn}
            >
              <Text style={styles.startBtnText}>{t('imposter.setup.start')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>

      </SafeAreaView>

      {/* ── Help Modal ── */}
      <Modal visible={helpVisible} transparent animationType="slide" onRequestClose={() => setHelpVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setHelpVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <MaterialCommunityIcons name="help-circle-outline" size={22} color={COLORS.primary} />
              <Text style={styles.modalTitle}>{t('imposter.setup.how_to_play')}</Text>
            </View>
            {HELP_RULES.map(({ icon, key }) => (
              <View key={key} style={styles.modalRule}>
                <View style={styles.modalRuleIcon}>
                  <MaterialCommunityIcons name={icon} size={18} color="rgba(188,111,255,0.8)" />
                </View>
                <Text style={styles.modalRuleText}>{t(`imposter.setup.${key}`)}</Text>
              </View>
            ))}
            <TouchableOpacity onPress={() => setHelpVisible(false)} activeOpacity={0.85} style={styles.modalCloseBtnWrap}>
              <LinearGradient
                colors={['#a533ff', '#cf96ff']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseBtnText}>{t('setup.help.close')}</Text>
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
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },

  // ── Rules card ──
  rulesCard: {
    backgroundColor: '#22062c',
    borderRadius: 14,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  rulesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  rulesCardTitle: {
    fontSize: SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  rulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  ruleItem: {
    width: '46%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 17,
    fontWeight: '500',
  },

  // ── Stepper card ──
  stepperCard: {
    backgroundColor: '#2a0b35',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(90,61,98,0.15)',
    overflow: 'hidden',
    shadowColor: '#cf96ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  stepperBlob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(207,150,255,0.05)',
  },
  stepperTitle: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepperHint: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  stepBtn: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: '#421b4f',
    borderWidth: 1,
    borderColor: 'rgba(90,61,98,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: { opacity: 0.25 },
  stepValue: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -2,
    minWidth: 80,
    textAlign: 'center',
  },

  // ── Hint toggle card ──
  hintCard: {
    backgroundColor: '#2a0b35',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(90,61,98,0.15)',
    gap: 14,
  },
  hintCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  hintCardText: { flex: 1, gap: 2 },
  hintCardTitle: {
    fontSize: SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  hintCardDesc: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  hintToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  hintPill: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e0428',
    borderWidth: 1,
    borderColor: 'rgba(90,61,98,0.3)',
  },
  hintPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  hintPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  hintPillTextSelected: {
    color: '#fff',
  },

  // ── Start button ──
  startBtn: {
    height: 72,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a533ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  startBtnText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2a0052',
    letterSpacing: 3,
  },

  // ── Help Modal ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(13,1,24,0.85)', justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#22062c',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36,
    borderTopWidth: 1, borderColor: 'rgba(207,150,255,0.12)',
    gap: 12,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(207,150,255,0.25)', alignSelf: 'center', marginBottom: 4,
  },
  modalTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '800', color: '#fbdbff',
  },
  modalRule: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  modalRuleIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(188,111,255,0.12)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  modalRuleText: {
    flex: 1, fontSize: 13, color: 'rgba(195,159,202,0.9)', lineHeight: 19, fontWeight: '500',
  },
  modalCloseBtnWrap: {
    borderRadius: RADIUS.full, overflow: 'hidden', marginTop: 8,
  },
  modalCloseBtn: {
    height: 56, alignItems: 'center', justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 16, fontWeight: '900', color: '#2a0052', letterSpacing: 1,
  },
});
