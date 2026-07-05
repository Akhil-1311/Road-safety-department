
Action: file_editor create /app/frontend/app/(tabs)/index.tsx --file-text "import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from \"react-native\";
import { SafeAreaView } from \"react-native-safe-area-context\";
import { Image } from \"expo-image\";
import { LinearGradient } from \"expo-linear-gradient\";
import { Ionicons } from \"@expo/vector-icons\";
import { useRouter } from \"expo-router\";
import { useCallback, useEffect, useState } from \"react\";
import { colors, spacing, radius, font } from \"@/src/theme\";
import { api, Campaign } from \"@/src/api\";

export default function Home() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, in_progress: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, s] = await Promise.all([api.campaigns(), api.stats()]);
      setCampaigns(c);
      setStats(s);
    } catch (e) {
      console.warn(\"home load\", e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={[\"top\"]} testID=\"home-screen\">
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.appTitle}>Safe Roads</Text>
          </View>
          <Pressable
            testID=\"home-profile-button\"
            style={styles.avatar}
            onPress={() => router.push(\"/(tabs)/help\")}
          >
            <Ionicons name=\"person\" size={20} color={colors.brandPrimary} />
          </Pressable>
        </View>

        {/* Hero — Report a Hazard */}
        <Pressable
          testID=\"home-report-hero\"
          style={styles.hero}
          onPress={() => router.push(\"/(tabs)/report\")}
        >
          <LinearGradient
            colors={[colors.brandPrimary, \"#0F2547\"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Quick action</Text>
            </View>
            <Text style={styles.heroTitle}>Report a road hazard</Text>
            <Text style={styles.heroSubtitle}>
              Potholes, broken signals, debris — help make roads safer.
            </Text>
            <View style={styles.heroCTA}>
              <Text style={styles.heroCTAText}>Start report</Text>
              <Ionicons name=\"arrow-forward\" size={16} color={colors.brandPrimary} />
            </View>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name=\"warning\" size={72} color=\"rgba(245,158,11,0.9)\" />
          </View>
        </Pressable>

        {/* Stats strip */}
        <View style={styles.statsRow}>
          <View style={styles.statCard} testID=\"stat-total\">
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statCard} testID=\"stat-inprogress\">
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {stats.in_progress}
            </Text>
            <Text style={styles.statLabel}>In progress</Text>
          </View>
          <View style={styles.statCard} testID=\"stat-resolved\">
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {stats.resolved}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Mini map preview */}
        <Text style={styles.sectionTitle}>Nearby incidents</Text>
        <View style={styles.mapCard} testID=\"home-map-preview\">
          <Image
            source=\"https://images.pexels.com/photos/8640996/pexels-photo-8640996.jpeg?auto=compress&cs=tinysrgb&w=940\"
            style={StyleSheet.absoluteFill}
            contentFit=\"cover\"
          />
          <LinearGradient
            colors={[\"transparent\", \"rgba(26,54,93,0.85)\"]}
            style={StyleSheet.absoluteFill}
          />
          {/* Pins */}
          <View style={[styles.pin, { top: \"30%\", left: \"20%\" }]}>
            <Ionicons name=\"location\" size={22} color={colors.error} />
          </View>
          <View style={[styles.pin, { top: \"55%\", left: \"60%\" }]}>
            <Ionicons name=\"location\" size={22} color={colors.warning} />
          </View>
          <View style={[styles.pin, { top: \"40%\", left: \"78%\" }]}>
            <Ionicons name=\"location\" size={22} color={colors.error} />
          </View>
          <View style={styles.mapFooter}>
            <View>
              <Text style={styles.mapTitle}>3 open reports near you</Text>
              <Text style={styles.mapSubtitle}>Within a 5 km radius</Text>
            </View>
            <Ionicons name=\"chevron-forward\" size={20} color=\"#fff\" />
          </View>
        </View>

        {/* Campaigns */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Latest campaigns</Text>
          <Text style={styles.sectionLink}>See all</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.campaignRow}
        >
          {campaigns.map((c) => (
            <Pressable
              key={c.id}
              testID={`campaign-card-${c.id}`}
              style={styles.campaignCard}
              onPress={() => router.push(`/campaign/${c.id}`)}
            >
              <Image source={c.image_url} style={styles.campaignImage} contentFit=\"cover\" />
              <LinearGradient
                colors={[\"transparent\", \"rgba(0,0,0,0.75)\"]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.campaignBadge}>
                <Text style={styles.campaignBadgeText}>{c.tag}</Text>
              </View>
              <View style={styles.campaignBody}>
                <Text style={styles.campaignTitle} numberOfLines={2}>
                  {c.title}
                </Text>
                <Text style={styles.campaignSubtitle} numberOfLines={1}>
                  {c.subtitle}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingBottom: 100 },
  header: {
    flexDirection: \"row\",
    alignItems: \"center\",
    justifyContent: \"space-between\",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: { color: colors.onSurfaceTertiary, fontSize: font.base },
  appTitle: { color: colors.onSurface, fontSize: font.xxl, fontWeight: \"500\" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    alignItems: \"center\",
    justifyContent: \"center\",
  },
  hero: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: \"hidden\",
    padding: spacing.xl,
    minHeight: 168,
    justifyContent: \"flex-end\",
  },
  heroContent: { zIndex: 2 },
  heroBadge: {
    alignSelf: \"flex-start\",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    backgroundColor: \"rgba(245,158,11,0.2)\",
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  heroBadgeText: {
    color: colors.brandSecondary,
    fontSize: 11,
    fontWeight: \"500\",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: \"#fff\",
    fontSize: font.xxl,
    fontWeight: \"500\",
    marginBottom: 6,
  },
  heroSubtitle: {
    color: \"rgba(255,255,255,0.75)\",
    fontSize: font.base,
    marginBottom: spacing.lg,
    maxWidth: \"78%\",
  },
  heroCTA: {
    alignSelf: \"flex-start\",
    flexDirection: \"row\",
    alignItems: \"center\",
    gap: 6,
    backgroundColor: \"#fff\",
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  heroCTAText: { color: colors.brandPrimary, fontWeight: \"500\", fontSize: font.base },
  heroIcon: {
    position: \"absolute\",
    right: -8,
    top: 8,
    opacity: 0.55,
  },
  statsRow: {
    flexDirection: \"row\",
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: \"center\",
  },
  statNumber: { fontSize: font.xl, fontWeight: \"500\", color: colors.brandPrimary },
  statLabel: { fontSize: 11, color: colors.onSurfaceTertiary, marginTop: 2 },
  sectionTitle: {
    fontSize: font.lg,
    fontWeight: \"500\",
    color: colors.onSurface,
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
  },
  sectionRow: {
    flexDirection: \"row\",
    alignItems: \"center\",
    justifyContent: \"space-between\",
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
  },
  sectionLink: {
    fontSize: font.base,
    color: colors.brandPrimary,
    marginTop: spacing.xl,
  },
  mapCard: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    height: 180,
    borderRadius: radius.lg,
    overflow: \"hidden\",
  },
  pin: { position: \"absolute\" },
  mapFooter: {
    position: \"absolute\",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    flexDirection: \"row\",
    alignItems: \"center\",
    justifyContent: \"space-between\",
  },
  mapTitle: { color: \"#fff\", fontSize: font.lg, fontWeight: \"500\" },
  mapSubtitle: { color: \"rgba(255,255,255,0.75)\", fontSize: font.sm, marginTop: 2 },
  campaignRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  campaignCard: {
    width: 260,
    height: 180,
    borderRadius: radius.lg,
    overflow: \"hidden\",
    marginTop: spacing.md,
  },
  campaignImage: { width: \"100%\", height: \"100%\" },
  campaignBadge: {
    position: \"absolute\",
    top: spacing.md,
    left: spacing.md,
    backgroundColor: \"rgba(245,158,11,0.95)\",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  campaignBadgeText: { color: \"#fff\", fontSize: 11, fontWeight: \"500\" },
  campaignBody: { position: \"absolute\", left: spacing.md, right: spacing.md, bottom: spacing.md },
  campaignTitle: { color: \"#fff\", fontSize: font.lg, fontWeight: \"500\" },
  campaignSubtitle: {
    color: \"rgba(255,255,255,0.8)\",
    fontSize: font.sm,
    marginTop: 2,
  },
});
"
Observation: Create successful: /app/frontend/app/(tabs)/index.tsx