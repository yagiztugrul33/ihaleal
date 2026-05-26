import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from "react-native";

type NumericFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel: string;
  keyboardType?: KeyboardTypeOptions;
};

export function NumericField({
  label,
  value,
  onChange,
  accessibilityLabel,
  keyboardType = "numeric",
}: NumericFieldProps) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={styles.input}
        keyboardType={keyboardType}
        accessibilityLabel={accessibilityLabel}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
}

export function ResultCard({
  title,
  rows,
  testID,
  note,
}: {
  title: string;
  rows: { label: string; value: string }[];
  testID?: string;
  note?: string;
}) {
  return (
    <View style={styles.resultCard} testID={testID}>
      <Text style={styles.resultTitle}>{title}</Text>
      {rows.map((row) => (
        <View key={row.label} style={styles.resultRow}>
          <Text style={styles.resultLabel}>{row.label}</Text>
          <Text style={styles.resultValue}>{row.value}</Text>
        </View>
      ))}
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

export function ScreenSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function ToggleChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? "#1d4ed8" : "#1e293b",
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <Text style={styles.chipLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12, marginBottom: 18 },
  sectionTitle: { color: "#e2e8f0", fontSize: 15, fontWeight: "700" },
  fieldBlock: { gap: 6 },
  fieldLabel: { color: "#cbd5e1", fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  resultCard: {
    borderWidth: 1,
    borderColor: "#1e3a8a",
    backgroundColor: "#0b1220",
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  resultTitle: { color: "#bfdbfe", fontSize: 14, fontWeight: "700", marginBottom: 2 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  resultLabel: { color: "#93c5fd", fontSize: 12, flex: 1 },
  resultValue: { color: "#f8fafc", fontSize: 13, fontWeight: "700", textAlign: "right" },
  note: { color: "#94a3b8", fontSize: 11, marginTop: 2 },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  chipLabel: { color: "#f8fafc", fontSize: 12, fontWeight: "700" },
});
