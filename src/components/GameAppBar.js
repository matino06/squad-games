import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES, RADIUS } from "../constants/theme";

export default function GameAppBar({ title, subtitle, onBack, onHelp }) {
  return (
    <View style={styles.appBar}>
      <TouchableOpacity
        style={styles.appBarBtn}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={COLORS.primary}
        />
      </TouchableOpacity>
      <View style={styles.appBarCenter}>
        <Text style={styles.appBarTitle}>{title}</Text>
        {subtitle ? <Text style={styles.appBarSub}>{subtitle}</Text> : null}
      </View>
      <TouchableOpacity
        style={styles.appBarBtn}
        onPress={onHelp}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="help-circle-outline"
          size={24}
          color={COLORS.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 8,
    backgroundColor: "#22062c",
  },
  appBarBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  appBarCenter: { alignItems: "center" },
  appBarTitle: {
    fontSize: SIZES.xl,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  appBarSub: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(207,150,255,0.6)",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 2,
  },
});
