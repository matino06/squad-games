import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useImposter } from "../../context/ImposterContext";
import { useTranslation } from "../../context/LanguageContext";
import { COLORS, SIZES, RADIUS, SHADOWS } from "../../constants/theme";

const IMPOSTER_COLOR = "#a855f7";

export default function ImposterPlayScreen({ navigation }) {
  const { state, dispatch } = useImposter();
  const { t } = useTranslation();
  const { players, wordPair, winner, eliminatedPlayer } = state;

  const [phase, setPhase] = useState("discussion");
  const [voteTarget, setVoteTarget] = useState(null);
  const [voteModal, setVoteModal] = useState(false);

  const votedPlayer =
    voteTarget !== null ? players.find((p) => p.id === voteTarget) : null;
  const eliminatedPlayerObj =
    eliminatedPlayer !== null
      ? players.find((p) => p.id === eliminatedPlayer)
      : null;

  const handleVoteSelect = (playerId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setVoteTarget(playerId);
    setVoteModal(true);
  };

  const handleVoteConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    dispatch({ type: "ELIMINATE_PLAYER", payload: voteTarget });
    setVoteModal(false);
    setPhase("result");
  };

  const handleNewGame = () => {
    dispatch({ type: "RESET_KEEP_SETTINGS" });
    navigation.replace("ImposterSetup");
  };

  const handleGoHome = () => {
    dispatch({ type: "RESET" });
    navigation.replace("Home");
  };

  const villageWon = winner === "village";

  const appBarSubLabel = () => {
    if (phase === "discussion") return t("imposter.play.discussion.title");
    if (phase === "voting") return t("imposter.play.voting.title");
    return villageWon
      ? t("imposter.play.village_wins")
      : t("imposter.play.imposter_wins");
  };

  return (
    <LinearGradient
      colors={["#0d0118", "#1b0424", "#0d0118"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── DISCUSSION ── */}
          {phase === "discussion" && (
            <View style={styles.section}>
              <View style={styles.infoBox}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <MaterialCommunityIcons
                    name="chat-outline"
                    size={18}
                    color="#8eff71"
                  />
                  <Text style={styles.infoTitle}>
                    {t("imposter.play.discussion.title")}
                  </Text>
                </View>
                <Text style={styles.infoText}>
                  {t("imposter.play.discussion.text")}
                </Text>
              </View>

              <Text style={styles.listLabel}>
                {t("imposter.play.players_label", { n: players.length })}
              </Text>
              {players.map((player) => (
                <View key={player.id} style={styles.playerRow}>
                  <View style={styles.playerAvatar}>
                    <Text style={styles.playerAvatarText}>
                      {(player.name || "?")[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.playerName}>{player.name}</Text>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => setPhase("voting")}
                activeOpacity={0.85}
                style={styles.primaryBtnWrap}
              >
                <LinearGradient
                  colors={["#a533ff", "#cf96ff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>
                    {t("imposter.play.btn_voting")}
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color="#480079"
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* ── VOTING ── */}
          {phase === "voting" && (
            <View style={styles.section}>
              <View style={styles.infoBox}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <MaterialCommunityIcons
                    name="vote-outline"
                    size={18}
                    color="#8eff71"
                  />
                  <Text style={styles.infoTitle}>
                    {t("imposter.play.voting.title")}
                  </Text>
                </View>
                <Text style={styles.infoText}>
                  {t("imposter.play.voting.text")}
                </Text>
              </View>

              <Text style={styles.listLabel}>
                {t("imposter.play.voting.select")}
              </Text>
              {players.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.voteBtn}
                  onPress={() => handleVoteSelect(player.id)}
                  activeOpacity={0.75}
                >
                  <View style={styles.playerAvatar}>
                    <Text style={styles.playerAvatarText}>
                      {(player.name || "?")[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.voteBtnName}>{player.name}</Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#8a6a92"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── RESULT ── */}
          {phase === "result" && eliminatedPlayerObj && (
            <View style={styles.section}>
              {/* Winner banner */}
              <LinearGradient
                colors={
                  villageWon ? ["#0a2e1a", "#0d0118"] : ["#1a0030", "#0d0118"]
                }
                style={[
                  styles.winnerBox,
                  {
                    borderWidth: 1,
                    borderColor: villageWon
                      ? "rgba(142,255,113,0.2)"
                      : "rgba(168,85,247,0.2)",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={villageWon ? "trophy-outline" : "skull-outline"}
                  size={64}
                  color={villageWon ? "#8eff71" : IMPOSTER_COLOR}
                  style={{ marginBottom: 12 }}
                />
                <Text
                  style={[
                    styles.winnerTitle,
                    { color: villageWon ? "#8eff71" : IMPOSTER_COLOR },
                  ]}
                >
                  {villageWon
                    ? t("imposter.play.village_wins")
                    : t("imposter.play.imposter_wins")}
                </Text>
                <Text style={styles.winnerSub}>
                  {villageWon
                    ? t("imposter.play.village_wins_sub")
                    : t("imposter.play.imposter_wins_sub")}
                </Text>
              </LinearGradient>

              {/* Eliminated player */}
              <View style={styles.eliminatedBox}>
                <Text style={styles.sectionLabel}>
                  {t("imposter.play.eliminated_label")}
                </Text>
                <Text style={styles.eliminatedName}>
                  {eliminatedPlayerObj.name}
                </Text>
                <View
                  style={[
                    styles.rolePill,
                    {
                      backgroundColor: eliminatedPlayerObj.isImposter
                        ? "rgba(168,85,247,0.15)"
                        : "rgba(142,255,113,0.12)",
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={
                        eliminatedPlayerObj.isImposter
                          ? "eye-outline"
                          : "check-circle"
                      }
                      size={16}
                      color={
                        eliminatedPlayerObj.isImposter
                          ? IMPOSTER_COLOR
                          : "#8eff71"
                      }
                    />
                    <Text
                      style={[
                        styles.rolePillText,
                        {
                          color: eliminatedPlayerObj.isImposter
                            ? IMPOSTER_COLOR
                            : "#8eff71",
                        },
                      ]}
                    >
                      {eliminatedPlayerObj.isImposter
                        ? "IMPOSTER"
                        : t("imposter.play.innocent_label")}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Word reveal */}
              <View style={styles.wordRevealBox}>
                <Text style={styles.sectionLabel}>
                  {t("imposter.play.secret_words_label")}
                </Text>
                <Text style={styles.secretWordBig}>{wordPair?.main}</Text>
              </View>

              {/* All players */}
              <View style={styles.allPlayersBox}>
                <Text style={styles.sectionLabel}>
                  {t("imposter.play.all_players_label")}
                </Text>
                {players.map((player) => (
                  <View
                    key={player.id}
                    style={[
                      styles.playerRevealRow,
                      player.isImposter && {
                        backgroundColor: "rgba(168,85,247,0.08)",
                        borderRadius: 12,
                        padding: 8,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.playerAvatar,
                        player.isImposter && { backgroundColor: "#2d0a4e" },
                      ]}
                    >
                      {player.isImposter ? (
                        <MaterialCommunityIcons
                          name="eye-outline"
                          size={18}
                          color={IMPOSTER_COLOR}
                        />
                      ) : (
                        <Text style={styles.playerAvatarText}>
                          {(player.name || "?")[0].toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.playerName,
                        player.isImposter && { color: IMPOSTER_COLOR },
                      ]}
                    >
                      {player.name}
                    </Text>
                    {player.isImposter && (
                      <Text style={styles.imposterBadge}>IMPOSTER</Text>
                    )}
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleNewGame}
                activeOpacity={0.85}
                style={styles.primaryBtnWrap}
              >
                <LinearGradient
                  colors={["#a533ff", "#cf96ff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>
                    {t("imposter.play.new_game")}
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color="#480079"
                  />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={handleGoHome}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryBtnText}>
                  {t("imposter.play.home")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Vote modal */}
        <Modal
          visible={voteModal}
          transparent
          animationType="slide"
          onRequestClose={() => setVoteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="scale-balance"
                  size={22}
                  color="#cf96ff"
                />
                <Text style={[styles.modalTitle, { marginBottom: 0 }]}>
                  {t("imposter.play.vote_modal.title")}
                </Text>
              </View>
              <Text style={styles.modalText}>
                {t("imposter.play.vote_modal.text")}
              </Text>
              {votedPlayer && (
                <Text style={styles.modalPlayerName}>{votedPlayer.name}</Text>
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setVoteModal(false)}
                >
                  <Text style={styles.modalCancelText}>
                    {t("imposter.play.vote_modal.cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtnWrap}
                  onPress={handleVoteConfirm}
                >
                  <LinearGradient
                    colors={["#a533ff", "#cf96ff"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalConfirmBtn}
                  >
                    <Text style={styles.modalConfirmText}>
                      {t("imposter.play.vote_modal.confirm")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: 16, paddingBottom: 40 },

  // App bar
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22062c",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  appBarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  appBarCenter: { flex: 1, alignItems: "center" },
  appBarTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#fbdbff",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  appBarSub: {
    fontSize: 11,
    color: "#8a6a92",
    fontWeight: "600",
    letterSpacing: 1,
    marginTop: 2,
  },

  section: { gap: 14 },

  // Info box
  infoBox: {
    backgroundColor: "#22062c",
    borderRadius: 14,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#cf96ff",
  },
  infoTitle: { fontSize: 15, color: "#fbdbff", fontWeight: "700" },
  infoText: { fontSize: 13, color: "#c39fca", lineHeight: 20 },

  // Section label
  listLabel: {
    fontSize: 10,
    color: "#8a6a92",
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: "700",
  },
  sectionLabel: {
    fontSize: 10,
    color: "#8a6a92",
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: "700",
  },

  // Player rows
  playerRow: {
    backgroundColor: "#22062c",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  playerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#3a1646",
    alignItems: "center",
    justifyContent: "center",
  },
  playerAvatarText: { color: "#fbdbff", fontWeight: "700", fontSize: 15 },
  playerName: { fontSize: 16, color: "#fbdbff", fontWeight: "600", flex: 1 },

  // Vote buttons
  voteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#22062c",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(90,61,98,0.2)",
  },
  voteBtnName: { flex: 1, fontSize: 16, color: "#fbdbff", fontWeight: "600" },

  // Primary button
  primaryBtnWrap: {
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#a533ff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
    marginTop: 4,
  },
  primaryBtn: {
    height: 60,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryBtnText: {
    color: "#480079",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // Secondary button
  secondaryBtn: {
    backgroundColor: "#22062c",
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(90,61,98,0.3)",
  },
  secondaryBtnText: { color: "#c39fca", fontSize: 15, fontWeight: "600" },

  // Winner box
  winnerBox: { borderRadius: 20, padding: 28, alignItems: "center" },
  winnerTitle: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
    textAlign: "center",
  },
  winnerSub: { fontSize: 13, color: "#c39fca", textAlign: "center" },

  // Eliminated box
  eliminatedBox: {
    backgroundColor: "#22062c",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  eliminatedName: { fontSize: 28, color: "#fbdbff", fontWeight: "900" },
  rolePill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999 },
  rolePillText: { fontSize: 15, fontWeight: "800" },

  // Word reveal
  wordRevealBox: {
    backgroundColor: "#22062c",
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  wordRow: { flexDirection: "row", gap: 10 },
  wordCard: {
    backgroundColor: "#22062c",
    borderRadius: 14,
    padding: 16,
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
  },
  wordCardLabel: {
    fontSize: 10,
    color: "#8a6a92",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
  },
  secretWordBig: {
    fontSize: 36,
    fontWeight: "900",
    color: "#8eff71",
    textAlign: "center",
    letterSpacing: 1,
    paddingVertical: 8,
  },
  wordCardWord: { fontSize: 22, fontWeight: "900" },
  wordCardCategoryBadge: {
    backgroundColor: "rgba(165,51,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.35)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "center",
  },

  // All players
  allPlayersBox: {
    backgroundColor: "#22062c",
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  playerRevealRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  playerWord: { fontSize: 12, color: "#8a6a92", marginTop: 2 },
  imposterBadge: {
    fontSize: 10,
    color: IMPOSTER_COLOR,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: IMPOSTER_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  // Vote modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(13,1,24,0.88)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#2a0b35",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "rgba(207,150,255,0.15)",
  },
  modalTitle: {
    fontSize: 20,
    color: "#fbdbff",
    fontWeight: "700",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 15,
    color: "#c39fca",
    textAlign: "center",
    marginBottom: 8,
  },
  modalPlayerName: {
    fontSize: 28,
    color: IMPOSTER_COLOR,
    fontWeight: "900",
    marginBottom: 20,
  },
  modalButtons: { flexDirection: "row", gap: 10, width: "100%" },
  modalCancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#3a1646",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: { color: "#c39fca", fontSize: 15, fontWeight: "600" },
  modalConfirmBtnWrap: { flex: 1, borderRadius: 999, overflow: "hidden" },
  modalConfirmBtn: {
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: { color: "#480079", fontSize: 15, fontWeight: "700" },
});
