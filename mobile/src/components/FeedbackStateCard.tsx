import { StyleSheet, Text, View } from "react-native";

type FeedbackVariant = "info" | "error" | "empty";

type FeedbackStateCardProps = {
  title: string;
  detail: string;
  variant?: FeedbackVariant;
};

const VARIANT_STYLE = {
  info: { borderColor: "#334155", backgroundColor: "#0f172a" },
  error: { borderColor: "#7f1d1d", backgroundColor: "#3f1317" },
  empty: { borderColor: "#365314", backgroundColor: "#1a2f12" },
} as const;

export function FeedbackStateCard({ title, detail, variant = "info" }: FeedbackStateCardProps) {
  const tone = VARIANT_STYLE[variant];
  return (
    <View
      style={[styles.card, tone]}
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${detail}`}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 12 },
  title: { color: "#e2e8f0", fontSize: 14, fontWeight: "700" },
  detail: { color: "#cbd5e1", fontSize: 12, marginTop: 4 },
});
