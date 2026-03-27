import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";

const WINDOW_HEIGHT = Dimensions.get("window").height;
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import GameAppBar from "../../components/GameAppBar";
import { useIntrigue } from "../../context/IntrigueContext";
import { useTranslation } from "../../context/LanguageContext";
import { COLORS, SIZES, RADIUS } from "../../constants/theme";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

const CHARS = [
  {
    icon: "crown",
    color: "#FFD700",
    nameKey: "intrigue.chars.knez",
    descKey: "intrigue.help.char_knez",
  },
  {
    icon: "drama-masks",
    color: "#9B59B6",
    nameKey: "intrigue.chars.ubojica",
    descKey: "intrigue.help.char_ubojica",
  },
  {
    icon: "knife",
    color: "#E74C3C",
    nameKey: "intrigue.chars.razbojnik",
    descKey: "intrigue.help.char_razbojnik",
  },
  {
    icon: "bag-personal-outline",
    color: "#3498DB",
    nameKey: "intrigue.chars.putnik",
    descKey: "intrigue.help.char_putnik",
  },
  {
    icon: "shield-account",
    color: "#2ECC71",
    nameKey: "intrigue.chars.cuvarica",
    descKey: "intrigue.help.char_cuvarica",
  },
];

const ACTIONS_HELP = [
  {
    icon: "hand-coin",
    color: "#2ECC71",
    nameKey: "intrigue.action.saberi",
    descKey: "intrigue.action.saberi_desc",
    cost: null,
  },
  {
    icon: "bank-transfer-in",
    color: "#4fc3f7",
    nameKey: "intrigue.action.donacija",
    descKey: "intrigue.action.donacija_desc",
    cost: null,
  },
  {
    icon: "crown",
    color: "#FFD700",
    nameKey: "intrigue.action.porez",
    descKey: "intrigue.action.porez_desc",
    cost: null,
  },
  {
    icon: "eye-off-outline",
    color: "#9B59B6",
    nameKey: "intrigue.action.ubojstvo",
    descKey: "intrigue.action.ubojstvo_desc",
    cost: "3",
  },
  {
    icon: "knife",
    color: "#E74C3C",
    nameKey: "intrigue.action.pljacka",
    descKey: "intrigue.action.pljacka_desc",
    cost: null,
  },
  {
    icon: "bag-personal-outline",
    color: "#3498DB",
    nameKey: "intrigue.action.razmjena",
    descKey: "intrigue.action.razmjena_desc",
    cost: null,
  },
  {
    icon: "sword-cross",
    color: "#C0392B",
    nameKey: "intrigue.action.prevrat",
    descKey: "intrigue.action.prevrat_desc",
    cost: "7",
  },
];

function SectionHeader({ icon, color, label }) {
  return (
    <View style={sectionHeaderStyles.row}>
      <View
        style={[sectionHeaderStyles.iconBox, { backgroundColor: color + "22" }]}
      >
        <MaterialCommunityIcons name={icon} size={15} color={color} />
      </View>
      <Text style={sectionHeaderStyles.label}>{label}</Text>
    </View>
  );
}

const sectionHeaderStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: SIZES.md,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: 0.3,
  },
});

export default function IntrigueSetupScreen({ navigation }) {
  const { dispatch } = useIntrigue();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [playerNames, setPlayerNames] = useState(["", ""]);
  const [helpVisible, setHelpVisible] = useState(false);

  const canStart =
    playerNames.length >= MIN_PLAYERS &&
    playerNames.every((n) => n.trim().length > 0);

  const addPlayer = () => {
    if (playerNames.length >= MAX_PLAYERS) return;
    Haptics.selectionAsync();
    setPlayerNames((prev) => [...prev, ""]);
  };

  const removePlayer = (idx) => {
    if (playerNames.length <= MIN_PLAYERS) return;
    Haptics.selectionAsync();
    setPlayerNames((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateName = (idx, value) => {
    setPlayerNames((prev) => prev.map((n, i) => (i === idx ? value : n)));
  };

  const handleStart = () => {
    if (!canStart) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch({
      type: "SETUP_GAME",
      payload: { playerNames: playerNames.map((n) => n.trim()) },
    });
    navigation.navigate("IntrigueHandoff");
  };

  return (
    <LinearGradient
      colors={["#0d0118", "#1b0424", "#0d0118"]}
      style={styles.container}
    >
      <View style={styles.statusBarFill} />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <GameAppBar
          title={t("intrigue.setup.title")}
          subtitle={t("intrigue.setup.setup_label")}
          onBack={() => navigation.goBack()}
          onHelp={() => setHelpVisible(true)}
        />

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 160 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Player count label */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="account-group"
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.sectionLabel}>
              {t("intrigue.setup.players_label")}
            </Text>
            <Text style={styles.playerCount}>
              {playerNames.length}/{MAX_PLAYERS}
            </Text>
          </View>

          {/* Player name inputs */}
          <View style={styles.playersList}>
            {playerNames.map((name, idx) => (
              <View key={idx} style={styles.playerRow}>
                <View style={styles.playerNumBox}>
                  <Text style={styles.playerNum}>{idx + 1}</Text>
                </View>
                <TextInput
                  style={styles.nameInput}
                  value={name}
                  onChangeText={(v) => updateName(idx, v)}
                  placeholder={t("intrigue.setup.player_name").replace(
                    "{{n}}",
                    idx + 1,
                  )}
                  placeholderTextColor={COLORS.textMuted}
                  maxLength={20}
                  autoCorrect={false}
                />
                {playerNames.length > MIN_PLAYERS && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removePlayer(idx)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Add player button */}
          {playerNames.length < MAX_PLAYERS && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={addPlayer}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.addBtnText}>
                {t("intrigue.setup.add_player")}
              </Text>
            </TouchableOpacity>
          )}

          {/* Game info card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
              <Text style={styles.infoText}>
                Knez · Ubojica · Razbojnik · Putnik · Čuvarica
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="cards-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.infoText}>
                15 karata · 2 karte po igraču · 2 dukata start
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="trophy-outline"
                size={16}
                color={COLORS.tertiary}
              />
              <Text style={styles.infoText}>
                Posljednji igrač s utjecajem pobjeđuje
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom bar */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <LinearGradient
            colors={["transparent", "rgba(13,1,24,0.92)", "#0d0118"]}
            locations={[0, 0.45, 1]}
            style={styles.bottomBarGradient}
            pointerEvents="none"
          />
          <TouchableOpacity
            onPress={handleStart}
            disabled={!canStart}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                canStart
                  ? ["#8B0000", "#C0392B", "#8B0000"]
                  : ["#2a0b35", "#2a0b35"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startBtn}
            >
              <MaterialCommunityIcons
                name="chess-queen"
                size={22}
                color={canStart ? "#FFD700" : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.startBtnText,
                  !canStart && styles.startBtnTextDisabled,
                ]}
              >
                {t("intrigue.setup.start")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── Help modal ────────────────────────────────────────── */}
      <Modal
        visible={helpVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHelpVisible(false)}
      >
        {/* Overlay — tap outside to close */}
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setHelpVisible(false)}
          />

          {/* Sheet — plain View so it never swallows scroll touches */}
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.helpHeader}>
              <View style={styles.helpHeaderIcon}>
                <MaterialCommunityIcons
                  name="chess-queen"
                  size={24}
                  color="#FFD700"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.helpTitle}>
                  {t("intrigue.setup.title")}
                </Text>
                <Text style={styles.helpSubtitle}>
                  {t("intrigue.setup.subtitle")}
                </Text>
              </View>
              <Pressable
                onPress={() => setHelpVisible(false)}
                style={styles.helpCloseX}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={COLORS.textMuted}
                />
              </Pressable>
            </View>

            {/* Scrollable content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.helpScroll}
            >
              {/* Cilj */}
              <View style={styles.helpSection}>
                <SectionHeader
                  icon="target"
                  color={COLORS.primary}
                  label={t("intrigue.help.goal_title")}
                />
                <Text style={styles.helpBody}>
                  {t("intrigue.help.goal_body")}
                </Text>
              </View>

              <View style={styles.helpDivider} />

              {/* Tok igre */}
              <View style={styles.helpSection}>
                <SectionHeader
                  icon="rotate-right"
                  color="#4fc3f7"
                  label={t("intrigue.help.flow_title")}
                />
                <Text style={styles.helpBody}>
                  {t("intrigue.help.flow_body")}
                </Text>
              </View>

              <View style={styles.helpDivider} />

              {/* Reakcije */}
              <View style={styles.helpSection}>
                <SectionHeader
                  icon="lightning-bolt"
                  color="#FFD700"
                  label={t("intrigue.help.reactions_title")}
                />
                {[
                  {
                    icon: "check-circle-outline",
                    color: COLORS.tertiary,
                    key: "intrigue.help.react_accept",
                  },
                  {
                    icon: "shield-outline",
                    color: "#FFD700",
                    key: "intrigue.help.react_block",
                  },
                  {
                    icon: "sword-cross",
                    color: COLORS.danger,
                    key: "intrigue.help.react_challenge",
                  },
                ].map((r) => (
                  <View key={r.key} style={styles.helpReactRow}>
                    <MaterialCommunityIcons
                      name={r.icon}
                      size={18}
                      color={r.color}
                      style={{ marginTop: 1 }}
                    />
                    <Text style={[styles.helpBody, { flex: 1 }]}>
                      {t(r.key)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.helpDivider} />

              {/* Likovi */}
              <View style={styles.helpSection}>
                <SectionHeader
                  icon="cards-outline"
                  color={COLORS.primary}
                  label={t("intrigue.help.chars_title")}
                />
                {CHARS.map((c) => (
                  <View key={c.nameKey} style={styles.helpCharRow}>
                    <View
                      style={[
                        styles.helpCharIcon,
                        { backgroundColor: c.color + "22" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={c.icon}
                        size={16}
                        color={c.color}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.helpCharName, { color: c.color }]}>
                        {t(c.nameKey)}
                      </Text>
                      <Text style={styles.helpBody}>{t(c.descKey)}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.helpDivider} />

              {/* Akcije */}
              <View style={styles.helpSection}>
                <SectionHeader
                  icon="sword-cross"
                  color={COLORS.danger}
                  label={t("intrigue.help.actions_title")}
                />
                {ACTIONS_HELP.map((a) => (
                  <View key={a.nameKey} style={styles.helpActionRow}>
                    <View
                      style={[
                        styles.helpCharIcon,
                        { backgroundColor: a.color + "22" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={a.icon}
                        size={15}
                        color={a.color}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.helpActionTop}>
                        <Text style={[styles.helpCharName, { color: a.color }]}>
                          {t(a.nameKey)}
                        </Text>
                        {a.cost !== null && (
                          <View style={styles.costBadge}>
                            <MaterialCommunityIcons
                              name="gold"
                              size={11}
                              color="#FFD700"
                            />
                            <Text style={styles.costText}>{a.cost}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.helpBody}>{t(a.descKey)}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Upozorenje */}
              <View style={styles.helpWarning}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={18}
                  color={COLORS.danger}
                  style={{ marginTop: 1 }}
                />
                <Text style={styles.helpWarningText}>
                  {t("intrigue.help.coup_warning")}
                </Text>
              </View>
            </ScrollView>

            {/* Close button */}
            <Pressable
              style={({ pressed }) => [
                styles.helpCloseBtn,
                pressed && { opacity: 0.75 },
              ]}
              onPress={() => setHelpVisible(false)}
            >
              <Text style={styles.helpCloseBtnText}>
                {t("intrigue.help.close")}
              </Text>
            </Pressable>
          </View>
        </View>
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
  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(207,150,255,0.8)",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  playerCount: {
    fontSize: SIZES.sm,
    fontWeight: "700",
    color: COLORS.textMuted,
  },

  playersList: { gap: 10, marginBottom: 14 },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#22062c",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  playerNumBox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(139,0,0,0.3)",
    borderWidth: 1,
    borderColor: "rgba(192,57,43,0.4)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  playerNum: { fontSize: 12, fontWeight: "800", color: "#C0392B" },
  nameInput: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.text,
    paddingVertical: 14,
    fontWeight: "600",
  },
  removeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.2)",
    borderStyle: "dashed",
    marginBottom: 24,
  },
  addBtnText: {
    fontSize: SIZES.sm,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  infoCard: {
    backgroundColor: "#1a0428",
    borderRadius: RADIUS.lg,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(139,0,0,0.3)",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 56,
    gap: 10,
  },
  bottomBarGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  startBtn: {
    height: 64,
    borderRadius: RADIUS.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#C0392B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  startBtnText: {
    fontSize: SIZES.xl,
    fontWeight: "900",
    color: "#FFD700",
    letterSpacing: 2,
  },
  startBtnTextDisabled: { color: COLORS.textMuted },

  // ── Help modal ──────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(13,1,24,0.85)",
  },
  modalBox: {
    backgroundColor: "#18022a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: "rgba(207,150,255,0.15)",
    maxHeight: WINDOW_HEIGHT * 0.88,
    paddingBottom: 28,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(207,150,255,0.25)",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },

  helpHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(207,150,255,0.08)",
  },
  helpHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,215,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  helpSubtitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(207,150,255,0.55)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 2,
  },
  helpCloseX: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(207,150,255,0.06)",
  },

  helpScroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },

  helpSection: { marginBottom: 4 },
  helpDivider: {
    height: 1,
    backgroundColor: "rgba(207,150,255,0.07)",
    marginVertical: 16,
  },

  helpBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  helpReactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
    paddingLeft: 2,
  },

  helpCharRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
    paddingLeft: 2,
  },
  helpCharIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  helpCharName: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 1,
  },

  helpActionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
    paddingLeft: 2,
  },
  helpActionTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 1,
  },
  costBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,215,0,0.1)",
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
  },
  costText: { fontSize: 11, fontWeight: "800", color: "#FFD700" },

  helpWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(192,57,43,0.1)",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(192,57,43,0.25)",
    padding: 14,
    marginTop: 4,
    marginBottom: 4,
  },
  helpWarningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: "700",
    lineHeight: 20,
  },

  helpCloseBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "rgba(207,150,255,0.08)",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.18)",
    paddingVertical: 14,
    alignItems: "center",
  },
  helpCloseBtnText: {
    fontSize: SIZES.md,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
