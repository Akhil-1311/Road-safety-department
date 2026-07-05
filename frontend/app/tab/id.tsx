
Action: file_editor create /app/frontend/app/campaign/[id].tsx --file-text "import { View, Text, StyleSheet, ScrollView, Pressable } from \"react-native\";
import { SafeAreaView } from \"react-native-safe-area-context\";
import { Image } from \"expo-image\";
import { LinearGradient } from \"expo-linear-gradient\";
import { Ionicons } from \"@expo/vector-icons\";
import { useLocalSearchParams, useRouter } from \"expo-router\";
import { useEffect, useState } from \"react\";
import { colors, spacing, radius, font } from \"@/src/theme\";
import { api, Campaign } from \"@/src/api\";

export default function CampaignDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [c, setC] = useState<Campaign | null>(null);

  useEffect(() => {
    if (id) api.campaign(id).then(setC).catch(() => setC(null));
  }, [id]);

  if (!c) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <Text style={{ padding: spacing.lg, color: colors.onSurfaceTertiary }}>
          Loading…
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID=\"campaign-detail\">
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.hero}>
          <Image source={c.image_url} style={StyleSheet.absoluteFill} contentFit=\"cover\" />
          <LinearGradient
            colors={[\"rgba(0,0,0,0.3)\", \"transparent\", \"rgba(0,0,0,0.85)\"]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={[\"top\"]} style={{ padding: spacing.lg }}>
            <Pressable
              onPress={() => router.back()}
              testID=\"back-button\"
              style={styles.back}
            >
              <Ionicons name=\"chevron-back\" size={22} color=\"#fff\" />
            </Pressable>
          </SafeAreaView>
          <View style={styles.heroBody}>
            <View style={styles.cat}>
              <Text style={styles.catText}>{c.tag.toUpperCase()}</Text>
            </View>
            <Text style={styles.title}>{c.title}</Text>
            <Text style={styles.meta}>{c.subtitle}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.body}>{c.body}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 320, justifyContent: \"space-between\" },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: \"rgba(0,0,0,0.4)\",
    alignItems: \"center\",
    justifyContent: \"center\",
  },
  heroBody: { padding: spacing.lg },
  cat: {
    alignSelf: \"flex-start\",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    backgroundColor: \"rgba(245,158,11,0.9)\",
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  catText: { color: \"#fff\", fontSize: 10, fontWeight: \"500\", letterSpacing: 1 },
  title: { color: \"#fff\", fontSize: 28, fontWeight: \"500\", marginBottom: 4 },
  meta: { color: \"rgba(255,255,255,0.8)\", fontSize: font.base },
  content: { padding: spacing.lg },
  body: {
    fontSize: font.base,
    color: colors.onSurfaceSecondary,
    lineHeight: 24,
  },
});
"
Observation: Create successful: /app/frontend/app/campaign/[id].tsx