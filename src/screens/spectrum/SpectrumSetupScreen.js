import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, TextInput, Pressable, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GameAppBar from '../../components/GameAppBar';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';
import { useLanguage, useTranslation } from '../../context/LanguageContext';
import { useSpectrum } from '../../context/SpectrumContext';

const MAX_PLAYERS = 10;
const MIN_PLAYERS = 2;

// All possible default player name prefixes across supported languages
const DEFAULT_PREFIXES = ['Igrač', 'Player', 'Jugador', 'Jogador', 'Joueur', 'Spieler', 'Giocatore', 'Gracz'];

export default function SpectrumSetupScreen({ navigation }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { state, dispatch } = useSpectrum();
  const [helpVisible, setHelpVisible] = useState(false);
  const [winScore, setWinScore] = useState(state.winScore ?? 15);

  const WIN_SCORES = [10, 15, 20, 25, 30];

  const players = state.players;

  const addPlayer = () => {
    if (players.length >= MAX_PLAYERS) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch({ type: 'ADD_PLAYER', payload: `${t('spectrum.setup.player_default')} ${players.length + 1}` });
  };

  const removePlayer = (index) => {
    if (players.length <= MIN_PLAYERS) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch({ type: 'REMOVE_PLAYER', payload: index });
  };

  const updateName = (index, name) => {
    dispatch({ type: 'UPDATE_PLAYER_NAME', payload: { index, name } });
  };

  const canStart = players.length >= MIN_PLAYERS && players.every(p => p.name.trim().length > 0);

  const handleStart = () => {
    if (!canStart) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: 'START_GAME', payload: { language, winScore } });
    navigation.navigate('SpectrumTransition');
  };

  // Ensure at least 2 players are pre-populated on first load
  useEffect(() => {
    if (players.length === 0) {
      dispatch({ type: 'ADD_PLAYER', payload: `${t('spectrum.setup.player_default')} 1` });
      dispatch({ type: 'ADD_PLAYER', payload: `${t('spectrum.setup.player_default')} 2` });
    }
  }, []);

  // On mount and on language change: update any player still using a default name
  useEffect(() => {
    if (players.length === 0) return;
    players.forEach((player, index) => {
      const isDefault = DEFAULT_PREFIXES.some(
        prefix => player.name === `${prefix} ${index + 1}`
      );
      if (isDefault) {
        dispatch({
          type: 'UPDATE_PLAYER_NAME',
          payload: { index, name: `${t('spectrum.setup.player_default')} ${index + 1}` },
        });
      }
    });
  }, [language]);

  return (
    <LinearGradient colors={['#0d0118', '#1b0424', '#0d0118']} style={styles.container}>
      <View style={styles.statusBarFill} />
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <GameAppBar
          title="SPECTRUM"
          subtitle={t('spectrum.setup.subtitle')}
          onBack={() => navigation.goBack()}
          onHelp={() => setHelpVisible(true)}
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('spectrum.setup.players')}</Text>
              <Text style={styles.sectionCount}>{players.length}/{MAX_PLAYERS}</Text>
            </View>

            {/* Player list */}
            {players.map((player, index) => (
              <View key={index} style={styles.playerRow}>
                <View style={styles.playerNumber}>
                  <Text style={styles.playerNumberText}>{index + 1}</Text>
                </View>
                <TextInput
                  style={styles.playerInput}
                  value={player.name}
                  onChangeText={(text) => updateName(index, text)}
                  placeholder={`Igrač ${index + 1}`}
                  placeholderTextColor={COLORS.textMuted}
                  maxLength={20}
                  returnKeyType="done"
                />
                {players.length > MIN_PLAYERS && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => removePlayer(index)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="close-circle" size={22} color="rgba(255,110,132,0.7)" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Add player button */}
            <TouchableOpacity
              style={[styles.addPlayerBtn, players.length >= MAX_PLAYERS && styles.addPlayerBtnDisabled]}
              onPress={addPlayer}
              activeOpacity={players.length >= MAX_PLAYERS ? 1 : 0.7}
              disabled={players.length >= MAX_PLAYERS}
            >
              <MaterialCommunityIcons
                name="plus-circle-outline"
                size={20}
                color={players.length >= MAX_PLAYERS ? COLORS.textMuted : COLORS.primary}
              />
              <Text style={[styles.addPlayerText, players.length >= MAX_PLAYERS && styles.addPlayerTextDisabled]}>
                {t('spectrum.setup.add_player')}
              </Text>
            </TouchableOpacity>

            {/* Min note */}
            {players.length < MIN_PLAYERS && (
              <Text style={styles.minNote}>{t('spectrum.setup.min_note')}</Text>
            )}

            {/* Win score */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('spectrum.setup.win_score')}</Text>
              <Text style={styles.sectionCount}>{winScore} pts</Text>
            </View>
            <View style={styles.pillRow}>
              {WIN_SCORES.map((s) => {
                const sel = winScore === s;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => { Haptics.selectionAsync(); setWinScore(s); }}
                    activeOpacity={0.7}
                    style={[styles.pill, sel && styles.pillSelected]}
                  >
                    {sel ? (
                      <LinearGradient
                        colors={['#8eff71', '#2be800']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.pillGradient}
                      >
                        <Text style={[styles.pillText, styles.pillTextSelected]}>{s}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.pillGradient}>
                        <Text style={styles.pillText}>{s}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Spacer for bottom button */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Start button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.startBtnWrap, !canStart && styles.startBtnDisabled]}
              onPress={handleStart}
              activeOpacity={canStart ? 0.85 : 1}
            >
              <LinearGradient
                colors={canStart ? ['#8eff71', '#2be800'] : ['#3a1646', '#3a1646']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startBtn}
              >
                <Text style={[styles.startBtnText, !canStart && styles.startBtnTextDisabled]}>
                  {t('spectrum.setup.start')}
                </Text>
                <MaterialCommunityIcons
                  name="play"
                  size={18}
                  color={canStart ? '#062200' : COLORS.textMuted}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Help Modal */}
        <Modal
          visible={helpVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setHelpVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setHelpVisible(false)}>
            <Pressable style={styles.helpSheet} onPress={() => {}}>
              <View style={styles.helpHandle} />
              <Text style={styles.helpTitle}>{t('spectrum.setup.help.title')}</Text>

              {[1, 2, 3, 4].map((n) => (
                <View key={n} style={styles.helpRule}>
                  <View style={styles.helpRuleNum}>
                    <Text style={styles.helpRuleNumText}>{n}</Text>
                  </View>
                  <Text style={styles.helpRuleText}>{t(`spectrum.setup.help.rule${n}`)}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.helpCloseBtn}
                onPress={() => setHelpVisible(false)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#a533ff', '#cf96ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.helpCloseBtnInner}
                >
                  <Text style={styles.helpCloseBtnText}>{t('spectrum.setup.help.close')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  statusBarFill: { position: 'absolute', top: 0, left: 0, right: 0, height: 60, backgroundColor: '#22062c' },

  // Scroll
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.lg, fontWeight: '800', color: COLORS.text, letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textMuted,
  },

  // Player row
  playerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#2a0b35',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.1)',
  },
  playerNumber: {
    width: 32, height: 32, borderRadius: 9999,
    backgroundColor: '#3a1646',
    alignItems: 'center', justifyContent: 'center',
  },
  playerNumberText: {
    fontSize: 14, fontWeight: '800', color: COLORS.primary,
  },
  playerInput: {
    flex: 1, fontSize: SIZES.md, color: COLORS.text,
    fontWeight: '600', paddingVertical: 4,
  },
  deleteBtn: {
    padding: 4,
  },

  // Add player button
  addPlayerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(207,150,255,0.35)',
    borderRadius: 14, paddingVertical: 14,
    marginTop: 4,
  },
  addPlayerBtnDisabled: {
    borderColor: 'rgba(207,150,255,0.15)',
  },
  addPlayerText: {
    fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primary, letterSpacing: 1,
  },
  addPlayerTextDisabled: {
    color: COLORS.textMuted,
  },

  // Min note
  minNote: {
    textAlign: 'center', marginTop: 12,
    fontSize: SIZES.sm, color: '#ff6e84', fontWeight: '600', letterSpacing: 0.5,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12,
    backgroundColor: 'rgba(13,1,24,0.95)',
    borderTopWidth: 1, borderTopColor: 'rgba(207,150,255,0.08)',
  },
  startBtnWrap: {
    borderRadius: RADIUS.full, overflow: 'hidden',
    shadowColor: '#8eff71', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  startBtnDisabled: {
    shadowOpacity: 0,
  },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: RADIUS.full,
  },
  startBtnText: {
    fontSize: SIZES.md, fontWeight: '900', color: '#062200', letterSpacing: 2,
  },
  startBtnTextDisabled: {
    color: COLORS.textMuted,
  },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(13,1,24,0.88)',
    justifyContent: 'flex-end',
  },
  helpSheet: {
    backgroundColor: '#22062c', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingTop: 16,
    borderWidth: 1, borderColor: 'rgba(207,150,255,0.12)',
  },
  helpHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(207,150,255,0.3)',
    alignSelf: 'center', marginBottom: 20,
  },
  helpTitle: {
    fontSize: SIZES.xl, fontWeight: '900', color: COLORS.text,
    textAlign: 'center', marginBottom: 24, letterSpacing: 0.5,
  },
  helpRule: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 18,
  },
  helpRuleNum: {
    width: 28, height: 28, borderRadius: 9999,
    backgroundColor: 'rgba(207,150,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(207,150,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  helpRuleNumText: {
    fontSize: 12, fontWeight: '800', color: COLORS.primary,
  },
  helpRuleText: {
    flex: 1, fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 20,
  },
  helpCloseBtn: {
    borderRadius: RADIUS.full, overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#cf96ff', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  helpCloseBtnInner: {
    paddingVertical: 14, alignItems: 'center', borderRadius: RADIUS.full,
  },
  helpCloseBtnText: {
    fontSize: SIZES.md, fontWeight: '800', color: '#2a0052', letterSpacing: 1.5,
  },

  // Win score / pill selector
  pillRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  pill: {
    flex: 1, borderRadius: RADIUS.full, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(207,150,255,0.15)',
    backgroundColor: '#2a0b35',
  },
  pillSelected: { borderColor: 'rgba(142,255,113,0.4)' },
  pillGradient: { paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontSize: SIZES.sm, fontWeight: '800', color: COLORS.textMuted },
  pillTextSelected: { color: '#2a0052' },
});
