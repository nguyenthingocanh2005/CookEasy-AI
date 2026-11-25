import { Platform } from "react-native";

export const colors = {
  primary: "#4CAF50",
  primaryDark: "#2E7D32",
  primaryLight: "#E8F5E9",
  orange: "#FF9800",
  orangeLight: "#FFF3E0",
  background: "#FAFAF5",
  surface: "#FFFFFF",
  input: "#F5F5F0",
  text: "#252525",
  textSecondary: "#757575",
  hint: "#9E9E9E",
  border: "#E5E7EB",
  divider: "#EEEEEE",
  success: "#2E7D32",
  error: "#D32F2F",
  warning: "#ED6C02",
  info: "#1976D2",
  overlay: "rgba(20, 30, 20, 0.48)",
} as const;

export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32 } as const;
export const radius = { small: 8, input: 12, button: 14, card: 16, modal: 20, pill: 999 } as const;

export const typography = {
  hero: { fontSize: 30, lineHeight: 36, fontFamily: "Inter_700Bold" },
  title: { fontSize: 24, lineHeight: 30, fontFamily: "Inter_700Bold" },
  section: { fontSize: 20, lineHeight: 26, fontFamily: "Inter_600SemiBold" },
  cardTitle: { fontSize: 16, lineHeight: 22, fontFamily: "Inter_600SemiBold" },
  body: { fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular" },
  description: { fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  caption: { fontSize: 12, lineHeight: 17, fontFamily: "Inter_400Regular" },
  button: { fontSize: 15, lineHeight: 20, fontFamily: "Inter_600SemiBold" },
} as const;

export const shadows = {
  card: Platform.select({
    android: { elevation: 3 },
    ios: {
      shadowColor: "#1B3D1F",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
    default: {},
  }),
  floating: Platform.select({
    android: { elevation: 8 },
    ios: {
      shadowColor: "#1B3D1F",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
    },
    default: {},
  }),
} as const;

export const theme = { colors, spacing, radius, typography, shadows } as const;
