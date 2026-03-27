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
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGame } from "../../context/GameContext";
import { useTranslation } from "../../context/LanguageContext";
import { COLORS, SIZES, RADIUS } from "../../constants/theme";

export default function DayPhaseScreen({ navigation }) {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const { players, killedLastNight, silencedPlayer, round, winner } = state;

  const [showPhase, setShowPhase] = useState("morning");

  // ── Voting state ──
  const [votes, setVotes] = useState([]);           // [{ voterId, targetId }] targetId=null → skip
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const [votingDone, setVotingDone] = useState(false);

  const insets = useSafeAreaInsets();

  const killedPlayer =
    killedLastNight !== null
      ? players.find((p) => p.id === killedLastNight)
      : null;
  const silencedPlayerObj =
    silencedPlayer !== null
      ? players.find((p) => p.id === silencedPlayer)
      : null;
  const alivePlayers = players.filter((p) => p.isAlive);

  React.useEffect(() => {
    if (winner) navigation.replace("Result");
  }, [winner]);

  const handleStartNight = () => {
    dispatch({ type: "START_NEW_NIGHT" });
    navigation.replace("NightPhase");
  };

  // ── Voting helpers ──
  const currentVoter = alivePlayers[currentVoterIdx] ?? null;

  const castVote = (targetId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newVotes = [...votes, { voterId: currentVoter.id, targetId }];
    if (currentVoterIdx + 1 >= alivePlayers.length) {
      setVotes(newVotes);
      setVotingDone(true);
    } else {
      setVotes(newVotes);
      setCurrentVoterIdx((p) => p + 1);
    }
  };

  const computeResult = () => {
    const counts = {};
    votes.forEach(({ targetId }) => {
      const key = targetId ?? "skip";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    const maxVotes = Math.max(...Object.values(counts));
    const leaders = Object.entries(counts).filter(([, c]) => c === maxVotes);
    if (leaders.length > 1) return { type: "tie" };
    const [leadKey] = leaders[0];
    if (leadKey === "skip") return { type: "skip_wins" };
    return { type: "eliminate", targetId: Number(leadKey), voteCount: maxVotes };
  };

  const handleApplyResult = () => {
    const result = computeResult();
    if (result.type === "eliminate") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      dispatch({ type: "ELIMINATE_PLAYER", payload: result.targetId });
      // useEffect will catch winner; if no winner, go to night
      if (!state.winner) handleStartNight();
    } else {
      handleStartNight();
    }
  };

  const voteResult = votingDone ? computeResult() : null;

  return (
    <LinearGradient
      colors={["#0d0118", "#1b0424", "#0d0118"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingBottom:
                (showPhase === "morning" ? 180 : 40) + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── MORNING ── */}
          {showPhase === "morning" && (
            <View style={styles.morningSection}>
              {killedPlayer ? (
                /* ── Death announcement ── */
                <View style={styles.deathSection}>
                  {/* Skull with red glow */}
                  <View style={styles.skullWrap}>
                    <MaterialCommunityIcons
                      name="skull-outline"
                      size={52}
                      color="#ff6e84"
                    />
                  </View>

                  <Text style={styles.morningTitle}>
                    {t("day.morning.news_title")}
                  </Text>
                  <Text style={styles.morningSubtitle}>
                    {t("day.morning.killed")}
                  </Text>

                  {/* Big player name */}
                  <Text style={styles.killedNameBig}>{killedPlayer.name}</Text>
                </View>
              ) : (
                /* ── Peaceful night ── */
                <View style={styles.deathSection}>
                  <View style={styles.peaceIconWrap}>
                    <MaterialCommunityIcons
                      name="shield-check-outline"
                      size={52}
                      color={COLORS.tertiary}
                    />
                  </View>
                  <Text style={styles.morningTitle}>
                    {t("day.morning.peaceful_title")}
                  </Text>
                  <Text style={styles.morningSubtitle}>
                    {t("day.morning.peaceful_text")}
                  </Text>
                </View>
              )}

              {/* ── Silenced player glassmorphism card ── */}
              {silencedPlayerObj && (
                <View style={styles.silencedCard}>
                  {/* Purple accent glow in top-right */}
                  <View style={styles.silencedCardGlow} pointerEvents="none" />
                  <View style={styles.silencedCardInner}>
                    <View style={styles.silencedIconBox}>
                      <MaterialCommunityIcons
                        name="microphone-off"
                        size={32}
                        color="#c77dff"
                      />
                    </View>
                    <View style={styles.silencedCardText}>
                      <Text style={styles.silencedCardLabel}>
                        {t("day.silenced.title")}
                      </Text>
                      <Text style={styles.silencedCardName}>
                        {silencedPlayerObj.name}
                      </Text>
                      <Text style={styles.silencedCardNote}>
                        {t("day.silenced.note")}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* ── DISCUSSION ── */}
          {showPhase === "discussion" && (
            <View style={styles.section}>
              <View style={styles.infoBox}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 6,
                  }}
                >
                  <MaterialCommunityIcons
                    name="chat-outline"
                    size={18}
                    color={COLORS.text}
                  />
                  <Text style={[styles.infoTitle, { marginBottom: 0 }]}>
                    {t("day.discussion.title")}
                  </Text>
                </View>
                <Text style={styles.infoText}>{t("day.discussion.text")}</Text>
              </View>

              <Text style={styles.listLabel}>
                {t("day.players_alive", { n: alivePlayers.length })}
              </Text>
              {alivePlayers.map((player) => {
                const isSilenced = silencedPlayerObj?.id === player.id;
                return (
                  <View
                    key={player.id}
                    style={[
                      styles.alivePlayerRow,
                      isSilenced && styles.alivePlayerRowSilenced,
                    ]}
                  >
                    <View
                      style={[
                        styles.playerAvatar,
                        isSilenced && styles.playerAvatarSilenced,
                      ]}
                    >
                      {isSilenced ? (
                        <MaterialCommunityIcons
                          name="microphone-off"
                          size={18}
                          color="#c77dff"
                        />
                      ) : (
                        <Text style={styles.playerAvatarText}>
                          {(player.name || "?")[0].toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.alivePlayerName,
                        isSilenced && styles.alivePlayerNameSilenced,
                      ]}
                    >
                      {player.name}
                    </Text>
                    {isSilenced && (
                      <Text style={styles.silencedTag}>
                        {t("day.silenced.tag")}
                      </Text>
                    )}
                  </View>
                );
              })}

              <TouchableOpacity
                onPress={() => setShowPhase("voting")}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#a533ff", "#cf96ff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>
                    {t("day.btn.voting")}
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
          {showPhase === "voting" && !votingDone && currentVoter && (
            <View style={styles.section}>
              {/* Header */}
              <View style={styles.voterHeader}>
                <Text style={styles.voterCounter}>
                  {t("day.voting.player_n_of_m")
                    .replace("{{n}}", currentVoterIdx + 1)
                    .replace("{{m}}", alivePlayers.length)}
                </Text>
                <Text style={styles.voterName}>{currentVoter.name}</Text>
                <Text style={styles.voterPrompt}>{t("day.voting.select")}</Text>
              </View>

              {/* Vote targets — everyone except current voter */}
              {alivePlayers
                .filter((p) => p.id !== currentVoter.id)
                .map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={styles.voteBtn}
                    onPress={() => castVote(player.id)}
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
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                ))}

              {/* Skip button */}
              <TouchableOpacity
                style={styles.skipVoteBtn}
                onPress={() => castVote(null)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="arrow-right-circle-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.skipVoteBtnText}>{t("day.voting.skip")}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── VOTE RESULT ── */}
          {showPhase === "voting" && votingDone && voteResult && (
            <View style={styles.section}>
              <Text style={styles.resultTitle}>{t("day.voting.result_title")}</Text>

              {/* Tally per player */}
              {alivePlayers.map((player) => {
                const count = votes.filter((v) => v.targetId === player.id).length;
                const isTarget = voteResult.type === "eliminate" && voteResult.targetId === player.id;
                return (
                  <View
                    key={player.id}
                    style={[styles.tallyRow, isTarget && styles.tallyRowTarget]}
                  >
                    <View style={[styles.playerAvatar, isTarget && styles.playerAvatarTarget]}>
                      <Text style={styles.playerAvatarText}>
                        {(player.name || "?")[0].toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.tallyName, isTarget && styles.tallyNameTarget]}>
                      {player.name}
                    </Text>
                    <Text style={[styles.tallyCount, isTarget && styles.tallyCountTarget]}>
                      {count} {t("day.voting.votes")}
                    </Text>
                    {isTarget && (
                      <MaterialCommunityIcons name="skull-outline" size={18} color={COLORS.danger} />
                    )}
                  </View>
                );
              })}

              {/* Skip count */}
              {(() => {
                const skipCount = votes.filter((v) => v.targetId === null).length;
                return skipCount > 0 ? (
                  <View style={styles.tallyRow}>
                    <View style={[styles.playerAvatar, { backgroundColor: "#2a2a2a" }]}>
                      <MaterialCommunityIcons name="arrow-right-circle-outline" size={18} color={COLORS.textMuted} />
                    </View>
                    <Text style={styles.tallyName}>{t("day.voting.skip")}</Text>
                    <Text style={styles.tallyCount}>{skipCount} {t("day.voting.votes")}</Text>
                  </View>
                ) : null;
              })()}

              {/* Result banner */}
              <View style={[
                styles.resultBanner,
                voteResult.type === "eliminate" ? styles.resultBannerEliminate : styles.resultBannerSkip
              ]}>
                <Text style={[
                  styles.resultBannerText,
                  voteResult.type === "eliminate" ? styles.resultBannerTextEliminate : styles.resultBannerTextSkip
                ]}>
                  {voteResult.type === "eliminate"
                    ? t("day.voting.result_eliminated").replace("{{name}}", players.find(p => p.id === voteResult.targetId)?.name ?? "")
                    : voteResult.type === "tie"
                    ? t("day.voting.result_tie")
                    : t("day.voting.result_skip_wins")}
                </Text>
              </View>

              <TouchableOpacity onPress={handleApplyResult} activeOpacity={0.85}>
                <LinearGradient
                  colors={["#a533ff", "#cf96ff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>{t("day.voting.proceed")}</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#480079" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* ── Floating footer (morning phase only) ── */}
        {showPhase === "morning" && (
          <View
            style={[
              styles.footer,
              {
                bottom: 0,
                paddingBottom: insets.bottom + 16,
              },
            ]}
          >
            <LinearGradient
              colors={["transparent", "rgba(13,1,24,0.9)", "#0d0118"]}
              locations={[0, 0.4, 1]}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowPhase("discussion");
              }}
              activeOpacity={0.85}
              style={styles.footerBtnWrap}
            >
              <LinearGradient
                colors={["#a533ff", "#cf96ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.footerBtn}
              >
                <Text style={styles.footerBtnText}>
                  {t("day.btn.discussion")}
                </Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={22}
                  color="#480079"
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: "transparent" },
  scroll: { paddingHorizontal: 24, paddingTop: 48 },

  // ── Morning section ──
  morningSection: { gap: 24 },

  deathSection: { alignItems: "center", gap: 14 },

  // Skull icon with red glow
  skullWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#3a1646",
    borderWidth: 1,
    borderColor: "rgba(255,110,132,0.2)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff6e84",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  peaceIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#0f3800",
    borderWidth: 1,
    borderColor: "rgba(142,255,113,0.2)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8eff71",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },

  morningTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  morningSubtitle: {
    fontSize: SIZES.md,
    color: "rgba(240,209,255,0.7)",
    textAlign: "center",
    lineHeight: 22,
  },

  // Big killed name
  killedNameBig: {
    fontSize: 58,
    fontWeight: "900",
    letterSpacing: -2,
    color: COLORS.text,
    textAlign: "center",
    textShadowColor: "rgba(207,150,255,0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },

  // Role pill — dark red
  rolePillDark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#370617",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(230,57,70,0.3)",
  },
  rolePillDarkText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.5,
    color: "#e63946",
    textTransform: "uppercase",
  },

  // ── Silenced card ──
  silencedCard: {
    backgroundColor: "rgba(58,22,70,0.5)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(90,61,98,0.15)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  silencedCardGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    backgroundColor: "rgba(199,125,255,0.08)",
    borderRadius: 60,
  },
  silencedCardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    padding: 24,
  },
  silencedIconBox: {
    width: 64,
    height: 64,
    backgroundColor: "#000",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(90,61,98,0.25)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  silencedCardText: { flex: 1, gap: 3 },
  silencedCardLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: "rgba(199,125,255,0.7)",
    textTransform: "uppercase",
  },
  silencedCardName: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  silencedCardNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  footerBtnWrap: {
    borderRadius: RADIUS.full,
    overflow: "hidden",
    shadowColor: "#a533ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
    borderRadius: RADIUS.full,
  },
  footerBtnText: {
    fontSize: SIZES.lg,
    fontWeight: "900",
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#480079",
  },

  // ── Discussion / Voting ──
  section: { gap: 14 },

  infoBox: { backgroundColor: "#22062c", borderRadius: 16, padding: 20 },
  infoTitle: {
    fontSize: SIZES.lg,
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: 6,
  },
  infoText: { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },

  listLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    marginBottom: 4,
  },

  alivePlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#22062c",
    padding: 14,
    borderRadius: 14,
  },
  alivePlayerRowSilenced: {
    borderWidth: 1,
    borderColor: "#c77dff",
    backgroundColor: "rgba(199,125,255,0.08)",
  },
  playerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#3a1646",
    alignItems: "center",
    justifyContent: "center",
  },
  playerAvatarSilenced: { backgroundColor: "#3d0066" },
  playerAvatarText: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: SIZES.md,
  },
  alivePlayerName: {
    fontSize: SIZES.lg,
    color: COLORS.text,
    fontWeight: "600",
    flex: 1,
  },
  alivePlayerNameSilenced: { color: "#c77dff" },
  silencedTag: {
    fontSize: SIZES.xs,
    color: "#c77dff",
    fontWeight: "700",
    letterSpacing: 0.5,
    borderWidth: 1,
    borderColor: "#c77dff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },

  voteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#22062c",
    padding: 14,
    borderRadius: 14,
  },
  voteBtnName: {
    flex: 1,
    fontSize: SIZES.lg,
    color: COLORS.text,
    fontWeight: "600",
  },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  primaryBtnText: {
    color: "#480079",
    fontSize: SIZES.lg,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // ── Voter header ──
  voterHeader: {
    backgroundColor: "#22062c",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.1)",
  },
  voterCounter: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  voterName: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -1,
  },
  voterPrompt: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },

  // ── Skip vote button ──
  skipVoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    backgroundColor: "#22062c",
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.1)",
    marginTop: 4,
  },
  skipVoteBtnText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    fontWeight: "700",
    letterSpacing: 1,
  },

  // ── Tally rows ──
  resultTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 3,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 4,
  },
  tallyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#22062c",
    padding: 14,
    borderRadius: 14,
  },
  tallyRowTarget: {
    backgroundColor: "rgba(230,57,70,0.1)",
    borderWidth: 1,
    borderColor: "rgba(230,57,70,0.35)",
  },
  tallyName: {
    flex: 1,
    fontSize: SIZES.lg,
    color: COLORS.text,
    fontWeight: "600",
  },
  tallyNameTarget: { color: COLORS.danger, fontWeight: "800" },
  tallyCount: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  tallyCountTarget: { color: COLORS.danger },
  playerAvatarTarget: { backgroundColor: "#3a0a0a" },

  // ── Result banner ──
  resultBanner: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  resultBannerEliminate: {
    backgroundColor: "rgba(230,57,70,0.12)",
    borderWidth: 1,
    borderColor: "rgba(230,57,70,0.3)",
  },
  resultBannerSkip: {
    backgroundColor: "rgba(207,150,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.2)",
  },
  resultBannerText: {
    fontSize: SIZES.lg,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  resultBannerTextEliminate: { color: COLORS.danger },
  resultBannerTextSkip: { color: COLORS.primary },
});
