Fix invalid Ionicons names, then start services:
Action: file_editor str_replace /app/frontend/app/(tabs)/report.tsx --old-str "  { id: \"signal\", label: \"Broken signal\", icon: \"traffic-cone\" as const, color: \"#F59E0B\" }," --new-str "  { id: \"signal\", label: \"Broken signal\", icon: \"stop-circle\" as const, color: \"#F59E0B\" },"
Observation: Edit was successful.