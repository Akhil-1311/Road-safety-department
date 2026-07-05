
Action: file_editor create /app/frontend/app/(tabs)/learn.tsx --file-text "import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from \"react-native\";
import { SafeAreaView } from \"react-native-safe-area-context\";
import { Image } from \"expo-image\";
import { LinearGradient } from \"expo-linear-gradient\";
import { Ionicons } from \"@expo/vector-icons\";
import { useRouter } from \"expo-router\";
import { useEffect, useState } from \"react\";
import { colors, spacing, radius, font } from \"@/src/theme\";
import { api, Tip } from \"@/src/api\";

const CATEGORIES = [
  { id: \"all\", label: \"All\" },
  { id: \"driving\", label: \"Driving\" },
  { id: \"signals\", label: \"Signals\" },
  { id: \"pedestrian\", label: \"Pedestrian\" },
  { id: \"children\", label: \"Children\" },
];

export default function Learn() {
  const router = useRouter();
  const [tips, setTips] = useState<Tip[]>([]);
  const [active, setActive] = useState(\"all\");

  useEffect(() => {
    api.tips().then(setTips).catch(() => setTips([]));
  }, []);

  const filtered = active === \"all\" ? tips : tips.filter((t) => t.category === active);
  const featured = tips[0];
  const rest = filtered.filter((t) => (featured ? t.id !== featured.id : true));

  return (
    <SafeAreaView style={styles.safe} edges={[\"top\"]} testID=\"learn-screen\">
      <View style={styles.header}>
        <Text style={styles.title}>Learn</Text>
        <Text style={styles.subtitle}>Bite-sized tips, life-saving habits</Text>
      </View>

      <ScrollView
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Sticky chip row */}
        <View style={styles.chipsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {CATEGORIES.map((c) => {
              const on = active === c.id;
              return (
                <Pressable
                  key={c.id}
                  testID={`chip-${c.id}`}
                  onPress={() => setActive(c.id)}
                  style={[styles.chip, on && styles.chipActive]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextActive]}>
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Featured (only when 'all') */}
        {active === \"all\" && featured && (
          <Pressable
            testID={`tip-featured-${featured.id}`}
            style={styles.featured}
            onPress={() => router.push(`/tip/${featured.id}`)}
          >
            <Image source={featured.image_url} style={StyleSheet.absoluteFill} contentFit=\"cover\" />
            <LinearGradient
              colors={[\"transparent\", \"rgba(0,0,0,0.85)\"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>FEATURED</Text>
            </View>
            <View style={styles.featuredBody}>
              <Text style={styles.featuredTitle}>{featured.title}</Text>
              <Text style={styles.featuredMeta}>
                {featured.read_minutes} min read · {featured.category}
              </Text>
            </View>
          </Pressable>
        )}

        {/* Tip list */}
        <View style={styles.list}>
          {rest.map((t) => (
            <Pressable
              key={t.id}
              testID={`tip-${t.id}`}
              style={styles.tipRow}
              onPress={() => router.push(`/tip/${t.id}`)}
            >
              <Image source={t.image_url} style={styles.tipImage} contentFit=\"cover\" />
              <View style={styles.tipBody}>
                <View style={styles.tipCat}>
                  <Ionicons name={t.icon as never} size={12} color={colors.brandPrimary} />
                  <Text style={styles.tipCatText}>{t.category}</Text>
                </View>
                <Text style={styles.tipTitle} numberOfLines={2}>
                  {t.title}
                </Text>
                <Text style={styles.tipMeta}>{t.read_minutes} min read</Text>
              </View>
            </Pressable>
          ))}
          {rest.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name=\"book-outline\" size={40} color={colors.onSurfaceTertiary} />
              <Text style={styles.emptyText}>No tips in this category yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: { fontSize: font.xxl, fontWeight: \"500\", color: colors.onSurface },
  subtitle: { fontSize: font.base, color: colors.onSurfaceTertiary, marginTop: 2 },
  chipsWrap: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    height: 56,
    justifyContent: \"center\",
  },
  chipsRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: \"center\",
  },
  chip: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: \"center\",
    justifyContent: \"center\",
    flexShrink: 0,
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  chipText: { fontSize: font.base, color: colors.onSurfaceSecondary },
  chipTextActive: { color: \"#fff\", fontWeight: \"500\" },
  featured: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    height: 200,
    borderRadius: radius.lg,
    overflow: \"hidden\",
    justifyContent: \"flex-end\",
  },
  featuredBadge: {
    position: \"absolute\",
    top: spacing.md,
    left: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: \"rgba(245,158,11,0.95)\",
  },
  featuredBadgeText: { color: \"#fff\", fontSize: 10, fontWeight: \"500\", letterSpacing: 1 },
  featuredBody: { padding: spacing.lg },
  featuredTitle: { color: \"#fff\", fontSize: font.xl, fontWeight: \"500\", marginBottom: 4 },
  featuredMeta: { color: \"rgba(255,255,255,0.8)\", fontSize: font.sm },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md },
  tipRow: {
    flexDirection: \"row\",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
  },
  tipImage: { width: 80, height: 80, borderRadius: radius.sm },
  tipBody: { flex: 1, justifyContent: \"space-between\", paddingVertical: 2 },
  tipCat: { flexDirection: \"row\", alignItems: \"center\", gap: 4 },
  tipCatText: {
    fontSize: 11,
    color: colors.brandPrimary,
    fontWeight: \"500\",
    textTransform: \"capitalize\",
  },
  tipTitle: { fontSize: font.base, fontWeight: \"500\", color: colors.onSurface },
  tipMeta: { fontSize: font.sm, color: colors.onSurfaceTertiary },
  empty: { alignItems: \"center\", paddingVertical: spacing.xxl, gap: spacing.md },
  emptyText: { color: colors.onSurfaceTertiary, fontSize: font.base },
});
"
Observation: Create successful: /app/frontend/app/(tabs)/learn.tsx