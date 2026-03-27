import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Animated, KeyboardAvoidingView, Platform, ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGame } from '../../context/GameContext';
import { useTranslation } from '../../context/LanguageContext';
import { ROLES } from '../../constants/roles';
import { COLORS, SIZES, RADIUS, SHADOWS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = Math.min(CARD_WIDTH * (4 / 3), 440);

export default function RoleAssignmentScreen({ navigation }) {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const { players } = state;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('waiting'); // waiting | flipped | named
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');

  const flipAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef(null);

  const currentPlayer = players[currentIndex];
  const role = currentPlayer ? ROLES[currentPlayer.role] : null;
  const isLast = currentIndex === players.length - 1;

  const handleFlip = () => {
    if (phase !== 'waiting') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(flipAnim, {
      toValue: 1, friction: 8, tension: 10, useNativeDriver: true,
    }).start(() => {
      setPhase('flipped');
      setTimeout(() => inputRef.current?.focus(), 300);
    });
  };

  const handleConfirmName = () => {
    const name = nameInput.trim();
    if (!name) { setNameError(t('role.name_empty')); return; }
    const taken = players.some(
      (p, i) => i !== currentIndex && p.name.toLowerCase() === name.toLowerCase()
    );
    if (taken) { setNameError(t('role.name_taken')); return; }
    dispatch({ type: 'SET_PLAYER_NAME', payload: { id: currentPlayer.id, name } });
    setPhase('named');
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      flipAnim.setValue(0);
      setNameInput('');
      setNameError('');
      setCurrentIndex((i) => i + 1);
      setPhase('waiting');
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const handleStart = () => { navigation.replace('NightPhase'); };

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
                  {t('role.player_n_of_m', { n: currentIndex + 1, m: players.length })}
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
                <Text style={styles.instruction}>{t('role.tap_to_reveal')}</Text>
              )}
              {phase === 'flipped' && (
                <Text style={[styles.instruction, { color: role.color }]}>
                  {t('role.remember_role')}
                </Text>
              )}
              {phase === 'named' && (
                <View style={styles.instructionSuccess}>
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color={COLORS.success} />
                  <Text style={[styles.instruction, { color: COLORS.success, marginBottom: 0 }]}>
                    {t('role.name_saved')}
                  </Text>
                </View>
              )}

              {/* Flip Card */}
              <TouchableOpacity
                onPress={handleFlip}
                activeOpacity={phase === 'waiting' ? 0.85 : 1}
                disabled={phase !== 'waiting'}
                style={styles.cardContainer}
              >
                {/* Back */}
                <Animated.View
                  style={[styles.card, {
                    transform: [{ rotateY: backRotate }], opacity: backOpacity,
                  }]}
                >
                  <LinearGradient colors={['#2a0b35', '#1b0424', '#450074']} style={styles.cardGradient}>
                    {/* Decorative particles */}
                    <View style={{position:'absolute', top:40, left:40, width:4, height:4, borderRadius:2, backgroundColor:'rgba(255,255,255,0.25)'}} />
                    <View style={{position:'absolute', top:80, right:60, width:6, height:6, borderRadius:3, backgroundColor:'rgba(207,150,255,0.3)'}} />
                    <View style={{position:'absolute', bottom:100, left:60, width:3, height:3, borderRadius:2, backgroundColor:'rgba(253,144,0,0.4)'}} />
                    <View style={{position:'absolute', bottom:40, right:40, width:4, height:4, borderRadius:2, backgroundColor:'rgba(255,255,255,0.2)'}} />

                    {/* Main content centered */}
                    <MaterialCommunityIcons name="help-circle-outline" size={72} color="#a533ff" style={{marginBottom:20}} />
                    <Text style={styles.cardBackTitle}>{t('role.card_back_title')}</Text>

                    {/* Horizontal divider */}
                    <View style={styles.cardBackDivider} />

                    {/* Tap hint */}
                    <Text style={styles.cardBackHint}>{t('role.card_back_hint')}</Text>

                    {/* Corner decorations */}
                    <View style={styles.cornerTL} />
                    <View style={styles.cornerBR} />
                  </LinearGradient>
                </Animated.View>

                {/* Front */}
                <Animated.View
                  style={[styles.card, StyleSheet.absoluteFillObject, {
                    transform: [{ rotateY: frontRotate }], opacity: frontOpacity,
                  }]}
                >
                  {role && (
                    <LinearGradient colors={['#32113d', '#1b0424']} style={[styles.cardGradient, {borderWidth:2, borderColor: role.color + '66', justifyContent: 'space-between'}]}>
                      {/* Top: icon */}
                      <View style={{alignItems:'center'}}>
                        <View style={[styles.roleIconCircle, {backgroundColor: role.color + '20', borderColor: role.color + '50'}]}>
                          <MaterialCommunityIcons name={role.icon} size={72} color={role.color} />
                          {/* Small badge overlay */}
                          <View style={[styles.roleBadgeOverlay, {backgroundColor: COLORS.tertiary}]}>
                            <MaterialCommunityIcons name={role.icon} size={12} color="#064200" />
                          </View>
                        </View>
                        <Text style={[styles.roleName, {color: role.color}]}>{t(`roles.${role.id}.name`).toUpperCase()}</Text>
                        <Text style={styles.roleSubtitleText}>
                          {role.team === 'mafia' ? t('role.team_mafia') : t('role.team_village')}
                        </Text>
                      </View>

                      {/* Description box with left accent bar */}
                      <View style={styles.roleDescBox}>
                        <View style={[styles.roleDescBar, {backgroundColor: role.color}]} />
                        <Text style={styles.roleDescText}>{t(`roles.${role.id}.card`)}</Text>
                      </View>

                      {/* Decorative icons */}
                      <View style={{flexDirection:'row', justifyContent:'center', gap:12}}>
                        <MaterialCommunityIcons name={role.icon} size={18} color="rgba(195,159,202,0.3)" />
                        <MaterialCommunityIcons name={role.icon} size={26} color={role.color} />
                        <MaterialCommunityIcons name={role.icon} size={18} color="rgba(195,159,202,0.3)" />
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
                      style={[styles.nameInput, nameError ? styles.nameInputError : null, phase === 'named' && styles.nameInputDone]}
                      value={nameInput}
                      onChangeText={(v) => { setNameInput(v); setNameError(''); }}
                      placeholder={t('role.name_placeholder')}
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
                      <MaterialCommunityIcons name="check-circle" size={26} color={COLORS.success} style={styles.inputSuccessIcon} />
                    )}
                  </View>
                  {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
                </View>
              )}

              {/* Action button */}
              {phase === 'named' && (
                <TouchableOpacity onPress={isLast ? handleStart : handleNext} activeOpacity={0.85} style={styles.nextBtnWrap}>
                  <LinearGradient
                    colors={['#a533ff', '#cf96ff']}
                    start={{x:0, y:0}} end={{x:1, y:0}}
                    style={styles.nextBtn}
                  >
                    <Text style={styles.nextBtnText}>{isLast ? t('role.start') : t('role.next')}</Text>
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
  progressDotActive: { backgroundColor: '#cf96ff', width: 32 },

  // Instruction text
  instruction: {
    fontSize: 13, color: 'rgba(195,159,202,0.8)', textAlign: 'center',
    marginBottom: 16, paddingHorizontal: 16,
  },
  instructionSuccess: {
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
    padding: 28, borderRadius: 999, borderWidth: 1, marginBottom: 16,
    position: 'relative',
  },
  roleBadgeOverlay: {
    position: 'absolute', top: -4, right: -4, width: 30, height: 30,
    borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#8eff71', shadowOffset: {width:0, height:0}, shadowOpacity: 0.8, shadowRadius: 8, elevation: 4,
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
    shadowColor: '#a533ff', shadowOffset: {width:0, height:8}, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  nextBtn: {
    height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  nextBtnText: { fontSize: 18, fontWeight: '900', color: '#480079', letterSpacing: 2 },
});
