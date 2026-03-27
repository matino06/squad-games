import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES, RADIUS } from "../../constants/theme";
import { useTranslation } from "../../context/LanguageContext";
import { useSpectrum } from "../../context/SpectrumContext";

// Per-rank medal colors  (gold / silver / bronze)
const MEDAL_BG = ["#fd9000", "#C0C0C0", "#CD7F32"];
const MEDAL_TEXT = ["#462400", "#000000", "#000000"];

// Per-rank row background
const ROW_BG = [
  "#3a1646", // rank 1 — surface-container-highest
  "#2a0b35", // rank 2 — surface-container
  "#2a0b35", // rank 3
  "rgba(42,11,53,0.5)", // rank 4+ — surface-container / 50%
];

// Per-rank score label color
const SCORE_COLOR = [
  "#fd9000", // rank 1 — secondary
  "#8a6a92", // rank 2 — outline
  "#8a6a92", // rank 3
  "#5a3d62", // rank 4+ — outline-variant
];

// Per-rank bar track background
const BAR_TRACK_BG = [
  "#2a0b35", // rank 1 — surface-container
  "#000000", // rank 2 — surface-container-lowest
  "#000000", // rank 3
  "#000000", // rank 4+
];

// Per-rank bar fill color
const BAR_COLOR = [
  "#fd9000", // gold
  "#C0C0C0", // silver
  "#CD7F32", // bronze
  "#5a3d62", // outline-variant
];

export default function SpectrumFinalScreen({ navigation }) {
  const { t } = useTranslation();
  const { state, dispatch } = useSpectrum();

  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0] ?? { name: "???", score: 0 };
  const isTie = sorted.length > 1 && sorted[0].score === sorted[1].score;
  const winnerName = isTie
    ? sorted
        .filter((p) => p.score === winner.score)
        .map((p) => p.name)
        .join(" & ")
    : winner.name;

  // Trophy bounce
  const bounceAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, []);

  const trophyScale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const handleNewGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: "RESET_KEEP_PLAYERS" });
    navigation.navigate("SpectrumSetup");
  };

  const handleHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch({ type: "RESET" });
    navigation.navigate("Home");
  };

  return (
    <LinearGradient
      colors={["#0d0118", "#1b0424", "#0d0118"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        {/* Ambient glow — stacked concentric circles, each ~2% opacity, accumulate to ~14% at center */}
        <View style={styles.ambientContainer} pointerEvents="none">
          {[380, 310, 245, 185, 130, 80, 40].map((size, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: "rgba(165,51,255,0.022)",
              }}
            />
          ))}
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* ══ Winner Hero ══ */}
          <View style={styles.heroSection}>
            {/* Trophy circle + native-shadow glow */}
            <Animated.View
              style={[
                styles.trophyWrap,
                { transform: [{ scale: trophyScale }] },
              ]}
            >
              {/* Outer glow — wide soft bloom */}
              <View style={styles.glowOuter} />
              {/* Inner glow — tighter, more intense */}
              <View style={styles.glowInner} />
              {/* Circle */}
              <View style={styles.trophyCircle}>
                <MaterialCommunityIcons
                  name="trophy"
                  size={60}
                  color="#fd9000"
                />
              </View>
            </Animated.View>

            {/* "POBJEDNIK" label */}
            <Text style={styles.winnerLabel}>
              {isTie ? t('spectrum.final.tie') : t('spectrum.final.winner')}
            </Text>

            {/* Winner name — italic uppercase neon */}
            <Text style={styles.winnerName}>{winnerName}</Text>

            {/* Score chip */}
            <View style={styles.scoreChip}>
              <MaterialCommunityIcons
                name="star-four-points"
                size={14}
                color="#fff6f1"
              />
              <Text style={styles.scoreChipText}>{winner.score} {t('spectrum.result.you_scored')}</Text>
            </View>
          </View>

          {/* ══ Leaderboard Card ══ */}
          <View style={styles.lbCard}>
            {/* Header */}
            <View style={styles.lbHeader}>
              <Text style={styles.lbTitle}>{t('spectrum.result.leaderboard')}</Text>
              <MaterialCommunityIcons name="podium" size={24} color="#5a3d62" />
            </View>

            {/* Rows */}
            {sorted.map((player, idx) => {
              const isTop3 = idx < 3;
              const clampedIdx = Math.min(idx, 3);
              const rowBg = ROW_BG[clampedIdx];
              const scoreColor = SCORE_COLOR[clampedIdx];
              const barTrack = BAR_TRACK_BG[clampedIdx];
              const barFill = BAR_COLOR[clampedIdx];
              const barPct = Math.max(
                8,
                (player.score / (winner.score || 1)) * 100,
              );

              return (
                <View
                  key={player.name + idx}
                  style={[styles.lbRow, { backgroundColor: rowBg }]}
                >
                  {/* Medal / rank number */}
                  {isTop3 ? (
                    <View
                      style={[
                        styles.medalCircle,
                        { backgroundColor: MEDAL_BG[idx] },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="medal"
                        size={20}
                        color={MEDAL_TEXT[idx]}
                      />
                    </View>
                  ) : (
                    <View style={styles.rankCircle}>
                      <Text style={styles.rankNum}>{idx + 1}</Text>
                    </View>
                  )}

                  {/* Right side: name + score row + bar */}
                  <View style={styles.lbInfo}>
                    <View style={styles.lbNameRow}>
                      <Text
                        style={[
                          styles.lbName,
                          idx >= 3 && { color: "#c39fca" },
                        ]}
                      >
                        {player.name}
                      </Text>
                      <Text style={[styles.lbScore, { color: scoreColor }]}>
                        {player.score}
                      </Text>
                    </View>
                    {/* Progress bar */}
                    <View
                      style={[styles.barTrack, { backgroundColor: barTrack }]}
                    >
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${barPct}%`,
                            backgroundColor: barFill,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}

            </View>

          {/* ══ Decorative Tiles Grid ══ */}
          <View style={styles.tilesRow}>
            <View style={styles.tileWrap}>
              <LinearGradient
                colors={["#6a0dff", "#a533ff", "#1b0424"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tile}
              >
                <View style={styles.tileGrid}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <View key={i} style={styles.tileGridLine} />
                  ))}
                </View>
              </LinearGradient>
              {/* Bottom fade */}
              <LinearGradient
                colors={["transparent", "#1b0424"]}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />
            </View>

            <View style={[styles.tileWrap, { marginTop: 16 }]}>
              <LinearGradient
                colors={["#fd9000", "#c25200", "#1b0424"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tile}
              >
                <View style={styles.tileCircles}>
                  <View style={styles.tileCircle} />
                  <View
                    style={[
                      styles.tileCircle,
                      { width: 24, height: 24, borderRadius: 12, opacity: 0.5 },
                    ]}
                  />
                </View>
              </LinearGradient>
              <LinearGradient
                colors={["transparent", "#1b0424"]}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />
            </View>
          </View>

          <View style={{ height: 200 }} />
        </ScrollView>

        {/* ══ Fixed footer ══ */}
        <LinearGradient
          colors={["transparent", "rgba(27,4,36,0.9)", "#1b0424"]}
          style={styles.footer}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            onPress={handleNewGame}
            activeOpacity={0.85}
            style={styles.newGameBtnWrap}
          >
            <LinearGradient
              colors={["#a533ff", "#cf96ff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.newGameBtn}
            >
              <Text style={styles.newGameBtnText}>{t('spectrum.final.new_game')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleHome}
            activeOpacity={0.8}
            style={styles.homeBtn}
          >
            <Text style={styles.homeBtnText}>{t('spectrum.final.home')}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    </LinearGradient>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 25,
  },

  // Ambient glow container — absolute, covers top of screen
  ambientContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 420,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Hero ──
  heroSection: {
    alignItems: "center",
    marginBottom: 16,
    gap: 4,
  },
  trophyWrap: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  // Outer glow: same shape as circle, near-invisible bg, huge shadow radius → smooth bloom
  glowOuter: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(253,144,0,0.01)",
    shadowColor: "#fd9000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 90,
  },
  // Inner glow: slightly visible, tighter radius → concentrated halo
  glowInner: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(253,144,0,0.06)",
    shadowColor: "#fd9000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 40,
  },
  trophyCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#3a1646",
    borderWidth: 4,
    borderColor: "#fd9000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#fd9000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  winnerLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fd9000",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  winnerName: {
    fontSize: 44,
    fontWeight: "900",
    fontStyle: "italic",
    color: "#cf96ff",
    letterSpacing: -1.5,
    textAlign: "center",
    textTransform: "uppercase",
    textShadowColor: "rgba(207,150,255,0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  scoreChip: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: "#8e4e00",
  },
  scoreChipText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff6f1",
    letterSpacing: 1.5,
  },

  // ── Leaderboard Card ──
  lbCard: {
    backgroundColor: "#22062c",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 12,
    overflow: "hidden",
  },
  lbHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  lbTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fbdbff",
    letterSpacing: 0.5,
  },

  // Row
  lbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  // Medal circle (top 3)
  medalCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // Rank number circle (4+)
  rankCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(90,61,98,0.3)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rankNum: {
    fontSize: 14,
    fontWeight: "900",
    color: "#c39fca",
  },

  // Info: name + score + bar
  lbInfo: { flex: 1, gap: 6 },
  lbNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  lbName: {
    fontSize: SIZES.md,
    fontWeight: "700",
    color: "#fbdbff",
  },
  lbScore: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },


  // ── Decorative tiles grid ──
  tilesRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 40,
  },
  tileWrap: {
    flex: 1,
    height: 128,
    borderRadius: 12,
    overflow: "hidden",
  },
  tile: {
    flex: 1,
    opacity: 0.45,
  },
  tileGrid: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "stretch",
    paddingVertical: 8,
  },
  tileGridLine: {
    width: 1,
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 4,
  },
  tileCircles: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  tileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 48,
    gap: 14,
  },
  newGameBtnWrap: {
    borderRadius: RADIUS.full,
    overflow: "hidden",
    shadowColor: "#a533ff",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 10,
  },
  newGameBtn: {
    paddingVertical: 20,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  newGameBtnText: {
    fontSize: SIZES.lg,
    fontWeight: "900",
    color: "#480079",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  homeBtn: {
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#421b4f",
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.2)",
  },
  homeBtnText: {
    fontSize: SIZES.sm,
    fontWeight: "700",
    color: "#cf96ff",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
});
