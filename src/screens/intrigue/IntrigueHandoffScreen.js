import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useIntrigue } from "../../context/IntrigueContext";
import { useTranslation } from "../../context/LanguageContext";
import { COLORS, SIZES, RADIUS } from "../../constants/theme";

export default function IntrigueHandoffScreen({ navigation }) {
  const { state, dispatch } = useIntrigue();
  const { t } = useTranslation();
  const { handoffTo, players } = state;

  // Redirect to victory if phase changed
  useEffect(() => {
    if (state.phase === "victory") {
      navigation.replace("IntrigueVictory");
    }
  }, [state.phase]);

  if (!handoffTo && state.phase !== "victory") return null;
  if (state.phase === "victory") return null;

  const targetPlayer = players.find((p) => p.id === handoffTo.playerId);
  const playerName = targetPlayer?.name ?? "—";

  const contextMessage = () => {
    switch (handoffTo.context) {
      case "your_turn":
        return t("intrigue.turn.your_turn");
      case "react":
        return t("intrigue.reaction.title");
      case "block":
        return "Reagiraj na blokadu";
      case "exchange":
        return t("intrigue.exchange.title");
      case "challenge_proof":
        return t("intrigue.challenge.title");
      case "challenge_lost":
        return t("intrigue.lose_influence.title");
      case "challenge_won":
        return t("intrigue.lose_influence.title");
      case "prevrat":
        return t("intrigue.lose_influence.title");
      default:
        return t("intrigue.lose_influence.title");
    }
  };

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: "CONFIRM_HANDOFF" });
    navigateToNextScreen();
  };

  const navigateToNextScreen = () => {
    const { nextPhase } = handoffTo;
    switch (nextPhase) {
      case "view_turn":
        navigation.replace("IntrigueTurn");
        break;
      case "reactions":
        navigation.replace("IntrigueReaction");
        break;
      case "block_challenge":
        navigation.replace("IntrigueReaction");
        break;
      case "challenge_proof":
        navigation.replace("IntrigueChallenge");
        break;
      case "lose_influence":
        navigation.replace("IntrigueLoseInfluence");
        break;
      case "exchange":
        navigation.replace("IntrigueExchange");
        break;
      default:
        navigation.replace("IntrigueTurn");
    }
  };

  return (
    <LinearGradient
      colors={["#0d0118", "#1b0424", "#0d0118"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.content}>
          {/* Shield icon */}
          <View style={styles.shieldWrap}>
            <LinearGradient
              colors={["#2a0b35", "#3a1646"]}
              style={styles.shieldBg}
            >
              <MaterialCommunityIcons
                name="shield-lock"
                size={56}
                color={COLORS.primary}
              />
            </LinearGradient>
          </View>

          {/* Shield label */}
          <Text style={styles.shieldLabel}>{t("intrigue.handoff.shield")}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Pass to */}
          <Text style={styles.passToLabel}>
            {t("intrigue.handoff.pass_to")}
          </Text>
          <Text style={styles.playerName}>{playerName}</Text>

          {/* Context */}
          <View style={styles.contextPill}>
            <Text style={styles.contextText}>{contextMessage()}</Text>
          </View>

          <View style={{ flex: 1 }} />

          {/* Tap to continue button */}
          <Pressable
            onPress={handleTap}
            style={({ pressed }) => [
              styles.tapBtnWrap,
              pressed && styles.tapBtnPressed,
            ]}
          >
            <LinearGradient
              colors={["#2a0b35", "#3a1646"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tapBtnBg}
            >
              <MaterialCommunityIcons
                name="arrow-right-circle-outline"
                size={22}
                color={COLORS.primary}
              />
              <Text style={styles.tapBtnText}>
                {t("intrigue.handoff.continue")}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: "transparent" },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },

  shieldWrap: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
    marginBottom: 18,
  },
  shieldBg: {
    width: 110,
    height: 110,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.2)",
  },

  shieldLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 28,
  },

  divider: {
    width: 60,
    height: 2,
    backgroundColor: "rgba(207,150,255,0.15)",
    borderRadius: 1,
    marginBottom: 28,
  },

  passToLabel: {
    fontSize: SIZES.sm,
    fontWeight: "600",
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  playerName: {
    fontSize: 44,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -1,
    textAlign: "center",
    marginBottom: 16,
  },

  contextPill: {
    backgroundColor: "rgba(139,0,0,0.2)",
    borderWidth: 1,
    borderColor: "rgba(192,57,43,0.3)",
    borderRadius: RADIUS.full,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  contextText: {
    fontSize: SIZES.sm,
    fontWeight: "700",
    color: "#E74C3C",
    letterSpacing: 1,
  },

  tapBtnWrap: {
    width: "100%",
    borderRadius: RADIUS.full,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  tapBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  tapBtnBg: {
    height: 68,
    borderRadius: RADIUS.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.15)",
  },
  tapBtnText: {
    fontSize: SIZES.lg,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
