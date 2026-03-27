import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Animated,
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
import {
  CHARACTERS,
  ACTIONS,
  MANDATORY_COUP_THRESHOLD,
} from "../../constants/intrigue";

export default function IntrigueTurnScreen({ navigation }) {
  const { state, dispatch } = useIntrigue();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { players, currentPlayerIdx, deck } = state;
  const actor = players[currentPlayerIdx];

  const [cardsVisible, setCardsVisible] = useState(false);
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [pendingActionType, setPendingActionType] = useState(null);
  const [holdingAction, setHoldingAction] = useState(null);

  const fillAnim = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef(null);

  const HOLD_DURATION = 600;

  useEffect(() => {
    if (state.phase === "victory") {
      navigation.replace("IntrigueVictory");
    }
  }, [state.phase]);

  const isEliminated = (p) => p.cards.every((c) => c.revealed);
  const opponents = players.filter((p) => p.id !== actor.id);
  const mustCoup = actor.ducats >= MANDATORY_COUP_THRESHOLD;

  const hiddenCardCount = (player) =>
    player.cards.filter((c) => !c.revealed).length;

  const canAfford = (actionDef) => {
    return actor.ducats >= actionDef.cost;
  };

  const handleActionPressIn = (actionType) => {
    const actionDef = ACTIONS[actionType];
    if (!canAfford(actionDef)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHoldingAction(actionType);
    fillAnim.setValue(0);
    Animated.timing(fillAnim, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        triggerAction(actionType);
      }
    });
  };

  const handleActionPressOut = () => {
    setHoldingAction(null);
    fillAnim.stopAnimation();
    Animated.timing(fillAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const triggerAction = (actionType) => {
    const actionDef = ACTIONS[actionType];
    setHoldingAction(null);
    if (actionDef.needsTarget) {
      setPendingActionType(actionType);
      setTargetModalVisible(true);
    } else {
      executeAction(actionType, null);
    }
  };

  const executeAction = (actionType, targetId) => {
    setTargetModalVisible(false);
    dispatch({ type: "SELECT_ACTION", payload: { actionType, targetId } });
    navigation.replace("IntrigueHandoff");
  };

  const renderCharCard = (charId, cardData) => {
    const char = CHARACTERS[charId];
    if (!char) return null;
    return (
      <View
        key={cardData.id}
        style={[styles.cardChip, { borderColor: char.color + "60" }]}
      >
        <MaterialCommunityIcons name={char.icon} size={14} color={char.color} />
        <Text style={[styles.cardChipText, { color: char.color }]}>
          {t(`intrigue.chars.${charId}`)}
        </Text>
      </View>
    );
  };

  const renderActionBtn = (
    actionType,
    {
      icon,
      colorLeft,
      colorRight,
      textColor,
      label,
      desc,
      canUse = true,
      isDisabled = false,
    },
  ) => {
    const disabled = isDisabled || !canUse;
    const isHolding = holdingAction === actionType;
    const fillWidth = fillAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    });
    return (
      <Pressable
        key={actionType}
        onPressIn={disabled ? undefined : () => handleActionPressIn(actionType)}
        onPressOut={disabled ? undefined : handleActionPressOut}
        disabled={disabled}
        style={[styles.actionBtnWrap, disabled && styles.actionBtnDisabled]}
      >
        <LinearGradient
          colors={disabled ? ["#1a0428", "#1a0428"] : [colorLeft, colorRight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionBtn}
        >
          {/* Fill progress overlay */}
          {!disabled && isHolding && (
            <Animated.View style={[styles.actionFill, { width: fillWidth }]} />
          )}
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={disabled ? COLORS.textMuted : textColor}
          />
          <View style={styles.actionBtnText}>
            <Text
              style={[
                styles.actionLabel,
                disabled && styles.actionLabelDisabled,
              ]}
            >
              {label}
            </Text>
            <Text style={styles.actionDesc}>{desc}</Text>
          </View>
          {!disabled && (
            <MaterialCommunityIcons
              name="gesture-tap-hold"
              size={16}
              color={
                isHolding ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"
              }
            />
          )}
        </LinearGradient>
      </Pressable>
    );
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
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerCard}>
            <LinearGradient
              colors={["#2a0b35", "#1a0428"]}
              style={styles.headerGrad}
            >
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.yourTurnLabel}>
                    {t("intrigue.turn.your_turn")}
                  </Text>
                  <Text style={styles.playerNameLarge}>{actor.name}</Text>
                </View>
                <View style={styles.ducatBox}>
                  <MaterialCommunityIcons
                    name="gold"
                    size={20}
                    color="#FFD700"
                  />
                  <Text style={styles.ducatCount}>{actor.ducats}</Text>
                  <Text style={styles.ducatLabel}>
                    {t("intrigue.turn.ducats")}
                  </Text>
                </View>
              </View>

              {/* Hold to view cards */}
              <Pressable
                onPressIn={() => setCardsVisible(true)}
                onPressOut={() => setCardsVisible(false)}
                style={styles.viewCardsBtn}
              >
                <LinearGradient
                  colors={
                    cardsVisible
                      ? ["#421b4f", "#5c0a8a"]
                      : ["#1a0428", "#2a0b35"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.viewCardsBg}
                >
                  <MaterialCommunityIcons
                    name={cardsVisible ? "eye" : "eye-off"}
                    size={18}
                    color={cardsVisible ? COLORS.primary : COLORS.textMuted}
                  />
                  {cardsVisible ? (
                    <View style={styles.cardsRow}>
                      {actor.cards
                        .filter((c) => !c.revealed)
                        .map((c) => renderCharCard(c.character, c))}
                      {actor.cards
                        .filter((c) => c.revealed)
                        .map((c) => (
                          <View key={c.id} style={styles.cardChipRevealed}>
                            <MaterialCommunityIcons
                              name="eye-check"
                              size={14}
                              color={COLORS.textMuted}
                            />
                            <Text style={styles.cardChipRevealedText}>
                              {t(`intrigue.chars.${c.character}`)}
                            </Text>
                          </View>
                        ))}
                    </View>
                  ) : (
                    <Text style={styles.viewCardsBtnText}>
                      {t("intrigue.turn.hold_to_view")}
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </View>

          {/* Mandatory coup warning */}
          {mustCoup && (
            <View style={styles.coupWarning}>
              <MaterialCommunityIcons
                name="alert"
                size={18}
                color={COLORS.danger}
              />
              <Text style={styles.coupWarningText}>
                {t("intrigue.turn.must_coup")}
              </Text>
            </View>
          )}

          {/* Actions */}
          {mustCoup ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("intrigue.turn.actions")}
              </Text>
              {renderActionBtn("prevrat", {
                icon: "sword-cross",
                colorLeft: "#5c0000",
                colorRight: "#8B0000",
                textColor: "#FFD700",
                label: t("intrigue.action.prevrat"),
                desc: t("intrigue.action.prevrat_desc"),
                canUse: canAfford(ACTIONS.prevrat),
              })}
            </View>
          ) : (
            <>
              {/* General actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t("intrigue.turn.actions")}
                </Text>

                {renderActionBtn("saberi", {
                  icon: "hand-coin",
                  colorLeft: "#1a3a1a",
                  colorRight: "#2a4a2a",
                  textColor: COLORS.tertiary,
                  label: t("intrigue.action.saberi"),
                  desc: t("intrigue.action.saberi_desc"),
                })}

                {renderActionBtn("donacija", {
                  icon: "bank-transfer-in",
                  colorLeft: "#1a2a3a",
                  colorRight: "#2a3a4a",
                  textColor: "#4fc3f7",
                  label: t("intrigue.action.donacija"),
                  desc: t("intrigue.action.donacija_desc"),
                })}

                {renderActionBtn("prevrat", {
                  icon: "sword-cross",
                  colorLeft: "#5c0000",
                  colorRight: "#8B0000",
                  textColor: "#FFD700",
                  label: t("intrigue.action.prevrat"),
                  desc: t("intrigue.action.prevrat_desc"),
                  canUse: canAfford(ACTIONS.prevrat),
                })}
              </View>

              {/* Character actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Akcije likova</Text>

                {renderActionBtn("porez", {
                  icon: "crown",
                  colorLeft: "#2a2500",
                  colorRight: "#3a3500",
                  textColor: "#FFD700",
                  label: t("intrigue.action.porez"),
                  desc: t("intrigue.action.porez_desc"),
                })}

                {renderActionBtn("ubojstvo", {
                  icon: "eye-off-outline",
                  colorLeft: "#2a0a2a",
                  colorRight: "#3a0a3a",
                  textColor: "#9B59B6",
                  label: t("intrigue.action.ubojstvo"),
                  desc: t("intrigue.action.ubojstvo_desc"),
                  canUse: canAfford(ACTIONS.ubojstvo),
                })}

                {renderActionBtn("pljacka", {
                  icon: "knife",
                  colorLeft: "#2a0a0a",
                  colorRight: "#3a1010",
                  textColor: "#E74C3C",
                  label: t("intrigue.action.pljacka"),
                  desc: t("intrigue.action.pljacka_desc"),
                })}

                {renderActionBtn("razmjena", {
                  icon: "bag-personal-outline",
                  colorLeft: "#0a1a2a",
                  colorRight: "#0a2a3a",
                  textColor: "#3498DB",
                  label: t("intrigue.action.razmjena"),
                  desc: t("intrigue.action.razmjena_desc"),
                })}
              </View>
            </>
          )}

          {/* Opponents */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("intrigue.turn.opponents")}
            </Text>
            <View style={styles.opponentsList}>
              {opponents.map((opp) => {
                const eliminated = isEliminated(opp);
                const hidden = hiddenCardCount(opp);
                return (
                  <View
                    key={opp.id}
                    style={[
                      styles.oppCard,
                      eliminated && styles.oppCardEliminated,
                    ]}
                  >
                    <View style={styles.oppLeft}>
                      <MaterialCommunityIcons
                        name={eliminated ? "skull-outline" : "account"}
                        size={18}
                        color={eliminated ? COLORS.textMuted : COLORS.text}
                      />
                      <View>
                        <Text
                          style={[
                            styles.oppName,
                            eliminated && styles.oppNameEliminated,
                          ]}
                        >
                          {opp.name}
                        </Text>
                        {eliminated && (
                          <Text style={styles.eliminatedTag}>ELIMINIRAN</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.oppRight}>
                      {/* Ducats */}
                      <View style={styles.oppStat}>
                        <MaterialCommunityIcons
                          name="gold"
                          size={14}
                          color="#FFD700"
                        />
                        <Text style={styles.oppStatText}>{opp.ducats}</Text>
                      </View>
                      {/* Influence */}
                      <View style={styles.oppStat}>
                        <MaterialCommunityIcons
                          name="cards-outline"
                          size={14}
                          color={COLORS.primary}
                        />
                        <Text style={styles.oppStatText}>{hidden}</Text>
                      </View>
                      {/* Revealed cards */}
                      {opp.cards
                        .filter((c) => c.revealed)
                        .map((c) => {
                          const char = CHARACTERS[c.character];
                          return (
                            <View
                              key={c.id}
                              style={[
                                styles.revealedChip,
                                { borderColor: char?.color + "60" },
                              ]}
                            >
                              <MaterialCommunityIcons
                                name={char?.icon}
                                size={12}
                                color={char?.color}
                              />
                            </View>
                          );
                        })}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Target selection modal */}
      <Modal
        visible={targetModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTargetModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setTargetModalVisible(false)}
        >
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {t("intrigue.turn.choose_target")}
            </Text>
            {opponents
              .filter((o) => !isEliminated(o))
              .map((opp) => (
                <Pressable
                  key={opp.id}
                  style={({ pressed }) => [
                    styles.targetRow,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    executeAction(pendingActionType, opp.id);
                  }}
                >
                  <MaterialCommunityIcons
                    name="account"
                    size={20}
                    color={COLORS.text}
                  />
                  <View style={styles.targetInfo}>
                    <Text style={styles.targetName}>{opp.name}</Text>
                    <View style={styles.targetStats}>
                      <MaterialCommunityIcons
                        name="gold"
                        size={13}
                        color="#FFD700"
                      />
                      <Text style={styles.targetStatText}>{opp.ducats}</Text>
                      <MaterialCommunityIcons
                        name="cards-outline"
                        size={13}
                        color={COLORS.primary}
                      />
                      <Text style={styles.targetStatText}>
                        {hiddenCardCount(opp)}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={COLORS.textMuted}
                  />
                </Pressable>
              ))}
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: "transparent" },
  scroll: { paddingHorizontal: 16, paddingTop: 20 },

  // Header card
  headerCard: {
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.15)",
    shadowColor: "#a533ff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  headerGrad: { padding: 20 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  yourTurnLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  playerNameLarge: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  ducatBox: {
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 2,
  },
  ducatCount: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFD700",
    lineHeight: 30,
  },
  ducatLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(255,215,0,0.6)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  viewCardsBtn: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  viewCardsBg: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.1)",
  },
  viewCardsBtnText: {
    fontSize: SIZES.sm,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  cardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  cardChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cardChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardChipRevealed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(138,106,146,0.3)",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  cardChipRevealedText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
    textDecorationLine: "line-through",
  },

  coupWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(230,57,70,0.1)",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(230,57,70,0.3)",
    padding: 14,
    marginBottom: 14,
  },
  coupWarningText: {
    flex: 1,
    fontSize: SIZES.sm,
    fontWeight: "700",
    color: COLORS.danger,
    lineHeight: 18,
  },

  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(207,150,255,0.6)",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 2,
  },

  actionBtnWrap: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.08)",
  },
  actionBtnDisabled: { opacity: 0.45 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    overflow: "hidden",
    position: "relative",
  },
  actionFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: RADIUS.lg,
  },
  actionBtnText: { flex: 1 },
  actionLabel: {
    fontSize: SIZES.md,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 2,
  },
  actionLabelDisabled: { color: COLORS.textMuted },
  actionDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },

  // Opponents
  opponentsList: { gap: 8 },
  oppCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a0428",
    borderRadius: RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.1)",
    gap: 12,
  },
  oppCardEliminated: {
    opacity: 0.45,
    borderColor: "rgba(138,106,146,0.1)",
  },
  oppLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  oppName: {
    fontSize: SIZES.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  oppNameEliminated: {
    color: COLORS.textMuted,
    textDecorationLine: "line-through",
  },
  eliminatedTag: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 2,
  },
  oppRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  oppStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  oppStatText: {
    fontSize: SIZES.sm,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  revealedChip: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(13,1,24,0.85)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#22062c",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: "rgba(207,150,255,0.12)",
    gap: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(207,150,255,0.25)",
    alignSelf: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: SIZES.xl,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: "#2a0b35",
    borderRadius: RADIUS.lg,
  },
  targetInfo: { flex: 1 },
  targetName: {
    fontSize: SIZES.md,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  targetStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  targetStatText: {
    fontSize: SIZES.sm,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginRight: 6,
  },
});
