Now the Help screen (SOS + nearby + my reports), plus detail screens:
Action: file_editor create /app/frontend/app/(tabs)/help.tsx --file-text "import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from \"react-native\";
import { SafeAreaView } from \"react-native-safe-area-context\";
import { LinearGradient } from \"expo-linear-gradient\";
import { Ionicons } from \"@expo/vector-icons\";
import { useCallback, useEffect, useState } from \"react\";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from \"react-native-reanimated\";
import * as Haptics from \"expo-haptics\";
import { useFocusEffect } from \"expo-router\";
import { colors, spacing, radius, font } from \"@/src/theme\";
import {
  api,
  EmergencyContact,
  Facility,
  HazardReport,
  getDeviceId,
} from \"@/src/api\";

const TABS = [
  { id: \"nearby\", label: \"Nearby help\" },
  { id: \"reports\", label: \"My reports\" },
];

const FACILITY_META: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  hospital: { icon: \"medkit\", color: \"#DC2626\", label: \"Hospital\" },
  police: { icon: \"shield\", color: \"#1A365D\", label: \"Police\" },
  fuel: { icon: \"car\", color: \"#F59E0B\", label: \"Fuel\" },
};

const STATUS_META: Record<string, { color: string; label: string }> = {
  submitted: { color: colors.info, label: \"Submitted\" },
  reviewing: { color: colors.warning, label: \"Reviewing\" },
  in_progress: { color: colors.warning, label: \"In progress\" },
  resolved: { color: colors.success, label: \"Resolved\" },
};

export default function Help() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilityType, setFacilityType] = useState<string>(\"hospital\");
  const [tab, setTab] = useState(\"nearby\");
  const [reports, setReports] = useState<HazardReport[]>([]);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.15, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    api.contacts().then(setContacts).catch(() => setContacts([]));
  }, [pulse]);

  useEffect(() => {
    api.facilities(facilityType).then(setFacilities).catch(() => setFacilities([]));
  }, [facilityType]);

  const loadReports = useCallback(async () => {
    try {
      const id = await getDeviceId();
      const r = await api.reports(id);
      setReports(r);
    } catch {
      setReports([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports])
  );

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  const call = (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Linking.openURL(`tel:${num}`).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe} edges={[\"top\"]} testID=\"help-screen\">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* SOS hero */}
        <View style={styles.sosSection}>
          <LinearGradient
            colors={[\"#111827\", \"#1A365D\"]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.sosLabel}>EMERGENCY</Text>
          <Text style={styles.sosTitle}>Tap to call for help</Text>

          <View style={styles.sosWrap}>
            <Animated.View style={[styles.sosPulse, pulseStyle]} />
            <Pressable
              testID=\"sos-button\"
              style={styles.sosBtn}
              onPress={() => call(\"112\")}
            >
              <Text style={styles.sosBtnText}>SOS</Text>
              <Text style={styles.sosBtnSub}>112</Text>
            </Pressable>
          </View>

          {/* Quick dial chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dialsRow}
          >
            {contacts.map((c) => (
              <Pressable
                key={c.id}
                testID={`dial-${c.id}`}
                style={styles.dial}
                onPress={() => call(c.number)}
              >
                <View style={[styles.dialIcon, { backgroundColor: c.color }]}>
                  <Ionicons name={c.icon as never} size={18} color=\"#fff\" />
                </View>
                <Text style={styles.dialName}>{c.name}</Text>
                <Text style={styles.dialNum}>{c.number}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tabs */}
        <View style={styles.tabsWrap}>
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <Pressable
                key={t.id}
                testID={`help-tab-${t.id}`}
                onPress={() => setTab(t.id)}
                style={[styles.tab, on && styles.tabActive]}
              >
                <Text style={[styles.tabText, on && styles.tabTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === \"nearby\" ? (
          <>
            {/* Facility type chip row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.typeRow}
            >
              {([\"hospital\", \"police\", \"fuel\"] as const).map((ft) => {
                const on = facilityType === ft;
                const meta = FACILITY_META[ft];
                return (
                  <Pressable
                    key={ft}
                    testID={`ftype-${ft}`}
                    onPress={() => setFacilityType(ft)}
                    style={[styles.typeChip, on && styles.typeChipActive]}
                  >
                    <Ionicons
                      name={meta.icon}
                      size={14}
                      color={on ? \"#fff\" : meta.color}
                    />
                    <Text style={[styles.typeText, on && { color: \"#fff\" }]}>
                      {meta.label}s
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.list}>
              {facilities.map((f) => {
                const meta = FACILITY_META[f.type];
                return (
                  <View
                    key={f.id}
                    style={styles.facCard}
                    testID={`facility-${f.id}`}
                  >
                    <View
                      style={[
                        styles.facIcon,
                        { backgroundColor: `${meta.color}22` },
                      ]}
                    >
                      <Ionicons name={meta.icon} size={20} color={meta.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.facName}>{f.name}</Text>
                      <Text style={styles.facAddr} numberOfLines={1}>
                        {f.address}
                      </Text>
                      <Text style={styles.facDist}>{f.distance_km} km away</Text>
                    </View>
                    <Pressable
                      testID={`facility-call-${f.id}`}
                      onPress={() => call(f.phone)}
                      style={styles.facCall}
                    >
                      <Ionicons name=\"call\" size={18} color=\"#fff\" />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.list}>
            {reports.length === 0 && (
              <View style={styles.empty}>
                <Ionicons
                  name=\"document-text-outline\"
                  size={40}
                  color={colors.onSurfaceTertiary}
                />
                <Text style={styles.emptyText}>No reports yet</Text>
                <Text style={styles.emptySub}>
                  Submitted hazard reports will show here
                </Text>
              </View>
            )}
            {reports.map((r) => {
              const meta = STATUS_META[r.status] ?? STATUS_META.submitted;
              return (
                <View key={r.id} style={styles.reportCard} testID={`report-${r.id}`}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportCat}>
                      <Ionicons name=\"warning\" size={14} color={colors.warning} />
                      <Text style={styles.reportCatText}>
                        {r.category.toUpperCase()}
                      </Text>
                    </View>
                    <View
                      style={[styles.statusPill, { backgroundColor: `${meta.color}22` }]}
                    >
                      <View
                        style={[styles.statusDot, { backgroundColor: meta.color }]}
                      />
                      <Text style={[styles.statusText, { color: meta.color }]}>
                        {meta.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reportDesc} numberOfLines={2}>
                    {r.description}
                  </Text>
                  {!!r.address && (
                    <View style={styles.reportMeta}>
                      <Ionicons
                        name=\"location\"
                        size={12}
                        color={colors.onSurfaceTertiary}
                      />
                      <Text style={styles.reportMetaText} numberOfLines={1}>
                        {r.address}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.reportDate}>
                    {new Date(r.created_at).toLocaleString()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  sosSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    overflow: \"hidden\",
  },
  sosLabel: {
    color: colors.brandSecondary,
    fontSize: 11,
    fontWeight: \"500\",
    letterSpacing: 1.5,
  },
  sosTitle: {
    color: \"#fff\",
    fontSize: font.xxl,
    fontWeight: \"500\",
    marginTop: 4,
  },
  sosWrap: {
    alignItems: \"center\",
    justifyContent: \"center\",
    marginVertical: spacing.xl,
    height: 180,
  },
  sosPulse: {
    position: \"absolute\",
    width: 180,
    height: 180,
    borderRadius: radius.pill,
    backgroundColor: \"rgba(220,38,38,0.35)\",
  },
  sosBtn: {
    width: 140,
    height: 140,
    borderRadius: radius.pill,
    backgroundColor: colors.error,
    alignItems: \"center\",
    justifyContent: \"center\",
  },
  sosBtnText: { color: \"#fff\", fontSize: 44, fontWeight: \"500\", letterSpacing: 2 },
  sosBtnSub: { color: \"rgba(255,255,255,0.8)\", fontSize: font.base },
  dialsRow: { gap: spacing.md, paddingHorizontal: 2 },
  dial: {
    width: 100,
    padding: spacing.md,
    backgroundColor: \"rgba(255,255,255,0.08)\",
    borderRadius: radius.md,
    alignItems: \"center\",
    gap: 6,
  },
  dialIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: \"center\",
    justifyContent: \"center\",
  },
  dialName: { color: \"#fff\", fontSize: font.sm, fontWeight: \"500\" },
  dialNum: { color: \"rgba(255,255,255,0.7)\", fontSize: 11 },
  tabsWrap: {
    flexDirection: \"row\",
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.pill,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: \"center\",
  },
  tabActive: { backgroundColor: \"#fff\" },
  tabText: { fontSize: font.base, color: colors.onSurfaceSecondary },
  tabTextActive: { color: colors.brandPrimary, fontWeight: \"500\" },
  typeRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  typeChip: {
    flexDirection: \"row\",
    alignItems: \"center\",
    gap: 6,
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 0,
  },
  typeChipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  typeText: { fontSize: font.base, color: colors.onSurfaceSecondary },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  facCard: {
    flexDirection: \"row\",
    alignItems: \"center\",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
  },
  facIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: \"center\",
    justifyContent: \"center\",
  },
  facName: { fontSize: font.base, fontWeight: \"500\", color: colors.onSurface },
  facAddr: { fontSize: font.sm, color: colors.onSurfaceTertiary, marginTop: 2 },
  facDist: { fontSize: 11, color: colors.brandPrimary, marginTop: 2, fontWeight: \"500\" },
  facCall: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: \"center\",
    justifyContent: \"center\",
  },
  empty: {
    alignItems: \"center\",
    paddingVertical: spacing.xxxl,
    gap: 6,
  },
  emptyText: { fontSize: font.base, color: colors.onSurfaceSecondary, fontWeight: \"500\" },
  emptySub: { fontSize: font.sm, color: colors.onSurfaceTertiary },
  reportCard: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    gap: 6,
  },
  reportHeader: {
    flexDirection: \"row\",
    alignItems: \"center\",
    justifyContent: \"space-between\",
  },
  reportCat: { flexDirection: \"row\", alignItems: \"center\", gap: 4 },
  reportCatText: {
    fontSize: 11,
    fontWeight: \"500\",
    color: colors.onSurfaceSecondary,
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: \"row\",
    alignItems: \"center\",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: \"500\" },
  reportDesc: { fontSize: font.base, color: colors.onSurface, marginTop: 4 },
  reportMeta: { flexDirection: \"row\", alignItems: \"center\", gap: 4 },
  reportMetaText: { fontSize: font.sm, color: colors.onSurfaceTertiary, flex: 1 },
  reportDate: { fontSize: 11, color: colors.onSurfaceTertiary, marginTop: 2 },
});
"
Observation: Create successful: /app/frontend/app/(tabs)/help.tsx