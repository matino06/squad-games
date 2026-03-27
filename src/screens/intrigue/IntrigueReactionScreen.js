import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useIntrigue } from '../../context/IntrigueContext';
import { useTranslation } from '../../context/LanguageContext';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';
import { CHARACTERS, ACTIONS } from '../../constants/intrigue';

// Which characters can block which actions
const BLOCK_OPTIONS = {
  donacija: ['knez'],
  ubojstvo: ['cuvarica'],
  pljacka: ['razbojnik'],
};

export default function IntrigueReactionScreen({ navigation }) {
  const { state, dispatch } = useIntrigue();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { pendingAction, currentReactorId, pendingBlock, players } = state;
  const [charPickerVisible, setCharPickerVisible] = useState(false);
  const [selectedChar, setSelectedChar] = useState(null);
  const [cardsVisible, setCardsVisible] = useState(false);

  // Determine if we're in block_challenge mode (actor reacts to block)
  const isBlockChallenge = state.phase === 'block_challenge' || !!pendingBlock;

  const reactor = players.find((p) => p.id === (isBlockChallenge ? pendingAction?.actorId : currentReactorId));
  const actor = players.find((p) => p.id === pendingAction?.actorId);
  const actionDef = pendingAction ? ACTIONS[pendingAction.type] : null;

  const canBlock = () => {
    if (isBlockChallenge) return false;
    if (!actionDef?.blockable) return false;
    if (actionDef.blockedByTargetOnly && currentReactorId !== pendingAction?.targetId) return false;
    return true;
  };

  const canChallenge = () => {
    if (isBlockChallenge) return true;
    return actionDef?.challengeable ?? false;
  };

  const blockCharOptions = pendingAction ? (BLOCK_OPTIONS[pendingAction.type] ?? []) : [];

  const handleAccept = () => {
    Haptics.selectionAsync();
    if (isBlockChallenge) {
      dispatch({ type: 'BLOCK_REACTION', payload: { reaction: 'accept' } });
    } else {
      dispatch({ type: 'REACT', payload: { playerId: currentReactorId, reaction: 'accept' } });
    }
    navigation.replace('IntrigueHandoff');
  };

  const handleBlock = () => {
    if (blockCharOptions.length === 1) {
      confirmBlock(blockCharOptions[0]);
    } else {
      setCharPickerVisible(true);
    }
  };

  const confirmBlock = (charId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCharPickerVisible(false);
    dispatch({
      type: 'REACT',
      payload: {
        playerId: currentReactorId,
        reaction: 'block',
        claimedCharacter: charId,
      },
    });
    navigation.replace('IntrigueHandoff');
  };

  const handleChallenge = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (isBlockChallenge) {
      dispatch({ type: 'BLOCK_REACTION', payload: { reaction: 'challenge' } });
    } else {
      dispatch({
        type: 'REACT',
        payload: { playerId: currentReactorId, reaction: 'challenge' },
      });
    }
    navigation.replace('IntrigueHandoff');
  };

  const actionLabel = () => {
    if (!pendingAction) return '';
    const actionName = t(`intrigue.action.${pendingAction.type}`);
    if (pendingAction.claimedCharacter) {
      const charName = t(`intrigue.chars.${pendingAction.claimedCharacter}`);
      return `${charName} → ${actionName}`;
    }
    return actionName;
  };

  const blockLabel = () => {
    if (!pendingBlock) return '';
    const charName = t(`intrigue.chars.${pendingBlock.claimedCharacter}`);
    return `${pendingBlock ? players.find((p) => p.id === pendingBlock.blockerId)?.name : ''} → BLOKIRAJ (${charName})`;
  };

  const renderCharCard = (charId, cardData) => {
    const char = CHARACTERS[charId];
    if (!char) return null;
    return (
      <View key={cardData.id} style={[styles.cardChip, { borderColor: char.color + '60' }]}>
        <MaterialCommunityIcons name={char.icon} size={14} color={char.color} />
        <Text style={[styles.cardChipText, { color: char.color }]}>
          {t(`intrigue.chars.${charId}`)}
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#0d0118', '#1b0424', '#0d0118']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.screenTitle}>{t('intrigue.reaction.title')}</Text>

          {/* Announced action card */}
          <View style={styles.announcedCard}>
            <View style={styles.announcedTop}>
              <MaterialCommunityIcons name="bullhorn" size={16} color={COLORS.primary} />
              <Text style={styles.announcedLabel}>Najavljena akcija</Text>
            </View>
            <Text style={styles.actorName}>{actor?.name}</Text>
            <Text style={styles.announcedAction}>{actionLabel()}</Text>

            {pendingAction?.targetId && (
              <View style={styles.targetRow}>
                <MaterialCommunityIcons name="arrow-right" size={14} color={COLORS.textMuted} />
                <Text style={styles.targetText}>
                  Meta: {players.find((p) => p.id === pendingAction.targetId)?.name}
                </Text>
              </View>
            )}
          </View>

          {/* Block info (if reacting to block) */}
          {isBlockChallenge && pendingBlock && (
            <View style={styles.blockCard}>
              <View style={styles.announcedTop}>
                <MaterialCommunityIcons name="shield" size={16} color="#FFD700" />
                <Text style={[styles.announcedLabel, { color: '#FFD700' }]}>Blokada</Text>
              </View>
              <Text style={styles.announcedAction}>{blockLabel()}</Text>
            </View>
          )}

          {/* Reactor info */}
          <View style={styles.reactorRow}>
            <Text style={styles.reactorLabel}>{t('intrigue.reaction.now_reacting')}</Text>
            <Text style={styles.reactorName}>{reactor?.name ?? '—'}</Text>
          </View>

          {/* Hold to view cards */}
          {reactor && (
            <Pressable
              onPressIn={() => { setCardsVisible(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              onPressOut={() => setCardsVisible(false)}
              style={styles.viewCardsBtn}
            >
              <LinearGradient
                colors={cardsVisible ? ['#421b4f', '#5c0a8a'] : ['#1a0428', '#2a0b35']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.viewCardsBg}
              >
                <MaterialCommunityIcons
                  name={cardsVisible ? 'eye' : 'eye-off'}
                  size={18}
                  color={cardsVisible ? COLORS.primary : COLORS.textMuted}
                />
                {cardsVisible ? (
                  <View style={styles.cardsRow}>
                    {reactor.cards.filter((c) => !c.revealed).map((c) =>
                      renderCharCard(c.character, c)
                    )}
                    {reactor.cards.filter((c) => c.revealed).map((c) => (
                      <View key={c.id} style={styles.cardChipRevealed}>
                        <MaterialCommunityIcons name="eye-check" size={14} color={COLORS.textMuted} />
                        <Text style={styles.cardChipRevealedText}>
                          {t(`intrigue.chars.${c.character}`)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.viewCardsBtnText}>{t('intrigue.turn.hold_to_view')}</Text>
                )}
              </LinearGradient>
            </Pressable>
          )}

          {/* Reaction buttons */}
          <View style={styles.buttonsSection}>
            {/* Accept */}
            <Pressable
              style={({ pressed }) => [styles.acceptBtn, pressed && { opacity: 0.85 }]}
              onPress={handleAccept}
            >
              <LinearGradient
                colors={['#0d3a0d', '#1a5c1a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.reactionBtnGrad}
              >
                <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.tertiary} />
                <Text style={[styles.reactionBtnText, { color: COLORS.tertiary }]}>
                  {t('intrigue.reaction.accept')}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Block */}
            {canBlock() && (
              <Pressable
                style={({ pressed }) => [styles.blockBtn, pressed && { opacity: 0.85 }]}
                onPress={handleBlock}
              >
                <LinearGradient
                  colors={['#2a2500', '#3a3500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.reactionBtnGrad}
                >
                  <MaterialCommunityIcons name="shield" size={24} color="#FFD700" />
                  <Text style={[styles.reactionBtnText, { color: '#FFD700' }]}>
                    {t('intrigue.reaction.block')}
                  </Text>
                </LinearGradient>
              </Pressable>
            )}

            {/* Challenge */}
            {canChallenge() && (
              <Pressable
                style={({ pressed }) => [styles.challengeBtn, pressed && { opacity: 0.85 }]}
                onPress={handleChallenge}
              >
                <LinearGradient
                  colors={['#3a0a0a', '#5c1010']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.reactionBtnGrad}
                >
                  <MaterialCommunityIcons name="sword-cross" size={24} color={COLORS.danger} />
                  <Text style={[styles.reactionBtnText, { color: COLORS.danger }]}>
                    {t('intrigue.reaction.challenge')}
                  </Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>

          {/* Info about what blocking means */}
          {canBlock() && blockCharOptions.length > 0 && (
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="information-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.infoBoxText}>
                {t('intrigue.reaction.claiming')}{' '}
                {blockCharOptions.map((c) => t(`intrigue.chars.${c}`)).join(' / ')}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Block character picker */}
      <Modal
        visible={charPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCharPickerVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCharPickerVisible(false)}
        >
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('intrigue.reaction.claiming')}</Text>
            {blockCharOptions.map((charId) => {
              const char = CHARACTERS[charId];
              return (
                <Pressable
                  key={charId}
                  style={({ pressed }) => [styles.charOption, pressed && { opacity: 0.75 }]}
                  onPress={() => confirmBlock(charId)}
                >
                  <View style={[styles.charIconBox, { backgroundColor: char.color + '22' }]}>
                    <MaterialCommunityIcons name={char.icon} size={22} color={char.color} />
                  </View>
                  <Text style={styles.charOptionName}>{t(`intrigue.chars.${charId}`)}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: 20, paddingTop: 28 },

  screenTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 20,
  },

  announcedCard: {
    backgroundColor: '#1a0428',
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.15)',
    gap: 8,
  },
  announcedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  announcedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  actorName: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  announcedAction: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  targetText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },

  blockCard: {
    backgroundColor: '#2a2500',
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    gap: 6,
  },

  reactorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(207,150,255,0.06)',
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.12)',
  },
  reactorLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  reactorName: {
    fontSize: SIZES.xl,
    fontWeight: '900',
    color: COLORS.text,
  },

  // Hold to view cards
  viewCardsBtn: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: 20,
  },
  viewCardsBg: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.1)',
  },
  viewCardsBtnText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  cardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardChipRevealed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(138,106,146,0.3)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  cardChipRevealedText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },

  buttonsSection: { gap: 12, marginBottom: 16 },

  acceptBtn: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(142,255,113,0.2)',
    shadowColor: COLORS.tertiary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  blockBtn: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  challengeBtn: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(230,57,70,0.2)',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  reactionBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  reactionBtnText: {
    fontSize: SIZES.xl,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(138,106,146,0.08)',
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(138,106,146,0.15)',
  },
  infoBoxText: {
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
    lineHeight: 17,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13,1,24,0.85)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#22062c',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(207,150,255,0.12)',
    gap: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(207,150,255,0.25)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  charOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: '#2a0b35',
    borderRadius: RADIUS.lg,
  },
  charIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  charOptionName: {
    flex: 1,
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
});
