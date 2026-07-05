
Action: file_editor create /app/frontend/src/api.ts --file-text "import AsyncStorage from \"@react-native-async-storage/async-storage\";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL ?? \"\";

const DEVICE_ID_KEY = \"safe_roads_device_id\";

export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      \"dev_\" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 10);
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { \"Content-Type\": \"application/json\" },
    ...init,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`API ${res.status}: ${t}`);
  }
  return (await res.json()) as T;
}

export type Campaign = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  image_url: string;
  tag: string;
  published_at: string;
};
export type Tip = {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  icon: string;
  image_url: string;
  read_minutes: number;
};
export type EmergencyContact = {
  id: string;
  name: string;
  number: string;
  icon: string;
  color: string;
};
export type Facility = {
  id: string;
  name: string;
  type: \"hospital\" | \"police\" | \"fuel\";
  address: string;
  phone: string;
  distance_km: number;
};
export type HazardReport = {
  id: string;
  device_id: string;
  category: string;
  description: string;
  address: string;
  photo_base64?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  created_at: string;
};

export const api = {
  campaigns: () => req<Campaign[]>(\"/campaigns\"),
  campaign: (id: string) => req<Campaign>(`/campaigns/${id}`),
  tips: () => req<Tip[]>(\"/tips\"),
  tip: (id: string) => req<Tip>(`/tips/${id}`),
  contacts: () => req<EmergencyContact[]>(\"/emergency-contacts\"),
  facilities: (type?: string) =>
    req<Facility[]>(`/facilities${type ? `?type=${type}` : \"\"}`),
  reports: (deviceId?: string) =>
    req<HazardReport[]>(`/reports${deviceId ? `?device_id=${deviceId}` : \"\"}`),
  createReport: (payload: {
    device_id: string;
    category: string;
    description: string;
    address?: string;
    photo_base64?: string;
    latitude?: number;
    longitude?: number;
  }) =>
    req<HazardReport>(\"/reports\", {
      method: \"POST\",
      body: JSON.stringify(payload),
    }),
  stats: () =>
    req<{ total: number; resolved: number; in_progress: number }>(
      \"/reports/stats\"
    ),
};
"
Observation: Create successful: /app/frontend/src/api.ts