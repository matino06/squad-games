import React from "react";
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
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGame } from "../../context/GameContext";
import { useTranslation } from "../../context/LanguageContext";
import { ROLES } from "../../constants/roles";
import { COLORS, SIZES, RADIUS, SHADOWS } from "../../constants/theme";

export default function ResultScreen({ navigation }) {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const { players, winner } = state;

  React.useEffect(() => {
    if (winner === "mafia") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const handleNewGame = () => {
    dispatch({ type: "RESET_GAME_KEEP_SETTINGS" });
    navigation.replace("Setup");
  };

  const handleGoHome = () => {
    dispatch({ type: "RESET_GAME" });
    navigation.replace("Home");
  };

  const mafiaWon = winner === "mafia";
  const mafia = players.filter((p) => ROLES[p.role]?.team === "mafia");
  const village = players.filter((p) => ROLES[p.role]?.team === "village");

  return (
    <LinearGradient
      colors={
        mafiaWon
          ? ["#0d0000", "#130000", "#1a0000"]
          : ["#000d07", "#00110a", "#001a0e"]
      }
      style={styles.container}
    >
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Winner announcement */}
          <View style={styles.winnerSection}>
            <MaterialCommunityIcons
              name={mafiaWon ? "skull-outline" : "shield-outline"}
              size={64}
              color={mafiaWon ? COLORS.danger : COLORS.success}
              style={{ marginBottom: 16 }}
            />
            <Text
              style={[
                styles.winnerLabel,
                { color: mafiaWon ? COLORS.danger : COLORS.success },
              ]}
            >
              {mafiaWon
                ? t("result.mafia_wins_label")
                : t("result.village_wins_label")}
            </Text>
            <Text style={styles.winnerSublabel}>{t("result.won")}</Text>
            <Text style={styles.winnerMessage}>
              {mafiaWon
                ? t("result.mafia_wins_msg")
                : t("result.village_wins_msg")}
            </Text>
          </View>

          {/* Player reveal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("result.roles_revealed")}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                marginBottom: 8,
              }}
            >
              <MaterialCommunityIcons
                name="skull-outline"
                size={12}
                color={COLORS.textMuted}
              />
              <Text style={[styles.teamLabel, { marginBottom: 0 }]}>
                {mafiaWon
                  ? t("result.team_mafia_winners")
                  : t("result.team_mafia_losers")}
              </Text>
            </View>
            {mafia.map((p) => (
              <PlayerRevealRow
                key={p.id}
                player={p}
                isWinner={mafiaWon}
                t={t}
              />
            ))}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              <MaterialCommunityIcons
                name="shield-outline"
                size={12}
                color={COLORS.textMuted}
              />
              <Text style={[styles.teamLabel, { marginBottom: 0 }]}>
                {!mafiaWon
                  ? t("result.team_village_winners")
                  : t("result.team_village_losers")}
              </Text>
            </View>
            {village.map((p) => (
              <PlayerRevealRow
                key={p.id}
                player={p}
                isWinner={!mafiaWon}
                t={t}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.newGameBtn,
              { backgroundColor: mafiaWon ? COLORS.danger : COLORS.success },
            ]}
            onPress={handleNewGame}
            activeOpacity={0.8}
          >
            <Text style={styles.newGameBtnText}>{t("result.new_game")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Text style={styles.homeBtnText}>{t("result.home")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function PlayerRevealRow({ player, isWinner, t }) {
  const role = ROLES[player.role];
  return (
    <View
      style={[
        styles.playerRow,
        !player.isAlive && styles.playerRowDead,
        { borderLeftColor: role?.color ?? COLORS.border },
      ]}
    >
      <MaterialCommunityIcons
        name={role?.icon ?? "account-outline"}
        size={26}
        color={role?.color ?? COLORS.textMuted}
      />
      <View style={styles.playerRowInfo}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text
            style={[
              styles.playerRowName,
              !player.isAlive && styles.playerRowNameDead,
            ]}
          >
            {player.name}
          </Text>
          {!player.isAlive && (
            <MaterialCommunityIcons
              name="skull-outline"
              size={14}
              color={COLORS.textMuted}
            />
          )}
        </View>
        <Text style={[styles.playerRowRole, { color: role?.color }]}>
          {t(`roles.${player.role}.name`)}
        </Text>
      </View>
      {isWinner && player.isAlive && (
        <MaterialCommunityIcons
          name="trophy-outline"
          size={20}
          color="#ffd60a"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: "transparent" },
  scroll: { padding: 20, paddingBottom: 40 },

  winnerSection: {
    alignItems: "center",
    paddingVertical: 36,
    marginBottom: 16,
  },
  winnerLabel: { fontSize: 44, fontWeight: "900", letterSpacing: 2 },
  winnerSublabel: {
    fontSize: SIZES.xl,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 20,
    fontWeight: "400",
  },
  winnerMessage: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
    fontWeight: "400",
  },

  section: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: 16,
  },
  teamLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    marginBottom: 8,
  },

  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgCardLight,
    marginBottom: 6,
  },
  playerRowDead: { opacity: 0.45 },
  playerRowInfo: { flex: 1 },
  playerRowName: { fontSize: SIZES.md, color: COLORS.text, fontWeight: "700" },
  playerRowNameDead: { textDecorationLine: "line-through" },
  playerRowRole: { fontSize: SIZES.sm, fontWeight: "600", marginTop: 2 },

  newGameBtn: {
    paddingVertical: 20,
    borderRadius: RADIUS.full,
    alignItems: "center",
    ...SHADOWS.md,
  },
  newGameBtnText: {
    color: "#fff",
    fontSize: SIZES.lg,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  homeBtn: {
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    alignItems: "center",
    backgroundColor: COLORS.bgCard,
    marginTop: 10,
  },
  homeBtnText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    fontWeight: "600",
  },
});
