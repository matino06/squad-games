import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import GameAppBar from "../../components/GameAppBar";
import { useGame } from "../../context/GameContext";
import { useTranslation } from "../../context/LanguageContext";
import { usePurchase } from "../../context/PurchaseContext";
import { ROLES } from "../../constants/roles";
import { COLORS, SIZES, RADIUS } from "../../constants/theme";

const FREE_PLAYER_LIMIT = 10;

export default function SetupScreen({ navigation }) {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const {
    isPurchased,
    isLoading: isPurchaseLoading,
    price,
    purchaseProduct,
    restorePurchases,
  } = usePurchase();
  const [playerCount, setPlayerCount] = useState(state.playerCount);
  const [roleCounts, setRoleCounts] = useState({ ...state.roleConfig });
  const [helpVisible, setHelpVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const totalRoles = Object.values(roleCounts).reduce((a, b) => a + b, 0);
  const isValid = totalRoles === playerCount;
  const diff = totalRoles - playerCount;

  const changePlayer = (delta) => {
    setPlayerCount((prev) => {
      const next = Math.max(
        4,
        isPurchased ? prev + delta : Math.min(20, prev + delta),
      );
      if (next > FREE_PLAYER_LIMIT && !isPurchased) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setPaywallVisible(true);
        return prev; // don't increase
      }
      return next;
    });
  };

  const changeRole = (roleId, delta) => {
    setRoleCounts((prev) => {
      const current = prev[roleId] ?? 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [roleId]: next };
    });
  };

  const handleNext = () => {
    if (!isValid) return;
    dispatch({ type: "SET_PLAYER_COUNT", payload: playerCount });
    dispatch({ type: "SET_ROLE_CONFIG", payload: roleCounts });
    dispatch({ type: "ASSIGN_ROLES" });
    navigation.navigate("RoleAssignment");
  };

  return (
    <LinearGradient
      colors={["#0d0118", "#1b0424", "#0d0118"]}
      style={styles.container}
    >
      {/* Match status bar area (left/right of notch) to app bar colour */}
      <View style={styles.statusBarFill} />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <GameAppBar
          title="MAFIA"
          subtitle={t("setup.subtitle")}
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
            <Text style={styles.stepperLabel}>{t("setup.players_label")}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[
                  styles.stepBtn,
                  playerCount <= 4 && styles.stepBtnDisabled,
                ]}
                onPress={() => changePlayer(-1)}
                disabled={playerCount <= 4}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="minus"
                  size={28}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{playerCount}</Text>
              <TouchableOpacity
                style={[
                  styles.stepBtn,
                  !isPurchased && playerCount >= 20 && styles.stepBtnDisabled,
                ]}
                onPress={() => changePlayer(1)}
                disabled={!isPurchased && playerCount >= 20}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={28}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.stepperTags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>MIN 4</Text>
              </View>
            </View>
          </View>

          {/* Roles section */}
          <Text style={styles.rolesHeader}>{t("setup.roles_label")}</Text>
          <View style={styles.rolesList}>
            {Object.values(ROLES).map((role) => {
              const count = roleCounts[role.id] ?? 0;
              return (
                <View
                  key={role.id}
                  style={[styles.roleCard, { borderLeftColor: role.color }]}
                >
                  {/* Icon box */}
                  <View
                    style={[
                      styles.roleIconBox,
                      { backgroundColor: role.color + "22" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={role.icon}
                      size={24}
                      color={role.color}
                    />
                  </View>
                  {/* Text */}
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleName}>
                      {t(`roles.${role.id}.name`)}
                    </Text>
                    <Text style={styles.roleDesc} numberOfLines={2}>
                      {t(`roles.${role.id}.desc`)}
                    </Text>
                  </View>
                  {/* Counter pill */}
                  <View style={styles.counterPill}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => changeRole(role.id, -1)}
                      disabled={count === 0}
                      activeOpacity={0.6}
                    >
                      <MaterialCommunityIcons
                        name="minus"
                        size={16}
                        color={
                          count === 0 ? COLORS.textMuted : COLORS.textSecondary
                        }
                      />
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.counterValue,
                        count > 0 && { color: COLORS.text },
                      ]}
                    >
                      {count}
                    </Text>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => changeRole(role.id, 1)}
                      activeOpacity={0.6}
                    >
                      <MaterialCommunityIcons
                        name="plus"
                        size={16}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Bottom spacing so content isn't hidden by fixed bar */}
          <View style={{ height: 180 }} />
        </ScrollView>

        {/* ── Fixed bottom bar ── */}
        <View style={styles.bottomBar}>
          {/* Gradient fade — content scrolls beneath this */}
          <LinearGradient
            colors={["transparent", "rgba(13,1,24,0.92)", "#0d0118"]}
            locations={[0, 0.45, 1]}
            style={styles.bottomBarGradient}
            pointerEvents="none"
          />

          {/* Status pill */}
          <View
            style={[
              styles.statusPill,
              isValid ? styles.statusPillValid : styles.statusPillInvalid,
            ]}
          >
            {isValid ? (
              <>
                <View style={styles.statusCheckCircle}>
                  <MaterialCommunityIcons
                    name="check"
                    size={13}
                    color="#2a0052"
                  />
                </View>
                <Text style={styles.statusText}>
                  {t("setup.status.valid", {
                    total: totalRoles,
                    count: playerCount,
                  })}
                </Text>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={COLORS.primary}
                />
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={18}
                  color={COLORS.danger}
                />
                <Text style={[styles.statusText, { color: COLORS.danger }]}>
                  {diff > 0
                    ? t("setup.status.toomany", { diff })
                    : t("setup.status.toofew", { diff: Math.abs(diff) })}
                </Text>
              </>
            )}
          </View>

          {/* DALJE button */}
          <TouchableOpacity
            onPress={handleNext}
            disabled={!isValid}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isValid ? ["#a533ff", "#cf96ff"] : ["#2a0b35", "#2a0b35"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextBtn}
            >
              <Text
                style={[
                  styles.nextBtnText,
                  !isValid && styles.nextBtnTextDisabled,
                ]}
              >
                {t("setup.next")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── Help Modal ── */}
      <Modal
        visible={helpVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHelpVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setHelpVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalBox}>
            {/* Handle */}
            <View style={styles.modalHandle} />
            {/* Title */}
            <View style={styles.modalTitleRow}>
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={22}
                color={COLORS.primary}
              />
              <Text style={styles.modalTitle}>{t("setup.help.title")}</Text>
            </View>
            {/* Rules */}
            {[
              { icon: "skull-outline", color: "#e63946", key: "rule1" },
              { icon: "medical-bag", color: "#4cc9f0", key: "rule2" },
              { icon: "police-badge-outline", color: "#ffd166", key: "rule3" },
              { icon: "heart-outline", color: "#c77dff", key: "rule4" },
              { icon: "vote-outline", color: "#cf96ff", key: "rule5" },
              { icon: "trophy-outline", color: "#8eff71", key: "rule6" },
            ].map(({ icon, color, key }) => (
              <View key={key} style={styles.modalRule}>
                <View
                  style={[
                    styles.modalRuleIcon,
                    { backgroundColor: color + "22" },
                  ]}
                >
                  <MaterialCommunityIcons name={icon} size={18} color={color} />
                </View>
                <Text style={styles.modalRuleText}>
                  {t(`setup.help.${key}`)}
                </Text>
              </View>
            ))}
            {/* Close */}
            <TouchableOpacity
              onPress={() => setHelpVisible(false)}
              activeOpacity={0.85}
              style={styles.modalCloseBtnWrap}
            >
              <LinearGradient
                colors={["#a533ff", "#cf96ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseBtnText}>
                  {t("setup.help.close")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── Paywall Modal ── */}
      <Modal
        visible={paywallVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaywallVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPaywallVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.paywallBox}>
            <View style={styles.modalHandle} />

            {/* Icon */}
            <View style={styles.paywallIconWrap}>
              <LinearGradient
                colors={["#a533ff", "#cf96ff"]}
                style={styles.paywallIconBg}
              >
                <MaterialCommunityIcons
                  name="account-group"
                  size={36}
                  color="#2a0052"
                />
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={styles.paywallTitle}>{t("paywall.title")}</Text>
            <Text style={styles.paywallSubtitle}>{t("paywall.subtitle")}</Text>

            {/* Feature row */}
            <View style={styles.paywallFeatureRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color={COLORS.tertiary}
              />
              <Text style={styles.paywallFeatureText}>
                {t("paywall.feature")}
              </Text>
            </View>

            {/* Price note */}
            <Text style={styles.paywallPriceNote}>
              {t("paywall.price_note")}
            </Text>

            {/* Buy button */}
            <TouchableOpacity
              style={styles.paywallBuyWrap}
              activeOpacity={0.85}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                purchaseProduct();
              }}
              disabled={isPurchaseLoading || isPurchased}
            >
              <LinearGradient
                colors={
                  isPurchased ? ["#3a1646", "#3a1646"] : ["#a533ff", "#cf96ff"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.paywallBuyBtn}
              >
                {isPurchaseLoading ? (
                  <ActivityIndicator color="#2a0052" />
                ) : (
                  <Text style={styles.paywallBuyText}>
                    {isPurchased
                      ? t("paywall.already")
                      : t("paywall.buy").replace("{price}", price)}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Restore */}
            {!isPurchased && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  restorePurchases();
                }}
                disabled={isPurchaseLoading}
                activeOpacity={0.7}
                style={styles.paywallRestoreBtn}
              >
                <Text style={styles.paywallRestoreText}>
                  {t("paywall.restore")}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: "transparent" },
  statusBarFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#22062c",
  },

  // ── Scroll ──
  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  // ── Player stepper card ──
  stepperCard: {
    backgroundColor: "#2a0b35",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#cf96ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  stepperLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(207,150,255,0.8)",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 36,
    marginBottom: 20,
  },
  stepBtn: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: "#421b4f",
    borderWidth: 1,
    borderColor: "rgba(90,61,98,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnDisabled: { opacity: 0.25 },
  stepValue: {
    fontSize: 64,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -2,
    minWidth: 80,
    textAlign: "center",
  },
  stepperTags: { flexDirection: "row", gap: 8 },
  tag: {
    backgroundColor: "#3a1646",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },

  // ── Roles ──
  rolesHeader: {
    fontSize: SIZES.xl,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 12,
    marginLeft: 4,
  },
  rolesList: { gap: 8 },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22062c",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    gap: 14,
  },
  roleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  roleInfo: { flex: 1 },
  roleName: {
    fontSize: SIZES.lg,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  counterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(90,61,98,0.25)",
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 4,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    fontSize: SIZES.xl,
    fontWeight: "800",
    color: COLORS.textMuted,
    minWidth: 24,
    textAlign: "center",
  },

  // ── Bottom bar ──
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    gap: 10,
  },
  bottomBarGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusPillValid: {
    backgroundColor: "rgba(42,11,53,0.75)",
    borderColor: "rgba(207,150,255,0.2)",
  },
  statusPillInvalid: {
    backgroundColor: "rgba(255,110,132,0.08)",
    borderColor: "rgba(255,110,132,0.2)",
  },
  statusCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    flex: 1,
    fontSize: SIZES.sm,
    fontWeight: "700",
    color: COLORS.text,
  },
  nextBtn: {
    height: 64,
    borderRadius: RADIUS.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#cf96ff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  nextBtnText: {
    fontSize: SIZES.xl,
    fontWeight: "900",
    color: "#2a0052",
    letterSpacing: 2,
  },
  nextBtnTextDisabled: { color: COLORS.textMuted },

  // ── Help Modal ──
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
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: "rgba(207,150,255,0.12)",
    gap: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(207,150,255,0.25)",
    alignSelf: "center",
    marginBottom: 4,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  modalRule: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalRuleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  modalRuleText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    fontWeight: "500",
  },
  modalCloseBtnWrap: {
    borderRadius: RADIUS.full,
    overflow: "hidden",
    marginTop: 8,
  },
  modalCloseBtn: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#2a0052",
    letterSpacing: 1,
  },

  // ── Paywall ──
  tagLock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.3)",
  },
  paywallBox: {
    backgroundColor: "#22062c",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: "rgba(207,150,255,0.12)",
    alignItems: "center",
    gap: 12,
  },
  paywallIconWrap: {
    marginTop: 8,
    shadowColor: "#a533ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  paywallIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  paywallTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 2,
    marginTop: 4,
  },
  paywallSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  paywallFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(142,255,113,0.07)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "stretch",
  },
  paywallFeatureText: {
    fontSize: SIZES.sm,
    fontWeight: "700",
    color: COLORS.tertiary,
  },
  paywallPriceNote: {
    fontSize: 11,
    color: "rgba(207,150,255,0.5)",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  paywallBuyWrap: {
    alignSelf: "stretch",
    borderRadius: RADIUS.full,
    overflow: "hidden",
    shadowColor: "#cf96ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 4,
  },
  paywallBuyBtn: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
  },
  paywallBuyText: {
    fontSize: SIZES.lg,
    fontWeight: "900",
    color: "#2a0052",
    letterSpacing: 1.5,
  },
  paywallRestoreBtn: {
    paddingVertical: 8,
  },
  paywallRestoreText: {
    fontSize: SIZES.sm,
    color: "rgba(207,150,255,0.5)",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
