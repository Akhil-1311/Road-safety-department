
Action: file_editor create /app/frontend/app/(tabs)/report.tsx --file-text "import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from \"react-native\";
import { SafeAreaView } from \"react-native-safe-area-context\";
import { Ionicons } from \"@expo/vector-icons\";
import { useRouter } from \"expo-router\";
import { useEffect, useState } from \"react\";
import { colors, spacing, radius, font } from \"@/src/theme\";
import { api, getDeviceId } from \"@/src/api\";

const CATEGORIES = [
  { id: \"pothole\", label: \"Pothole\", icon: \"alert-circle\" as const, color: \"#DC2626\" },
  { id: \"signal\", label: \"Broken signal\", icon: \"traffic-cone\" as const, color: \"#F59E0B\" },
  { id: \"accident\", label: \"Accident\", icon: \"car-sport\" as const, color: \"#DC2626\" },
  { id: \"debris\", label: \"Debris\", icon: \"trash\" as const, color: \"#7C3AED\" },
  { id: \"streetlight\", label: \"Streetlight\", icon: \"bulb\" as const, color: \"#F59E0B\" },
  { id: \"other\", label: \"Other\", icon: \"ellipsis-horizontal\" as const, color: \"#1A365D\" },
];

export default function Report() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState(\"\");
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState(\"\");
  const [address, setAddress] = useState(\"\");
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [photoAttached, setPhotoAttached] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    getDeviceId().then(setDeviceId);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const submit = async () => {
    if (!category) return showToast(\"Please pick a category\");
    if (description.trim().length < 5)
      return showToast(\"Please add a short description\");
    setSubmitting(true);
    try {
      await api.createReport({
        device_id: deviceId,
        category,
        description: description.trim(),
        address: address.trim(),
        latitude: locationCaptured ? 28.6139 : undefined,
        longitude: locationCaptured ? 77.209 : undefined,
      });
      showToast(\"Report submitted — thank you!\");
      setCategory(null);
      setDescription(\"\");
      setAddress(\"\");
      setLocationCaptured(false);
      setPhotoAttached(false);
      setTimeout(() => router.push(\"/(tabs)/help\"), 900);
    } catch {
      showToast(\"Failed to submit. Please try again.\");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={[\"top\"]} testID=\"report-screen\">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === \"ios\" ? \"padding\" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Report a hazard</Text>
          <Text style={styles.subtitle}>Help your community — takes 30 seconds</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps=\"handled\"
        >
          {/* Step 1: Category */}
          <Text style={styles.stepLabel}>1. What are you reporting?</Text>
          <View style={styles.grid}>
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <Pressable
                  key={c.id}
                  testID={`category-${c.id}`}
                  style={[styles.catCell, active && styles.catCellActive]}
                  onPress={() => setCategory(c.id)}
                >
                  <View
                    style={[
                      styles.catIcon,
                      { backgroundColor: active ? c.color : `${c.color}22` },
                    ]}
                  >
                    <Ionicons
                      name={c.icon as never}
                      size={22}
                      color={active ? \"#fff\" : c.color}
                    />
                  </View>
                  <Text
                    style={[styles.catLabel, active && { color: colors.brandPrimary }]}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Step 2: Photo */}
          <Text style={styles.stepLabel}>2. Photo evidence (optional)</Text>
          <Pressable
            testID=\"photo-button\"
            style={[styles.photoBox, photoAttached && styles.photoBoxActive]}
            onPress={() => setPhotoAttached((v) => !v)}
          >
            <Ionicons
              name={photoAttached ? \"checkmark-circle\" : \"camera\"}
              size={32}
              color={photoAttached ? colors.success : colors.brandPrimary}
            />
            <Text style={styles.photoText}>
              {photoAttached ? \"Photo attached\" : \"Attach photo\"}
            </Text>
            <Text style={styles.photoHint}>
              {photoAttached ? \"Tap to remove\" : \"Camera or gallery\"}
            </Text>
          </Pressable>

          {/* Step 3: Location */}
          <Text style={styles.stepLabel}>3. Where is it?</Text>
          <Pressable
            testID=\"location-button\"
            style={[styles.locationRow, locationCaptured && styles.locationActive]}
            onPress={() => setLocationCaptured((v) => !v)}
          >
            <Ionicons
              name={locationCaptured ? \"checkmark-circle\" : \"location\"}
              size={22}
              color={locationCaptured ? colors.success : colors.brandPrimary}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>
                {locationCaptured ? \"Location captured\" : \"Use current location\"}
              </Text>
              <Text style={styles.locationSub}>
                {locationCaptured
                  ? \"28.6139°N, 77.2090°E\"
                  : \"Tap to pin your location\"}
              </Text>
            </View>
            <Ionicons name=\"chevron-forward\" size={18} color={colors.onSurfaceTertiary} />
          </Pressable>
          <TextInput
            testID=\"address-input\"
            style={styles.input}
            placeholder=\"Or type the address / landmark\"
            placeholderTextColor={colors.onSurfaceTertiary}
            value={address}
            onChangeText={setAddress}
          />

          {/* Step 4: Description */}
          <Text style={styles.stepLabel}>4. Describe the hazard</Text>
          <TextInput
            testID=\"description-input\"
            style={[styles.input, styles.textarea]}
            placeholder=\"e.g. Large pothole in the middle lane, causing vehicles to swerve\"
            placeholderTextColor={colors.onSurfaceTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Sticky submit */}
        <View style={styles.stickyBar}>
          <Pressable
            testID=\"submit-button\"
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={submit}
            disabled={submitting}
          >
            <Text style={styles.submitText}>
              {submitting ? \"Submitting…\" : \"Submit report\"}
            </Text>
            {!submitting && (
              <Ionicons name=\"paper-plane\" size={16} color=\"#fff\" />
            )}
          </Pressable>
        </View>

        {toast && (
          <View style={styles.toast} testID=\"report-toast\">
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: { fontSize: font.xxl, fontWeight: \"500\", color: colors.onSurface },
  subtitle: {
    fontSize: font.base,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  stepLabel: {
    fontSize: font.base,
    fontWeight: \"500\",
    color: colors.onSurface,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  grid: { flexDirection: \"row\", flexWrap: \"wrap\", gap: spacing.md },
  catCell: {
    width: \"31%\",
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    alignItems: \"center\",
    justifyContent: \"center\",
    borderWidth: 2,
    borderColor: \"transparent\",
  },
  catCellActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandTertiary,
  },
  catIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: \"center\",
    justifyContent: \"center\",
    marginBottom: spacing.sm,
  },
  catLabel: { fontSize: 12, color: colors.onSurfaceSecondary, textAlign: \"center\" },
  photoBox: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.xl,
    alignItems: \"center\",
    justifyContent: \"center\",
    borderWidth: 2,
    borderColor: \"transparent\",
    borderStyle: \"dashed\",
  },
  photoBoxActive: { borderColor: colors.success, backgroundColor: \"#F0FDF4\" },
  photoText: {
    fontSize: font.base,
    fontWeight: \"500\",
    color: colors.onSurface,
    marginTop: spacing.sm,
  },
  photoHint: { fontSize: font.sm, color: colors.onSurfaceTertiary, marginTop: 2 },
  locationRow: {
    flexDirection: \"row\",
    alignItems: \"center\",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: \"transparent\",
  },
  locationActive: { borderColor: colors.success, backgroundColor: \"#F0FDF4\" },
  locationTitle: { fontSize: font.base, fontWeight: \"500\", color: colors.onSurface },
  locationSub: { fontSize: font.sm, color: colors.onSurfaceTertiary, marginTop: 2 },
  input: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    fontSize: font.base,
    color: colors.onSurface,
  },
  textarea: { minHeight: 96, textAlignVertical: \"top\" },
  stickyBar: {
    position: \"absolute\",
    left: 0,
    right: 0,
    bottom: 82,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: \"rgba(255,255,255,0.95)\",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  submitBtn: {
    flexDirection: \"row\",
    alignItems: \"center\",
    justifyContent: \"center\",
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    paddingVertical: 16,
    borderRadius: radius.pill,
  },
  submitText: { color: \"#fff\", fontSize: font.lg, fontWeight: \"500\" },
  toast: {
    position: \"absolute\",
    left: spacing.lg,
    right: spacing.lg,
    bottom: 160,
    backgroundColor: colors.surfaceInverse,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  toastText: { color: colors.onSurfaceInverse, fontSize: font.base, textAlign: \"center\" },
});
"
Observation: Create successful: /app/frontend/app/(tabs)/report.tsx