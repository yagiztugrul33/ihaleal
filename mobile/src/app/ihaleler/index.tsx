import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { applyAuctionFilters, formatRemaining, getAuctionStatus } from "./filters";
import { formatTl, parseFilterNumber } from "./formatters";
import type { AuctionFilters, AuctionStatus } from "./types";
import { useAuctionList } from "./useAuctionList";

const STATUS_LABELS: Record<AuctionStatus, string> = {
  open: "Açık",
  closing: "Kapanıyor",
  closed: "Kapandı",
};

const STATUS_COLORS: Record<AuctionStatus, string> = {
  open: "#166534",
  closing: "#a16207",
  closed: "#991b1b",
};

const DEFAULT_FILTERS: AuctionFilters = {
  status: "all",
  minBidTry: null,
  maxBidTry: null,
  maxRemainingHours: null,
  sortBy: "remainingAsc",
};

export default function IhalelerListScreen() {
  const router = useRouter();
  const { loading, error, data, reload, forceError, toggleForceError } = useAuctionList();

  const [filters, setFilters] = useState<AuctionFilters>(DEFAULT_FILTERS);
  const [minBidInput, setMinBidInput] = useState("");
  const [maxBidInput, setMaxBidInput] = useState("");
  const [maxHourInput, setMaxHourInput] = useState("");

  const filtered = useMemo(() => applyAuctionFilters(data, filters), [data, filters]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Live Auctions</Text>
        <Text style={styles.subtitle}>Listeleme/filtreleme ekranı. Teklif ve para işlemi içermez.</Text>

        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Filtreler</Text>
          <View style={styles.row}>
            <FilterChip
              label="Tümü"
              active={filters.status === "all"}
              onPress={() => setFilters((prev) => ({ ...prev, status: "all" }))}
            />
            <FilterChip
              label="Açık"
              active={filters.status === "open"}
              onPress={() => setFilters((prev) => ({ ...prev, status: "open" }))}
            />
            <FilterChip
              label="Kapanıyor"
              active={filters.status === "closing"}
              onPress={() => setFilters((prev) => ({ ...prev, status: "closing" }))}
            />
            <FilterChip
              label="Kapandı"
              active={filters.status === "closed"}
              onPress={() => setFilters((prev) => ({ ...prev, status: "closed" }))}
            />
          </View>

          <View style={styles.row2}>
            <TextInput
              value={minBidInput}
              onChangeText={(text) => {
                setMinBidInput(text);
                setFilters((prev) => ({ ...prev, minBidTry: parseFilterNumber(text) }));
              }}
              placeholder="Min fiyat (TL)"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              style={styles.input}
              accessibilityLabel="İhale minimum fiyat filtresi"
            />
            <TextInput
              value={maxBidInput}
              onChangeText={(text) => {
                setMaxBidInput(text);
                setFilters((prev) => ({ ...prev, maxBidTry: parseFilterNumber(text) }));
              }}
              placeholder="Max fiyat (TL)"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              style={styles.input}
              accessibilityLabel="İhale maksimum fiyat filtresi"
            />
          </View>

          <View style={styles.row2}>
            <TextInput
              value={maxHourInput}
              onChangeText={(text) => {
                setMaxHourInput(text);
                setFilters((prev) => ({ ...prev, maxRemainingHours: parseFilterNumber(text) }));
              }}
              placeholder="Kalan süre <= saat"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              style={styles.input}
              accessibilityLabel="İhale kalan saat filtresi"
            />
            <View style={styles.row}>
              <FilterChip
                label="Süre"
                active={filters.sortBy === "remainingAsc"}
                onPress={() => setFilters((prev) => ({ ...prev, sortBy: "remainingAsc" }))}
              />
              <FilterChip
                label="Fiyat↑"
                active={filters.sortBy === "bidAsc"}
                onPress={() => setFilters((prev) => ({ ...prev, sortBy: "bidAsc" }))}
              />
              <FilterChip
                label="Fiyat↓"
                active={filters.sortBy === "bidDesc"}
                onPress={() => setFilters((prev) => ({ ...prev, sortBy: "bidDesc" }))}
              />
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <Pressable style={styles.actionBtn} onPress={reload} accessibilityLabel="İhale listesini yenile">
            <Text style={styles.actionText}>Yenile</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, forceError ? styles.actionWarn : undefined]}
            onPress={toggleForceError}
            accessibilityLabel="Mock hata durumunu aç kapa">
            <Text style={styles.actionText}>{forceError ? "Hata modu açık" : "Hata modu kapalı"}</Text>
          </Pressable>
        </View>

        {loading ? <StateCard title="Yükleniyor" detail="İhale listesi hazırlanıyor..." /> : null}
        {!loading && error ? <StateCard title="Hata" detail={error} kind="error" /> : null}
        {!loading && !error && filtered.length === 0 ? (
          <StateCard title="Boş durum" detail="Filtrelere uygun ihale bulunamadı." kind="empty" />
        ) : null}

        {!loading && !error
          ? filtered.map((item) => {
              const status = getAuctionStatus(item.endAtIso);
              return (
                <Pressable
                  key={item.id}
                  style={styles.card}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title} ihale kartı`}
                  onPress={() => router.push(`/ihale/${item.id}`)}>
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.price}>{formatTl(item.currentBidTry)}</Text>
                    <Text style={styles.remaining}>Kalan: {formatRemaining(item.endAtIso)}</Text>
                    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] }]}>
                      <Text style={styles.badgeText}>{STATUS_LABELS[status]}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : undefined]} accessibilityLabel={label}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : undefined]}>{label}</Text>
    </Pressable>
  );
}

function StateCard({ title, detail, kind }: { title: string; detail: string; kind?: "error" | "empty" }) {
  return (
    <View style={[styles.stateCard, kind === "error" ? styles.stateError : kind === "empty" ? styles.stateEmpty : undefined]}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDetail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { paddingHorizontal: 16, paddingBottom: 36, gap: 10 },
  title: { color: "#f8fafc", fontSize: 28, fontWeight: "700", marginTop: 8 },
  subtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 6 },
  filterCard: {
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 14,
    backgroundColor: "#0b1220",
    padding: 12,
    gap: 8,
  },
  filterTitle: { color: "#cbd5e1", fontWeight: "700", fontSize: 13 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  row2: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#0f172a",
  },
  chipActive: { backgroundColor: "#1d4ed8", borderColor: "#1d4ed8" },
  chipText: { color: "#cbd5e1", fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: "#eff6ff" },
  actionBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1d4ed8",
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionWarn: { borderColor: "#b45309", backgroundColor: "#b45309" },
  actionText: { color: "#f8fafc", fontSize: 12, fontWeight: "700" },
  stateCard: { borderRadius: 12, borderWidth: 1, borderColor: "#334155", backgroundColor: "#0f172a", padding: 12 },
  stateError: { borderColor: "#7f1d1d", backgroundColor: "#3f1317" },
  stateEmpty: { borderColor: "#365314", backgroundColor: "#1a2f12" },
  stateTitle: { color: "#e2e8f0", fontSize: 14, fontWeight: "700" },
  stateDetail: { color: "#cbd5e1", fontSize: 12, marginTop: 4 },
  card: { borderWidth: 1, borderColor: "#1e293b", borderRadius: 14, overflow: "hidden", backgroundColor: "#0b1220" },
  image: { width: "100%", height: 160, backgroundColor: "#1f2937" },
  cardBody: { padding: 12, gap: 4 },
  cardTitle: { color: "#f8fafc", fontSize: 16, fontWeight: "700" },
  price: { color: "#bfdbfe", fontSize: 15, fontWeight: "700" },
  remaining: { color: "#cbd5e1", fontSize: 12 },
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, marginTop: 2 },
  badgeText: { color: "#f8fafc", fontSize: 11, fontWeight: "700" },
});
