import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/async/LoadingState";
import { useAuth } from "@/contexts/AuthContext";
import type { useSavedSearches } from "@/hooks/useSavedSearches";

type SavedSearchesApi = ReturnType<typeof useSavedSearches>;

type Props = {
  api: SavedSearchesApi;
  currentQuery: string;
  onApplySearch: (query: string) => void;
};

export function SavedSearchesPanel({ api, currentQuery, onApplySearch }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!user) {
    return (
      <p className="rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
        Arama kaydetmek için{" "}
        <Link to="/giris?next=/arama" className="text-blue-400 underline">
          giriş yapın
        </Link>
        .
      </p>
    );
  }

  const handleSave = async () => {
    setSaveError(null);
    const label = name.trim() || currentQuery.trim() || "Kayıtlı arama";
    if (label.length < 2) {
      setSaveError("Arama metni veya isim girin.");
      return;
    }
    const res = await api.saveSearch({ name: label, queryText: currentQuery.trim() });
    if (!res.ok) {
      setSaveError(res.error ?? "Kaydedilemedi.");
      return;
    }
    setName("");
  };

  return (
    <div className="mb-8 rounded-xl border border-white/10 bg-slate-900/30 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Bookmark className="h-4 w-4 text-amber-400" />
        <h2 className="text-sm font-semibold text-white">Kayıtlı aramalar</h2>
        <Bell className="h-3.5 w-3.5 text-slate-500 ml-1" aria-hidden />
        <span className="text-[11px] text-slate-500">Yeni eşleşmede bildirim</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={currentQuery.trim() ? `Ad: ${currentQuery.slice(0, 40)}` : "Arama adı (isteğe bağlı)"}
          className="border-slate-700 bg-slate-950 text-white h-10"
        />
        <Button
          type="button"
          disabled={api.busy || currentQuery.trim().length < 2}
          onClick={() => void handleSave()}
          className="h-10 bg-amber-500 text-slate-950 shrink-0"
        >
          Aramayı kaydet
        </Button>
      </div>
      {saveError ? <p className="text-xs text-red-400">{saveError}</p> : null}

      {api.loading ? (
        <LoadingState compact label="Kayıtlı aramalar yükleniyor…" />
      ) : api.searches.length === 0 ? (
        <p className="text-xs text-slate-500">Henüz kayıtlı arama yok.</p>
      ) : (
        <ul className="divide-y divide-white/5 rounded-lg border border-white/10">
          {api.searches.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm">
              <button
                type="button"
                className="text-left text-slate-200 hover:text-white underline-offset-2 hover:underline"
                onClick={() => onApplySearch(s.queryText)}
              >
                {s.name}
                {s.queryText ? <span className="ml-2 text-xs text-slate-500">“{s.queryText}”</span> : null}
              </button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 text-slate-400 hover:text-red-300"
                  disabled={api.busy}
                  onClick={() => void api.removeSearch(s.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="text-xs text-blue-400 underline"
        onClick={() => navigate("/panel/bildirimler")}
      >
        Bildirimleri görüntüle
      </button>
    </div>
  );
}
