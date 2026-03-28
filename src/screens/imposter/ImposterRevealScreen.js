import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, TextInput, KeyboardAvoidingView, Platform, ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useImposter } from '../../context/ImposterContext';
import { useTranslation } from '../../context/LanguageContext';
import { COLORS, SIZES, RADIUS, SHADOWS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = Math.min(CARD_WIDTH * (4 / 3), 440);
const IMPOSTER_COLOR = '#a855f7';

export default function ImposterRevealScreen({ navigation }) {
  const { state, dispatch } = useImposter();
  const { t } = useTranslation();
  const { players, hintEnabled } = state;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('waiting');
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');

  const flipAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef(null);

  const currentPlayer = players[currentIndex];
  const isLast = currentIndex === players.length - 1;
  const isImposter = currentPlayer?.isImposter;

  const handleFlip = () => {
    if (phase !== 'waiting') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(flipAnim, { toValue: 1, friction: 8, tension: 10, useNativeDriver: true }).start(() => {
      setPhase('flipped');
      setTimeout(() => inputRef.current?.focus(), 300);
    });
  };

  const handleConfirmName = () => {
    const name = nameInput.trim();
    if (!name) { setNameError(t('imposter.reveal.name_empty')); return; }
    const taken = players.some((p, i) => i !== currentIndex && p.name.toLowerCase() === name.toLowerCase());
    if (taken) { setNameError(t('imposter.reveal.name_taken')); return; }
    dispatch({ type: 'SET_PLAYER_NAME', payload: { id: currentPlayer.id, name } });
    setPhase('named');
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      flipAnim.setValue(0);
      setNameInput('');
      setNameError('');
      setCurrentIndex((i) => i + 1);
      setPhase('waiting');
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [0, 0, 1, 1] });

  if (!currentPlayer) return null;

  return (
    <LinearGradient colors={['#0d0118', '#1b0424', '#0d0118']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.playerLabel}>
                  {t('imposter.reveal.player_n_of_m', { n: currentIndex + 1, m: players.length })}
                </Text>
                <View style={styles.progressRow}>
                  {players.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.progressDot,
                        i < currentIndex && styles.progressDotDone,
                        i === currentIndex && styles.progressDotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Instruction */}
              {phase === 'waiting' && (
                <Text style={styles.instruction}>{t('imposter.reveal.tap_to_see')}</Text>
              )}
              {phase === 'flipped' && (
                <View style={styles.instructionRow}>
                  <MaterialCommunityIcons
                    name={isImposter ? 'eye-outline' : 'book-open-outline'}
                    size={16}
                    color={isImposter ? IMPOSTER_COLOR : '#8eff71'}
                  />
                  <Text style={[styles.instruction, {
                    color: isImposter ? IMPOSTER_COLOR : '#8eff71', marginBottom: 0,
                  }]}>
                    {isImposter ? t('imposter.reveal.is_imposter') : t('imposter.reveal.is_civilian')}
                  </Text>
                </View>
              )}
              {phase === 'named' && (
                <View style={styles.instructionRow}>
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color="#8eff71" />
                  <Text style={[styles.instruction, { color: '#8eff71', marginBottom: 0 }]}>
                    {t('imposter.reveal.name_saved')}
                  </Text>
                </View>
              )}

              {/* Flip card */}
              <TouchableOpacity
                onPress={handleFlip}
                activeOpacity={phase === 'waiting' ? 0.85 : 1}
                disabled={phase !== 'waiting'}
                style={styles.cardContainer}
              >
                {/* Back */}
                <Animated.View
                  style={[styles.card, { transform: [{ rotateY: backRotate }], opacity: backOpacity }]}
                >
                  <LinearGradient colors={['#2a0b35', '#1b0424', '#450074']} style={styles.cardGradient}>
                    {/* Decorative particles */}
                    <View style={{position:'absolute', top:40, left:40, width:4, height:4, borderRadius:2, backgroundColor:'rgba(255,255,255,0.25)'}} />
                    <View style={{position:'absolute', top:80, right:60, width:6, height:6, borderRadius:3, backgroundColor:'rgba(168,85,247,0.3)'}} />
                    <View style={{position:'absolute', bottom:100, left:60, width:3, height:3, borderRadius:2, backgroundColor:'rgba(253,144,0,0.4)'}} />
                    <View style={{position:'absolute', bottom:40, right:40, width:4, height:4, borderRadius:2, backgroundColor:'rgba(255,255,255,0.2)'}} />
                    <MaterialCommunityIcons name="help-circle-outline" size={72} color="#a533ff" style={{marginBottom:20}} />
                    <Text style={styles.cardBackTitle}>IMPOSTER</Text>
                    <View style={styles.cardBackDivider} />
                    <Text style={styles.cardBackHint}>{t('imposter.reveal.card_back_hint')}</Text>
                    <View style={styles.cornerTL} />
                    <View style={styles.cornerBR} />
                  </LinearGradient>
                </Animated.View>

                {/* Front */}
                <Animated.View
                  style={[
                    styles.card, StyleSheet.absoluteFillObject,
                    { transform: [{ rotateY: frontRotate }], opacity: frontOpacity },
                  ]}
                >
                  {isImposter ? (
                    <LinearGradient
                      colors={['#2d0a4e', '#1b0424']}
                      style={[styles.cardGradient, { borderWidth: 2, borderColor: IMPOSTER_COLOR + '66', justifyContent: 'space-between' }]}
                    >
                      {/* Top section */}
                      <View style={{ alignItems: 'center' }}>
                        <View style={[styles.roleIconCircle, { backgroundColor: IMPOSTER_COLOR + '20', borderColor: IMPOSTER_COLOR + '50' }]}>
                          <MaterialCommunityIcons name="eye-outline" size={72} color={IMPOSTER_COLOR} />
                          <View style={[styles.roleBadgeOverlay, { backgroundColor: '#8eff71' }]}>
                            <MaterialCommunityIcons name="eye-outline" size={12} color="#064200" />
                          </View>
                        </View>
                        <Text style={[styles.roleName, { color: IMPOSTER_COLOR }]}>IMPOSTER</Text>
                        <Text style={styles.roleSubtitleText}>
                          {t('imposter.reveal.you_are_imposter')}
                        </Text>
                      </View>

                      {/* Middle: desc box */}
                      <View style={styles.roleDescBox}>
                        <View style={[styles.roleDescBar, { backgroundColor: IMPOSTER_COLOR }]} />
                        <View style={{ flex: 1 }}>
                          {hintEnabled ? (
                            <>
                              <View style={styles.categoryLabelRow}>
                                <MaterialCommunityIcons name="tag-outline" size={13} color="#8a6a92" />
                                <Text style={styles.imposterWordLabel}>{t('imposter.reveal.fake_word_label')}</Text>
                              </View>
                              <View style={styles.categoryBadge}>
                                <Text style={styles.categoryBadgeText}>{currentPlayer.word}</Text>
                              </View>
                              <Text style={styles.roleDescText}>{t('imposter.reveal.imposter_hint')}</Text>
                            </>
                          ) : (
                            <>
                              <View style={styles.categoryLabelRow}>
                                <MaterialCommunityIcons name="tag-off-outline" size={13} color="#8a6a92" />
                                <Text style={styles.imposterWordLabel}>{t('imposter.reveal.no_hint_label')}</Text>
                              </View>
                              <Text style={styles.roleDescText}>{t('imposter.reveal.no_hint_desc')}</Text>
                            </>
                          )}
                        </View>
                      </View>

                      {/* Bottom: decorative icons */}
                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
                        <MaterialCommunityIcons name="eye-outline" size={18} color="rgba(168,85,247,0.3)" />
                        <MaterialCommunityIcons name="eye-outline" size={26} color={IMPOSTER_COLOR} />
                        <MaterialCommunityIcons name="eye-outline" size={18} color="rgba(168,85,247,0.3)" />
                      </View>
                    </LinearGradient>
                  ) : (
                    <LinearGradient
                      colors={['#0a2e1a', '#1b0424']}
                      style={[styles.cardGradient, { borderWidth: 2, borderColor: '#8eff71' + '66', justifyContent: 'space-between' }]}
                    >
                      {/* Top section */}
                      <View style={{ alignItems: 'center' }}>
                        <View style={[styles.roleIconCircle, { backgroundColor: '#8eff71' + '20', borderColor: '#8eff71' + '50' }]}>
                          <MaterialCommunityIcons name="check-circle-outline" size={72} color="#8eff71" />
                          <View style={[styles.roleBadgeOverlay, { backgroundColor: '#8eff71' }]}>
                            <MaterialCommunityIcons name="check" size={12} color="#064200" />
                          </View>
                        </View>
                        <Text style={[styles.roleName, { color: '#8eff71', fontSize: 24 }]}>
                          {t('imposter.reveal.is_civilian')}
                        </Text>
                        <Text style={styles.roleSubtitleText}>
                          {t('imposter.reveal.secret_word')}
                        </Text>
                      </View>

                      {/* Middle: desc box */}
                      <View style={styles.roleDescBox}>
                        <View style={[styles.roleDescBar, { backgroundColor: '#8eff71' }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.imposterWordLabel}>{t('imposter.reveal.secret_word')}</Text>
                          <Text style={[styles.wordBig, { color: '#8eff71', fontSize: 32, fontWeight: '900' }]}>{currentPlayer.word}</Text>
                          <Text style={styles.roleDescText}>{t('imposter.reveal.word_hint')}</Text>
                        </View>
                      </View>

                      {/* Bottom: decorative icons */}
                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
                        <MaterialCommunityIcons name="check-circle-outline" size={18} color="rgba(142,255,113,0.3)" />
                        <MaterialCommunityIcons name="check-circle-outline" size={26} color="#8eff71" />
                        <MaterialCommunityIcons name="check-circle-outline" size={18} color="rgba(142,255,113,0.3)" />
                      </View>
                    </LinearGradient>
                  )}
                </Animated.View>
              </TouchableOpacity>

              {/* Name input */}
              {(phase === 'flipped' || phase === 'named') && (
                <View style={styles.nameSection}>
                  <View style={styles.nameInputWrapper}>
                    <TextInput
                      ref={inputRef}
                      style={[
                        styles.nameInput,
                        nameError ? styles.nameInputError : null,
                        phase === 'named' && styles.nameInputDone,
                      ]}
                      value={nameInput}
                      onChangeText={(v) => { setNameInput(v); setNameError(''); }}
                      placeholder={t('imposter.reveal.name_placeholder')}
                      placeholderTextColor="rgba(138,106,146,0.6)"
                      maxLength={20}
                      returnKeyType="done"
                      onSubmitEditing={handleConfirmName}
                      editable={phase === 'flipped'}
                    />
                    {phase === 'flipped' && (
                      <TouchableOpacity style={styles.inputConfirmBtn} onPress={handleConfirmName}>
                        <MaterialCommunityIcons name="check" size={20} color="#fff" />
                      </TouchableOpacity>
                    )}
                    {phase === 'named' && (
                      <MaterialCommunityIcons name="check-circle" size={26} color="#8eff71" style={styles.inputSuccessIcon} />
                    )}
                  </View>
                  {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
                </View>
              )}

              {/* Action button */}
              {phase === 'named' && (
                <TouchableOpacity
                  onPress={isLast ? () => navigation.replace('ImposterPlay') : handleNext}
                  activeOpacity={0.85}
                  style={styles.nextBtnWrap}
                >
                  <LinearGradient
                    colors={['#a533ff', '#cf96ff']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.nextBtn}
                  >
                    <Text style={styles.nextBtnText}>
                      {isLast ? t('imposter.reveal.start_game') : t('imposter.reveal.next')}
                    </Text>
                    <MaterialCommunityIcons name="arrow-right" size={24} color="#480079" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48 },
  inner: { flex: 1, alignItems: 'center' },

  // Header
  header: { width: '100%', alignItems: 'center', paddingTop: 20, marginBottom: 12 },
  playerLabel: { fontSize: 16, color: 'rgba(251,219,255,0.7)', fontWeight: '600' },
  progressRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  progressDot: { height: 6, width: 20, borderRadius: 999, backgroundColor: '#3a1646' },
  progressDotDone: { backgroundColor: '#8eff71' },
  progressDotActive: { backgroundColor: IMPOSTER_COLOR, width: 32 },

  // Instruction
  instruction: {
    fontSize: 13, color: 'rgba(195,159,202,0.8)', textAlign: 'center',
    marginBottom: 16, paddingHorizontal: 16,
  },
  instructionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16,
  },

  // Card container
  cardContainer: { width: CARD_WIDTH, height: CARD_HEIGHT, marginBottom: 24 },
  card: {
    width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.5, shadowRadius: 48, elevation: 16,
  },
  cardGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, borderRadius: 20 },

  // Card back elements
  cardBackTitle: { fontSize: 36, fontWeight: '900', color: '#fbdbff', letterSpacing: 5, marginBottom: 16, textAlign: 'center' },
  cardBackDivider: {
    width: 80, height: 2, backgroundColor: 'transparent',
    borderBottomWidth: 2, borderBottomColor: '#cf96ff', opacity: 0.4, marginBottom: 20,
  },
  cardBackHint: { fontSize: 11, color: 'rgba(195,159,202,0.7)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: '600' },
  cornerTL: { position: 'absolute', top: 20, left: 20, width: 28, height: 28, borderTopWidth: 2, borderLeftWidth: 2, borderColor: 'rgba(207,150,255,0.2)', borderRadius: 2 },
  cornerBR: { position: 'absolute', bottom: 20, right: 20, width: 28, height: 28, borderBottomWidth: 2, borderRightWidth: 2, borderColor: 'rgba(207,150,255,0.2)', borderRadius: 2 },

  // Card front elements
  roleIconCircle: {
    padding: 24, borderRadius: 999, borderWidth: 1, marginBottom: 16,
    position: 'relative',
  },
  roleBadgeOverlay: {
    position: 'absolute', top: -4, right: -4, width: 30, height: 30,
    borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#8eff71', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8, elevation: 4,
  },
  roleName: { fontSize: 32, fontWeight: '900', letterSpacing: 1, marginBottom: 6, textAlign: 'center' },
  roleSubtitleText: { fontSize: 11, color: 'rgba(195,159,202,0.6)', letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700', marginBottom: 20 },
  roleDescBox: {
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 12, padding: 16,
    width: '100%', borderWidth: 1, borderColor: 'rgba(90,61,98,0.2)',
    flexDirection: 'row', gap: 12, alignSelf: 'stretch',
  },
  roleDescBar: { width: 4, borderRadius: 2, alignSelf: 'stretch' },
  roleDescText: { flex: 1, fontSize: 13, color: 'rgba(251,219,255,0.85)', lineHeight: 19, fontWeight: '500' },
  categoryLabelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8,
  },
  imposterWordLabel: {
    fontSize: 10, color: '#8a6a92', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(165,51,255,0.18)',
    borderWidth: 1,
    borderColor: IMPOSTER_COLOR + '55',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 10,
  },
  categoryBadgeText: {
    fontSize: 24, fontWeight: '900', color: IMPOSTER_COLOR, letterSpacing: 0.5,
  },
  wordBig: { letterSpacing: 0.5, textAlign: 'left', marginBottom: 8 },

  // Name input section
  nameSection: { width: '100%', marginBottom: 12 },
  nameInputWrapper: { position: 'relative', flexDirection: 'row', alignItems: 'center' },
  nameInput: {
    flex: 1, height: 60, paddingHorizontal: 24, paddingRight: 60,
    backgroundColor: '#000000',
    borderWidth: 1, borderColor: 'rgba(90,61,98,0.4)',
    borderRadius: 999,
    fontSize: 17, color: '#fbdbff', fontWeight: '500',
  },
  nameInputError: { borderColor: '#ff6e84' },
  nameInputDone: { borderColor: '#8eff71' },
  inputConfirmBtn: {
    position: 'absolute', right: 8,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#cf96ff', alignItems: 'center', justifyContent: 'center',
  },
  inputSuccessIcon: { position: 'absolute', right: 16 },
  errorText: { color: '#ff6e84', fontSize: 12, marginTop: 6, marginLeft: 16, fontWeight: '500' },

  // Next/Start button
  nextBtnWrap: {
    width: '100%', borderRadius: 999, overflow: 'hidden',
    shadowColor: '#a533ff', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  nextBtn: {
    height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  nextBtnText: { fontSize: 18, fontWeight: '900', color: '#480079', letterSpacing: 2 },
});
