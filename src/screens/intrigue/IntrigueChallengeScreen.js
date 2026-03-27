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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useIntrigue } from "../../context/IntrigueContext";
import { useTranslation } from "../../context/LanguageContext";
import { COLORS, SIZES, RADIUS } from "../../constants/theme";
import { CHARACTERS } from "../../constants/intrigue";

export default function IntrigueChallengeScreen({ navigation }) {
  const { state, dispatch } = useIntrigue();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { pendingChallenge, players } = state;

  if (!pendingChallenge) return null;

  const challenged = players.find(
    (p) => p.id === pendingChallenge.challengedId,
  );
  const challenger = players.find(
    (p) => p.id === pendingChallenge.challengerId,
  );
  const claimedChar = CHARACTERS[pendingChallenge.claimedCharacter];
  const claimedCharName = pendingChallenge.claimedCharacter
    ? t(`intrigue.chars.${pendingChallenge.claimedCharacter}`)
    : "?";

  const hiddenCards = challenged
    ? challenged.cards.filter((c) => !c.revealed)
    : [];

  const handleRevealCard = (cardId) => {
    const card = hiddenCards.find((c) => c.id === cardId);
    const hasClaimedChar =
      card?.character === pendingChallenge.claimedCharacter;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    dispatch({
      type: "REVEAL_FOR_CHALLENGE",
      payload: { cardId, hasCard: hasClaimedChar },
    });
    navigation.replace("IntrigueHandoff");
  };

  const handleAdmitBluff = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    // Use first hidden card id as a placeholder (won't matter since hasCard=false)
    const cardId = hiddenCards[0]?.id ?? "";
    dispatch({
      type: "REVEAL_FOR_CHALLENGE",
      payload: { cardId, hasCard: false },
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
              name="sword-cross"
              size={24}
              color={COLORS.danger}
            />
            <Text style={styles.screenTitle}>
              {t("intrigue.challenge.title")}
            </Text>
          </View>

          {/* Who challenged who */}
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeText}>
              <Text style={styles.challengeName}>{challenger?.name}</Text>
              <Text style={styles.challengeTextNormal}> izaziva </Text>
              <Text style={styles.challengeName}>{challenged?.name}</Text>
            </Text>
            <View style={styles.charClaimRow}>
              {claimedChar && (
                <View
                  style={[
                    styles.charChip,
                    { borderColor: claimedChar.color + "60" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={claimedChar.icon}
                    size={16}
                    color={claimedChar.color}
                  />
                  <Text
                    style={[styles.charChipText, { color: claimedChar.color }]}
                  >
                    {claimedCharName}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.proveLabel}>
              {t("intrigue.challenge.prove").replace(
                "{{character}}",
                claimedCharName,
              )}
            </Text>
          </View>

          {/* Private — show cards */}
          <View style={styles.privateNote}>
            <MaterialCommunityIcons
              name="eye"
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.privateNoteText}>
              Samo {challenged?.name} gleda ekran. Ostali ne gledaju!
            </Text>
          </View>

          {/* Player's cards */}
          <Text style={styles.cardsLabel}>
            {t("intrigue.challenge.show_card")}
          </Text>
          <Text style={styles.cardsHint}>
            Odaberi kartu koja dokazuje da imaš {claimedCharName}
          </Text>

          <View style={styles.cardsGrid}>
            {hiddenCards.map((card) => {
              const char = CHARACTERS[card.character];
              const isProof =
                card.character === pendingChallenge.claimedCharacter;
              return (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.cardBtn,
                    isProof && styles.cardBtnProof,
                    { borderColor: char?.color + "80" },
                  ]}
                  onPress={() => handleRevealCard(card.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      isProof
                        ? [char?.color + "30", char?.color + "15"]
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
                        size={32}
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
                    {isProof && (
                      <View style={styles.proofBadge}>
                        <Text style={styles.proofBadgeText}>DOKAZ</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ILI</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Admit bluff */}
          <TouchableOpacity
            style={styles.admitBtn}
            onPress={handleAdmitBluff}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="flag-outline"
              size={20}
              color={COLORS.danger}
            />
            <Text style={styles.admitBtnText}>
              {t("intrigue.challenge.admit")}
            </Text>
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
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.danger,
    letterSpacing: 1,
  },

  challengeInfo: {
    backgroundColor: "#1a0428",
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(230,57,70,0.2)",
    gap: 10,
    alignItems: "center",
  },
  challengeText: {
    fontSize: SIZES.lg,
    textAlign: "center",
  },
  challengeName: {
    fontWeight: "900",
    color: COLORS.text,
    fontSize: SIZES.lg,
  },
  challengeTextNormal: {
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
  charClaimRow: {
    flexDirection: "row",
    gap: 8,
  },
  charChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  charChipText: {
    fontSize: SIZES.sm,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  proveLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },

  privateNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(207,150,255,0.06)",
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.12)",
  },
  privateNoteText: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
    fontStyle: "italic",
  },

  cardsLabel: {
    fontSize: SIZES.lg,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 6,
  },
  cardsHint: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
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
  cardBtnProof: {
    shadowColor: COLORS.tertiary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardBtnGrad: {
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  cardIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCharName: {
    fontSize: SIZES.md,
    fontWeight: "800",
    textAlign: "center",
  },
  proofBadge: {
    backgroundColor: "rgba(142,255,113,0.15)",
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(142,255,113,0.3)",
  },
  proofBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.tertiary,
    letterSpacing: 2,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(207,150,255,0.12)",
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 2,
  },

  admitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(230,57,70,0.3)",
    backgroundColor: "rgba(230,57,70,0.08)",
  },
  admitBtnText: {
    fontSize: SIZES.lg,
    fontWeight: "800",
    color: COLORS.danger,
    letterSpacing: 1,
  },
});
