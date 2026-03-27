import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useIntrigue } from "../../context/IntrigueContext";
import { useTranslation } from "../../context/LanguageContext";
import { COLORS, SIZES, RADIUS } from "../../constants/theme";
import { CHARACTERS } from "../../constants/intrigue";

export default function IntrigueLoseInfluenceScreen({ navigation }) {
  const { state, dispatch } = useIntrigue();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { handoffTo, players } = state;
  const [selected, setSelected] = useState(null);

  // The player who loses influence is the one who was handed off to
  // We can get it from state.currentPlayerIdx after CONFIRM_HANDOFF
  const currentPlayer = players[state.currentPlayerIdx];
  const hiddenCards = currentPlayer
    ? currentPlayer.cards.filter((c) => !c.revealed)
    : [];

  const handleSelect = (cardId) => {
    Haptics.selectionAsync();
    setSelected(cardId);
  };

  const handleConfirm = () => {
    if (!selected) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    dispatch({
      type: "CHOOSE_INFLUENCE_TO_LOSE",
      payload: { playerId: currentPlayer.id, cardId: selected },
    });
    navigation.replace("IntrigueHandoff");
  };

  return (
    <LinearGradient
      colors={["#0d0118", "#1b0424", "#0d0118"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <MaterialCommunityIcons
              name="heart-broken"
              size={26}
              color={COLORS.danger}
            />
            <Text style={styles.screenTitle}>
              {t("intrigue.lose_influence.title")}
            </Text>
          </View>

          {/* Player info */}
          <View style={styles.playerInfoCard}>
            <Text style={styles.playerName}>{currentPlayer?.name}</Text>
            <Text style={styles.chooseHint}>
              {t("intrigue.lose_influence.choose")}
            </Text>
          </View>

          {/* Warning */}
          <View style={styles.warningBox}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={16}
              color={COLORS.danger}
            />
            <Text style={styles.warningText}>
              Odabrana karta bit će trajno otkrivena svim igračima.
            </Text>
          </View>

          {/* Private — show hidden cards */}
          <Text style={styles.cardsLabel}>Tvoje skrivene karte:</Text>

          <View style={styles.cardsGrid}>
            {hiddenCards.map((card) => {
              const char = CHARACTERS[card.character];
              const isSelected = selected === card.id;
              return (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => handleSelect(card.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.cardBtn,
                    {
                      borderColor: isSelected
                        ? COLORS.danger
                        : char?.color + "50",
                    },
                    isSelected && styles.cardBtnSelected,
                  ]}
                >
                  <LinearGradient
                    colors={
                      isSelected
                        ? ["rgba(230,57,70,0.2)", "rgba(230,57,70,0.08)"]
                        : ["#1a0428", "#2a0b35"]
                    }
                    style={styles.cardBtnGrad}
                  >
                    <View
                      style={[
                        styles.cardIconCircle,
                        { backgroundColor: char?.color + "20" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={char?.icon ?? "help"}
                        size={36}
                        color={char?.color ?? COLORS.textMuted}
                      />
                    </View>
                    <Text
                      style={[
                        styles.cardCharName,
                        { color: char?.color ?? COLORS.text },
                      ]}
                    >
                      {t(`intrigue.chars.${card.character}`)}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <MaterialCommunityIcons
                          name="check"
                          size={14}
                          color={COLORS.danger}
                        />
                        <Text style={styles.selectedBadgeText}>ODABRANO</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          {hiddenCards.length === 0 && (
            <View style={styles.noCardsBox}>
              <MaterialCommunityIcons
                name="skull"
                size={32}
                color={COLORS.textMuted}
              />
              <Text style={styles.noCardsText}>
                Nemaš više skrivenih karata.
              </Text>
            </View>
          )}

          {/* Confirm button */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!selected}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                selected ? ["#8B0000", "#C0392B"] : ["#2a0b35", "#2a0b35"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.confirmBtn,
                !selected && styles.confirmBtnDisabled,
              ]}
            >
              <MaterialCommunityIcons
                name="eye-check"
                size={20}
                color={selected ? "#FFD700" : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.confirmBtnText,
                  !selected && styles.confirmBtnTextDisabled,
                ]}
              >
                OTKRIJ KARTU
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
  safe: { flex: 1, backgroundColor: "transparent" },
  scroll: { paddingHorizontal: 20, paddingTop: 28 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.danger,
    letterSpacing: 0.5,
  },

  playerInfoCard: {
    backgroundColor: "#1a0428",
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(230,57,70,0.2)",
    alignItems: "center",
    gap: 6,
  },
  playerName: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  chooseHint: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(230,57,70,0.08)",
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(230,57,70,0.2)",
  },
  warningText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.danger,
    lineHeight: 18,
  },

  cardsLabel: {
    fontSize: SIZES.sm,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 14,
  },

  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  cardBtn: {
    flex: 1,
    minWidth: 130,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 2,
  },
  cardBtnSelected: {
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  cardBtnGrad: {
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  cardIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCharName: {
    fontSize: SIZES.md,
    fontWeight: "800",
    textAlign: "center",
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(230,57,70,0.15)",
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(230,57,70,0.3)",
  },
  selectedBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.danger,
    letterSpacing: 2,
  },

  noCardsBox: {
    alignItems: "center",
    gap: 12,
    padding: 32,
    backgroundColor: "#1a0428",
    borderRadius: RADIUS.xl,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.1)",
  },
  noCardsText: {
    fontSize: SIZES.md,
    color: COLORS.textMuted,
    textAlign: "center",
  },

  confirmBtn: {
    height: 64,
    borderRadius: RADIUS.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#8B0000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmBtnDisabled: { shadowOpacity: 0 },
  confirmBtnText: {
    fontSize: SIZES.xl,
    fontWeight: "900",
    color: "#FFD700",
    letterSpacing: 2,
  },
  confirmBtnTextDisabled: { color: COLORS.textMuted },
});
