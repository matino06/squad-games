import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useIntrigue } from '../../context/IntrigueContext';
import { useTranslation } from '../../context/LanguageContext';
import { COLORS, SIZES, RADIUS } from '../../constants/theme';
import { CHARACTERS } from '../../constants/intrigue';

export default function IntrigueExchangeScreen({ navigation }) {
  const { state, dispatch } = useIntrigue();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { players, currentPlayerIdx, exchangeDrawnCards } = state;
  const actor = players[currentPlayerIdx];
  const currentHiddenCards = actor ? actor.cards.filter((c) => !c.revealed) : [];
  const mustKeep = currentHiddenCards.length; // keep same number as before

  const allCards = [...currentHiddenCards, ...exchangeDrawnCards];
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (state.phase === 'victory') {
      navigation.replace('IntrigueVictory');
    }
  }, [state.phase]);

  const toggleCard = (cardId) => {
    Haptics.selectionAsync();
    setSelectedIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }
      if (prev.length >= mustKeep) {
        return [...prev.slice(1), cardId];
      }
      return [...prev, cardId];
    });
  };

  const canConfirm = selectedIds.length === mustKeep;

  const handleConfirm = () => {
    if (!canConfirm) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch({ type: 'CONFIRM_EXCHANGE', payload: { keepCardIds: selectedIds } });
    navigation.replace('IntrigueHandoff');
  };

  const renderCard = (card, isDrawn = false) => {
    const char = CHARACTERS[card.character];
    const isSelected = selectedIds.includes(card.id);
    return (
      <TouchableOpacity
        key={card.id}
        onPress={() => toggleCard(card.id)}
        activeOpacity={0.8}
        style={[
          styles.cardBtn,
          { borderColor: isSelected ? (char?.color ?? COLORS.primary) : 'rgba(207,150,255,0.2)' },
          isSelected && styles.cardBtnSelected,
          isDrawn && !isSelected && styles.cardBtnDrawn,
        ]}
      >
        <LinearGradient
          colors={
            isSelected
              ? [char?.color + '30', char?.color + '15']
              : isDrawn
              ? ['#0a1a2a', '#152030']
              : ['#1a0428', '#2a0b35']
          }
          style={styles.cardBtnGrad}
        >
          {isDrawn && !isSelected && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NOVO</Text>
            </View>
          )}
          <View style={[styles.cardIconCircle, { backgroundColor: char?.color + '20' }]}>
            <MaterialCommunityIcons
              name={char?.icon ?? 'help'}
              size={32}
              color={char?.color ?? COLORS.textMuted}
            />
          </View>
          <Text style={[styles.cardCharName, { color: char?.color ?? COLORS.text }]}>
            {t(`intrigue.chars.${card.character}`)}
          </Text>
          {isSelected && (
            <View style={styles.keepBadge}>
              <MaterialCommunityIcons name="check" size={12} color={char?.color ?? COLORS.primary} />
              <Text style={[styles.keepBadgeText, { color: char?.color }]}>ZADRŽI</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
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
          {/* Header */}
          <View style={styles.headerRow}>
            <MaterialCommunityIcons name="bag-personal-outline" size={24} color="#3498DB" />
            <Text style={styles.screenTitle}>{t('intrigue.exchange.title')}</Text>
          </View>

          {/* Player */}
          <View style={styles.playerRow}>
            <Text style={styles.playerName}>{actor?.name}</Text>
            <View style={styles.keepPill}>
              <Text style={styles.keepPillText}>
                {t('intrigue.exchange.keep').replace('{{n}}', mustKeep)}
              </Text>
            </View>
          </View>

          {/* Private note */}
          <View style={styles.privateNote}>
            <MaterialCommunityIcons name="eye" size={14} color={COLORS.primary} />
            <Text style={styles.privateNoteText}>
              Samo {actor?.name} gleda ekran. Odaberi karte za zadržati!
            </Text>
          </View>

          {/* Selection counter */}
          <View style={styles.selectionCounter}>
            <Text style={styles.selectionCounterText}>
              Odabrano: {selectedIds.length} / {mustKeep}
            </Text>
          </View>

          {/* Current cards */}
          <Text style={styles.sectionLabel}>{t('intrigue.exchange.current')}</Text>
          <View style={styles.cardsGrid}>
            {currentHiddenCards.map((c) => renderCard(c, false))}
          </View>

          {/* Drawn cards */}
          <Text style={styles.sectionLabel}>{t('intrigue.exchange.drawn')}</Text>
          <View style={styles.cardsGrid}>
            {exchangeDrawnCards.map((c) => renderCard(c, true))}
          </View>

          {/* Confirm */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!canConfirm}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={canConfirm ? ['#0a2a4a', '#0a3a6a'] : ['#2a0b35', '#2a0b35']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={canConfirm ? '#3498DB' : COLORS.textMuted}
              />
              <Text style={[styles.confirmBtnText, !canConfirm && styles.confirmBtnTextDisabled]}>
                {t('intrigue.exchange.confirm')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: 20, paddingTop: 28 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#3498DB',
    letterSpacing: 0.5,
  },

  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  playerName: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
  },
  keepPill: {
    backgroundColor: 'rgba(52,152,219,0.15)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(52,152,219,0.3)',
  },
  keepPillText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: '#3498DB',
  },

  privateNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(207,150,255,0.06)',
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(207,150,255,0.12)',
  },
  privateNoteText: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
    fontStyle: 'italic',
  },

  selectionCounter: {
    backgroundColor: 'rgba(52,152,219,0.1)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(52,152,219,0.2)',
  },
  selectionCounterText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: '#3498DB',
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(207,150,255,0.6)',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 2,
  },

  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  cardBtn: {
    flex: 1,
    minWidth: 130,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 2,
  },
  cardBtnSelected: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  cardBtnDrawn: {
    borderStyle: 'dashed',
  },
  cardBtnGrad: {
    padding: 20,
    alignItems: 'center',
    gap: 10,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(52,152,219,0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(52,152,219,0.4)',
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#3498DB',
    letterSpacing: 1.5,
  },
  cardIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCharName: {
    fontSize: SIZES.md,
    fontWeight: '800',
    textAlign: 'center',
  },
  keepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  keepBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  confirmBtn: {
    height: 64,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmBtnDisabled: { shadowOpacity: 0 },
  confirmBtnText: {
    fontSize: SIZES.xl,
    fontWeight: '900',
    color: '#3498DB',
    letterSpacing: 2,
  },
  confirmBtnTextDisabled: { color: COLORS.textMuted },
});
