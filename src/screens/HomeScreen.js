import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  StatusBar,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES, RADIUS } from "../constants/theme";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { LANGUAGES } from "../i18n/translations";
import FlagIcon from "../components/FlagIcon";

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [langModal, setLangModal] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#0d0118", "#1b0424", "#0d0118"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        {/* ── Top App Bar ── */}
        <View style={styles.appBar}>
          <View style={styles.appBarLeft}>
            <MaterialCommunityIcons
              name="gamepad-variant"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.appBarTitle}>SQUAD GAMES</Text>
          </View>
          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setLangModal(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="web"
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.langPillText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Hero ── */}
          <View style={styles.hero}>
            <Text style={styles.heroLine1}>{t("home.hero_line1")}</Text>
            <Text style={styles.heroLine2}>{t("home.hero_line2")}</Text>
            <Text style={styles.heroSub}>{t("home.subtitle")}</Text>
          </View>

          {/* ── Featured: MAFIA ── */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Setup")}
            activeOpacity={0.88}
            style={styles.featuredCardWrap}
          >
            <LinearGradient
              colors={["#1d003a", "#2d0052", "#1a003a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featuredCard}
            >
              {/* Decorative skull */}
              <View style={styles.decoIconWrap} pointerEvents="none">
                <MaterialCommunityIcons
                  name="skull-outline"
                  size={110}
                  color="rgba(207,150,255,0.08)"
                />
              </View>

              {/* Trending badge */}
              <View style={styles.trendingBadge}>
                <Text style={styles.trendingText}>TRENDING</Text>
              </View>

              {/* Content */}
              <View style={styles.featuredContent}>
                <Text style={styles.featuredTitle}>MAFIA</Text>
                <Text style={styles.featuredDesc}>{t("home.mafia.desc")}</Text>
                <View style={styles.playBtnWrap}>
                  <LinearGradient
                    colors={["#a533ff", "#cf96ff"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.playBtnFeatured}
                  >
                    <Text style={styles.playBtnFeaturedText}>
                      {t("home.play_now")}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Game list ── */}

          {/* SPECTRUM */}
          <TouchableOpacity
            onPress={() => navigation.navigate("SpectrumSetup")}
            activeOpacity={0.88}
            style={[styles.gameCardWrap, styles.shadowGreen]}
          >
            <LinearGradient
              colors={["#062200", "#0f3800"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gameCard, styles.borderGreen]}
            >
              <View style={[styles.iconBox, styles.iconBoxGreen]}>
                <MaterialCommunityIcons
                  name="sine-wave"
                  size={28}
                  color={COLORS.tertiary}
                />
              </View>
              <View style={styles.gameCardText}>
                <Text style={styles.gameCardTitle}>SPECTRUM</Text>
                <Text style={styles.gameCardDesc}>
                  {t("home.spectrum.desc")}
                </Text>
              </View>
              <LinearGradient
                colors={["#2be800", "#8eff71"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playBtnSmall}
              >
                <Text style={[styles.playBtnSmallText, { color: "#062200" }]}>
                  {t("home.play")}
                </Text>
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>

          {/* ALIAS */}
          <TouchableOpacity
            onPress={() => navigation.navigate("AliasSetup")}
            activeOpacity={0.88}
            style={[styles.gameCardWrap, styles.shadowOrange]}
          >
            <LinearGradient
              colors={["#1e0a00", "#2e1400"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gameCard, styles.borderOrange]}
            >
              <View style={[styles.iconBox, styles.iconBoxOrange]}>
                <MaterialCommunityIcons
                  name="chat-outline"
                  size={28}
                  color={COLORS.secondary}
                />
              </View>
              <View style={styles.gameCardText}>
                <Text style={styles.gameCardTitle}>ALIAS</Text>
                <Text style={styles.gameCardDesc}>{t("home.alias.desc")}</Text>
              </View>
              <LinearGradient
                colors={["#c05500", "#fd9000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playBtnSmall}
              >
                <Text style={[styles.playBtnSmallText, { color: "#1e0a00" }]}>
                  {t("home.play")}
                </Text>
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>

          {/* INTRIGE */}
          <TouchableOpacity
            onPress={() => navigation.navigate("IntrigueSetup")}
            activeOpacity={0.88}
            style={[styles.gameCardWrap, styles.shadowGold]}
          >
            <LinearGradient
              colors={["#1a0800", "#2a1200"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gameCard, styles.borderGold]}
            >
              <View style={[styles.iconBox, styles.iconBoxGold]}>
                <MaterialCommunityIcons
                  name="chess-queen"
                  size={28}
                  color="#FFD700"
                />
              </View>
              <View style={styles.gameCardText}>
                <Text style={styles.gameCardTitle}>INTRIGE</Text>
                <Text style={styles.gameCardDesc}>
                  {t("home.intrigue.desc")}
                </Text>
              </View>
              <LinearGradient
                colors={["#8B0000", "#C0392B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playBtnSmall}
              >
                <Text style={[styles.playBtnSmallText, { color: "#FFD700" }]}>
                  {t("home.play")}
                </Text>
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>

          {/* IMPOSTER */}
          <TouchableOpacity
            onPress={() => navigation.navigate("ImposterSetup")}
            activeOpacity={0.88}
            style={[styles.gameCardWrap, styles.shadowPurple]}
          >
            <LinearGradient
              colors={["#22063a", "#2e0b46"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gameCard, styles.borderPurple]}
            >
              <View style={[styles.iconBox, styles.iconBoxPurple]}>
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={28}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.gameCardText}>
                <Text style={styles.gameCardTitle}>IMPOSTER</Text>
                <Text style={styles.gameCardDesc}>
                  {t("home.imposter.desc")}
                </Text>
              </View>
              <LinearGradient
                colors={["#a533ff", "#cf96ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playBtnSmall}
              >
                <Text style={[styles.playBtnSmallText, { color: "#2a0052" }]}>
                  {t("home.play")}
                </Text>
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* ── Language picker modal ── */}
        <Modal
          visible={langModal}
          transparent
          animationType="fade"
          onRequestClose={() => setLangModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setLangModal(false)}
          >
            <Pressable style={styles.modalBox} onPress={() => {}}>
              <Text style={styles.modalTitle}>{t("lang.select_title")}</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {LANGUAGES.map((lang) => {
                  const isSelected = lang.code === language;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.langRow,
                        isSelected && styles.langRowSelected,
                      ]}
                      onPress={() => {
                        setLanguage(lang.code);
                        setLangModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <FlagIcon countryCode={lang.countryCode} size={22} />
                      <Text
                        style={[
                          styles.langRowName,
                          isSelected && styles.langRowNameSelected,
                        ]}
                      >
                        {lang.name}
                      </Text>
                      {isSelected && (
                        <MaterialCommunityIcons
                          name="check"
                          size={18}
                          color={COLORS.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: "transparent" },

  // ── App Bar ──
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(88,28,135,0.3)",
  },
  appBarLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  appBarTitle: {
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
    color: COLORS.primary,
    letterSpacing: -0.5,
    textShadowColor: "rgba(207,150,255,0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(88,28,135,0.2)",
    borderWidth: 1,
    borderColor: "rgba(165,51,255,0.2)",
  },
  langPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 1.5,
  },

  scroll: { paddingHorizontal: 24 },

  // ── Hero ──
  hero: { marginTop: 36, marginBottom: 28 },
  heroLine1: {
    fontSize: 58,
    fontWeight: "900",
    fontStyle: "italic",
    color: COLORS.text,
    letterSpacing: -2,
    lineHeight: 56,
  },
  heroLine2: {
    fontSize: 58,
    fontWeight: "900",
    fontStyle: "italic",
    color: COLORS.primary,
    letterSpacing: -2,
    lineHeight: 60,
    marginBottom: 14,
    textShadowColor: "rgba(207,150,255,0.35)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  heroSub: {
    fontSize: SIZES.md,
    color: "rgba(240,209,255,0.7)",
    lineHeight: 22,
    maxWidth: 260,
  },

  // ── Featured card ──
  featuredCardWrap: {
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#a533ff",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(165,51,255,0.2)",
  },
  featuredCard: {
    padding: 28,
    minHeight: 290,
    justifyContent: "space-between",
  },
  decoIconWrap: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  trendingBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(142,255,113,0.1)",
    borderWidth: 1,
    borderColor: "rgba(142,255,113,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  trendingText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.tertiary,
    letterSpacing: 2.5,
  },
  featuredContent: { gap: 10 },
  featuredTitle: {
    fontSize: 46,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -1,
  },
  featuredDesc: {
    fontSize: SIZES.md,
    color: "rgba(240,209,255,0.7)",
    lineHeight: 20,
    maxWidth: "80%",
  },
  playBtnWrap: { alignSelf: "flex-start", marginTop: 6 },
  playBtnFeatured: {
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: RADIUS.full,
  },
  playBtnFeaturedText: {
    fontSize: SIZES.sm,
    fontWeight: "900",
    color: "#2a0052",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // ── Game list cards ──
  gameCardWrap: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 14,
  },
  gameCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderRadius: 24,
  },
  borderPurple: { borderColor: "rgba(165,51,255,0.2)" },
  borderOrange: { borderColor: "rgba(253,144,0,0.2)" },
  borderGreen: { borderColor: "rgba(142,255,113,0.2)" },
  borderGold: { borderColor: "rgba(255,215,0,0.2)" },

  shadowPurple: {
    shadowColor: "#a533ff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 6,
  },
  shadowGold: {
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  shadowOrange: {
    shadowColor: "#fd9000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  shadowGreen: {
    shadowColor: "#8eff71",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  iconBoxPurple: {
    backgroundColor: "rgba(165,51,255,0.1)",
    borderColor: "rgba(165,51,255,0.3)",
  },
  iconBoxOrange: {
    backgroundColor: "rgba(253,144,0,0.1)",
    borderColor: "rgba(253,144,0,0.3)",
  },
  iconBoxGreen: {
    backgroundColor: "rgba(142,255,113,0.1)",
    borderColor: "rgba(142,255,113,0.3)",
  },
  iconBoxGold: {
    backgroundColor: "rgba(255,215,0,0.1)",
    borderColor: "rgba(255,215,0,0.3)",
  },

  gameCardText: { flex: 1, gap: 4 },
  gameCardTitle: {
    fontSize: SIZES.lg,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  gameCardDesc: {
    fontSize: 12,
    color: "rgba(240,209,255,0.6)",
    lineHeight: 17,
  },

  playBtnSmall: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    flexShrink: 0,
  },
  playBtnSmallText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // ── Language modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(13,1,24,0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    backgroundColor: "#2a0b35",
    borderRadius: 24,
    padding: 22,
    width: "100%",
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "rgba(207,150,255,0.15)",
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: RADIUS.lg,
    marginBottom: 2,
  },
  langRowSelected: { backgroundColor: "rgba(207,150,255,0.1)" },
  langRowName: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  langRowNameSelected: { color: COLORS.text, fontWeight: "700" },
});
