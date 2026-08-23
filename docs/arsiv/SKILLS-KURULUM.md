# Claude Code Skill Kurulumu

**Kurulum tarihi:** 2026-08-05
**Yöntem:** Düz dosya kopyası (git submodule DEĞİL). Kaynak repolar
`C:\Users\yagiz\Projeler\_skills\` altına sığ klonlandı (`git clone --depth 1`),
skill klasörleri `.claude/skills/` altına kopyalandı.
**Sonuç:** `.claude/skills/` altında **44 skill klasörü**.

**Genel doğrulama:**

- `npx skills@latest list` → 44 skill'in tamamı
  `Agents: Claude Code / Source: local` olarak listelendi.
- Her `SKILL.md` için frontmatter kontrolü (ilk satır `---`, `name:` ve
  `description:` alanları): **44/44 geçti, 0 hata.**

---

## Özet tablo

| # | Araç | Kaynak | Durum | Kanıt | Nasıl kullanılır (1 satır) |
|---|------|--------|-------|-------|----------------------------|
| 1 | **claude-mem** (19 skill) | github.com/thedotmack/claude-mem @ `f85bb28` | KISMİ — skill dosyaları kuruldu, **hafıza motoru kurulmadı** | `name: mem-search` frontmatter'ı doğrulandı | "Bunu daha önce nasıl çözmüştük?" diye sor → `mem-search` devreye girer (motor kurulduktan sonra). |
| 2 | **OmniRoute** (9 skill) | github.com/diegosouzapw/OmniRoute @ `6b0e11e` | KISMİ — yönlendirme skill'leri kuruldu, **gateway kurulmadı** | `name: omni-combos-routing` frontmatter'ı doğrulandı | Gateway ayaktayken model olarak `auto/cheap` (ucuz) ya da `auto/coding` (kaliteli) seç; combo yönetimi `omni-combos-routing` ile. |
| 3 | **superpowers** (14 skill) | github.com/obra/superpowers @ `44c9b2d` | KURULDU | `name: using-superpowers` frontmatter'ı doğrulandı | Hatayı kök nedene kadar kovalamak için "systematic-debugging kullan", plan için "writing-plans kullan" de. |
| 4 | **impeccable** (1 skill) | github.com/pbakaus/impeccable @ `ae5e951` | KURULDU | `doctor.mjs` bu repoda çalıştırıldı: "No drift found." | Önce `/impeccable init`, sonra `/impeccable audit <dosya>` veya `/impeccable polish <dosya>`. |
| 5 | **find-skills** (1 skill) | github.com/vercel-labs/skills @ `ab4fc49` | KURULDU | `npx skills@latest list` bu repoda çalıştı, 44 kayıt döndü | "X yapan bir skill var mı?" diye sor; kurmak için `npx skills add <owner>/<repo>`. |

---

## 1. claude-mem — KISMİ (skill dosyaları kuruldu)

- **Kaynak:** https://github.com/thedotmack/claude-mem — commit `f85bb28c4788ed6372e3406b3fc92cfbecf6df08`, plugin sürümü 13.13.1
- **Kopyalanan yol:** `plugin/skills/` → 19 skill

**Kuruldu-kanıt** (`.claude/skills/mem-search/SKILL.md`):

```
name: mem-search
description: Search claude-mem's persistent cross-session memory database. Use when user asks "did we already solve this?", "how did we do X last time?", or needs work from previous sessions.
```

**Nasıl kullanılır:** "Bunu daha önce nasıl çözmüştük?" / "Geçen sefer ne yapmıştık?"
diye sorun; `mem-search` skill'i geçmiş oturum veritabanını arar.

**Kurulan skill'ler (19):** `babysit`, `cloud-sync`, `design-is`, `do`, `how-it-works`,
`knowledge-agent`, `learn-codebase`, `make-plan`, `mem-search`, `mode-creator`,
`oh-my-issues`, `pathfinder`, `smart-explore`, `standup`, `timeline-report`,
`version-bump`, `weekly-digests`, `what-the`, `wowerpoint`

> **UYARI — oturumlar arası hafıza HENÜZ ÇALIŞMIYOR.** claude-mem'in asıl işlevi skill
> dosyalarından değil, `npx claude-mem install` komutunun kurduğu global hook'lar +
> arka plan worker servisi + SQLite veritabanından gelir. Bu adım YAPILMADI → **K1**.
> Motor kurulmadan `mem-search` sorgulayacak veritabanı bulamaz.

> **Sadeleştirme notu:** Bu 19 skill'in bir kısmı (`version-bump`, `cloud-sync`,
> `wowerpoint`, `design-is`, `mode-creator`, `oh-my-issues`, `what-the`) claude-mem
> projesinin kendi geliştirme akışına özeldir; bu projede işe yaramaz. Skill listesini
> kısaltmak isterseniz bu klasörleri silmek güvenlidir.

---

## 2. OmniRoute — KISMİ (yönlendirme skill'leri kuruldu)

- **Kaynak:** https://github.com/diegosouzapw/OmniRoute — commit `6b0e11e378d09ea4992f212637960dfadf81dd56`, npm paketi `omniroute` 3.8.50
- **Kopyalanan yol:** `skills/` → 9 skill (45 skill'in tamamı DEĞİL, gerekçe aşağıda)

**Kuruldu-kanıt** (`.claude/skills/omni-combos-routing/SKILL.md`):

```
name: omni-combos-routing
description: Create and manage routing combos with 14 strategies (priority, weighted, round-robin, Auto-combo, etc.). Configure fallback chains, test routing outcomes, and retrieve combo metrics.
```

**Nasıl kullanılır:** OmniRoute gateway'i çalışırken (bkz. K2) kodlama aracının model
alanına ucuz/mekanik işler için `auto/cheap`, karmaşık akıl yürütme için `auto/coding`
yazın; kalıcı combo tanımlamak için `omni-combos-routing` skill'ini çağırın.

**Kurulan skill'ler (9):** `cli-routing`, `omni-combos-routing`, `cli-models`,
`omni-models`, `cli-cost-usage`, `omni-budget`, `omni-compression`, `cli-providers`,
`cli-setup`

**Neden 45 değil 9?** OmniRoute bir skill paketi değil, bir **uygulamadır**
(LLM gateway + Next.js panel + Docker/Electron). `skills/` klasöründeki 45 dosya
`src/lib/agentSkills/generator.ts` tarafından otomatik üretilen CLI referansıdır ve
gateway kurulu değilken hiçbiri çalışmaz. Bu yüzden yalnızca operatörün belirttiği
hedefe (ucuz/pahalı model ayrımı, token tasarrufu) doğrudan hizmet eden 9 tanesi
kuruldu; kalan 36 tanesi (`cli-tunnel`, `omni-webhooks`, `omni-db-backups`, `cli-a2a` vb.)
skill listesini gereksiz şişireceği için alınmadı. İstenirse
`C:\Users\yagiz\Projeler\_skills\OmniRoute\skills\` altından tek tek eklenebilir.

**Ucuz/pahalı ayrımı — README'den doğrulanan gerçek yapılandırma seçenekleri:**

| Model ID | Ne için optimize eder |
|----------|----------------------|
| `auto` | Dengeli varsayılan (LKGP — son çalışan sağlayıcıya sadık kalır) |
| `auto/cheap` | **Token başına en ucuz önce** → basit/mekanik işler |
| `auto/fast` | En düşük gecikme önce |
| `auto/coding` | **Kod üretimi için kalite öncelikli** → karmaşık akıl yürütme |
| `auto/smart` | Kalite öncelikli + %10 keşif |
| `auto/offline` | En çok kota/limit payı olan önce |

Kendi combo'nuzu kurarsanız 19 strateji arasından `cost-optimized`
("Pick cheapest target for the token estimate") ucuz kanal için doğrudan karşılıktır.

> **UYARI — yönlendirme HENÜZ AKTİF DEĞİL.** `npm install -g omniroute` yapılmadı,
> gateway `localhost:20128`'de çalışmıyor, hiçbir yapılandırma yazılmadı → **K2**.
> **API anahtarı uydurulmadı, hiçbir sağlayıcı bağlanmadı.**
> Doğrulanan durum: `npm ls -g --depth=0` çıktısında omniroute YOK.

---

## 3. superpowers — KURULDU

- **Kaynak:** https://github.com/obra/superpowers — commit `44c9b2d6e889982ac18c27d05a19fefe335194e1`
- **Kopyalanan yol:** `skills/` → 14 skill

**Kuruldu-kanıt** (`.claude/skills/using-superpowers/SKILL.md`):

```
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions
```

**Nasıl kullanılır:** İş türünü söyleyin — hata avı için "systematic-debugging kullan",
plan yazımı için "writing-plans kullan", test-önce geliştirme için
"test-driven-development kullan".

**Kurulan skill'ler (14):** `brainstorming`, `dispatching-parallel-agents`,
`executing-plans`, `finishing-a-development-branch`, `receiving-code-review`,
`requesting-code-review`, `subagent-driven-development`, `systematic-debugging`,
`test-driven-development`, `using-git-worktrees`, `using-superpowers`,
`verification-before-completion`, `writing-plans`, `writing-skills`

> **Not:** Skill'ler saf markdown olduğundan kopyalandıkları haliyle çalışır. Upstream
> ayrıca her oturum başında `using-superpowers`'ı otomatik enjekte eden bir `SessionStart`
> hook'u sunuyor; bu hook global yapılandırma gerektirdiği için kurulmadı → **K3**.

---

## 4. impeccable — KURULDU

- **Kaynak:** https://github.com/pbakaus/impeccable — commit `ae5e95101a6979e7f7973a4ff57680b3c7adc1ec`, skill sürümü 4.0.4
- **Kopyalanan yol:** `.claude/skills/impeccable/` → 1 skill (SKILL.md + `reference/` + `scripts/`, ~3.4 MB, 107 script dosyası)

**Kuruldu-kanıt** — frontmatter:

```
name: impeccable
description: Use when the user wants to design, redesign, shape, critique, audit, polish, ... improve a frontend interface. ...
version: 4.0.4
```

**Kuruldu-kanıt** — kendi teşhis komutu bu repoda gerçekten çalıştırıldı:

```
$ node .claude/skills/impeccable/scripts/doctor.mjs
Impeccable doctor: C:\Users\yagiz\Projeler\ihaleal

No drift found. Every artifact matches what this version reads.
```

**Nasıl kullanılır:** Önce bir kez `/impeccable init` (PRODUCT.md + DESIGN.md üretir),
sonra `/impeccable audit <dosya>`, `/impeccable polish <dosya>`, `/impeccable critique <dosya>`.

> **Not:** Upstream'in `npx impeccable install` komutu KULLANILMADI; o komut ayrıca
> provider'a özel hook manifest'i yazıyor. Yalnızca skill klasörü kopyalandı.

---

## 5. find-skills — KURULDU

- **Kaynak:** https://github.com/vercel-labs/skills — commit `ab4fc49265c443279a5deae20297e631470da68c`
- **Kopyalanan yol:** `skills/find-skills/` → 1 skill

**Kuruldu-kanıt** — frontmatter:

```
name: find-skills
description: Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. ...
```

**Kuruldu-kanıt** — sağladığı CLI bu repoda çalıştırıldı:

```
$ npx --yes skills@latest list
Project Skills
babysit                          ~\Projeler\ihaleal\.claude\skills\babysit
  Agents: Claude Code  Source: local
... (44 kayıt)
```

**Nasıl kullanılır:** "X yapan bir skill var mı?" diye sorun; kurmak için
`npx skills add <owner>/<repo>`, kurulu olanları görmek için `npx skills list`.

---

## DOĞRULANAMADI / SABAH ONAY KUYRUĞU

### K1 — claude-mem hafıza motoru kurulmadı (ONAY GEREKİYOR)

**Ne yapılmadı:** `npx claude-mem install`

**Neden:** Bu komut proje dizinine değil **global Claude Code yapılandırmasına** yazar:
`~/.claude` altına plugin cache'i ve otomatik çalışan hook kayıtları
(`Setup`, `SessionStart`, `UserPromptSubmit`) ekler, kalıcı bir **arka plan worker
servisi** başlatır ve yerel bir SQLite hafıza veritabanı oluşturur. Global yapılandırma
değişikliği ve kalıcı arka plan servisi başlatmak sizin doğrudan onayınızı gerektirir.

**Doğrulanan mevcut durum:** `~/.claude/plugins` yok, `~/.claude-mem` yok,
`~/.claude/settings.json` içinde claude-mem hook kaydı yok → motor kurulu değil.

**Onaylarsanız:**
```bash
npx claude-mem install
```
veya Claude Code içinden:
```
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```
Her iki yolda da sonrasında Claude Code yeniden başlatılmalı.

### K2 — OmniRoute gateway kurulmadı ve yönlendirme yapılandırılmadı (ONAY GEREKİYOR)

**Ne yapılmadı:** `npm install -g omniroute` + `omniroute` (gateway'i başlatma) +
ucuz/pahalı combo yapılandırması.

**Neden:**
1. Global npm paketi kurulumu + `localhost:20128` üzerinde **kalıcı bir arka plan
   sunucusu** (panel + API) başlatmak, sizin onayınızı gerektiren bir sistem değişikliğidir.
2. Kurulum sonrası adım kodlama aracınızın **tüm LLM trafiğini** bu ara sunucudan
   geçirmek anlamına gelir — istem içerikleri ve anahtarlar oradan akar. Bu bir
   güvenlik/gizlilik kararıdır, sizin vermeniz gerekir.
3. Panelde hesap/parola oluşturma adımı var; parola girme/hesap açma işlemlerini
   sizin adınıza yapmam.
4. Ücretli sağlayıcı bağlamak API anahtarı gerektirir. **Anahtar uydurulmadı,
   hiçbir yere anahtar yazılmadı.**

**Doğrulanan mevcut durum:** `npm ls -g --depth=0` → omniroute listede yok.

**Onaylarsanız — sırayla:**
```bash
npm install -g omniroute
omniroute                       # panel + API: http://localhost:20128
```
Sonra panelde: **Providers** → anahtarsız ücretsiz sağlayıcı (OpenCode Free / Kiro AI)
bağlayın; ücretli sağlayıcı için anahtarı **siz** girin.

Token tasarrufu için önerilen ayrım (README'den doğrulanmış kanallar):
- Basit/mekanik işler → model `auto/cheap` (token başına en ucuz önce)
- Karmaşık akıl yürütme/kod → model `auto/coding` (kalite öncelikli)
- Kendi combo'nuzu kurarsanız ucuz kanal için `cost-optimized` stratejisi

**Not:** Anthropic aboneliğiyle çalışan Claude Code'u OmniRoute üzerinden yönlendirmenin
mevcut kurulumunuzda maliyeti gerçekten düşürüp düşürmeyeceği **denenmedi** →
DOĞRULANAMADI. Karar vermeden önce küçük bir işte ölçmenizi öneririm.

### K3 — superpowers SessionStart hook'u kurulmadı (ONAY GEREKİYOR)

Upstream, her oturum başında `using-superpowers` skill'ini enjekte eden bir
`SessionStart` hook'u öneriyor (resmî plugin marketplace üzerinden). Global Claude Code
yapılandırması değiştirdiği için kurulmadı. Skill'lerin kendisi çalışır durumda.

**Onaylarsanız:** `/plugin marketplace add obra/superpowers`

### K4 — `.gitignore` daraltıldı (ihaleal)

Bu repoda `.claude/` tümüyle ignore ediliyordu; `.claude/skills/` commit'lenebilsin diye:

```
.claude/*
!.claude/skills/
```

Lokal session/plan dosyaları ignore kalmaya devam ediyor, yalnızca `skills/` versiyonlanır.
İstenmiyorsa geri alınabilir.

### K5 — patatesci deposunda commit karışması (BİLGİ)

patatesci'de skill dosyaları, eşzamanlı çalışan başka bir oturumun
`cc2d80c` ("Next 16 geçişi…") commit'ine karıştı ve o commit'le birlikte push edildi.
İçerik eksiksiz ve doğru (44 SKILL.md izleniyor, çalışma ağacı HEAD ile birebir aynı),
ancak commit mesajı içeriği yansıtmıyor. **Hiçbir dosya geri alınmadı.**
Aynı depoda paralel oturum çalışırken `git add -A` kullanılmaması önerilir.

### K6 — `_skills` klon dizini (BİLGİ)

Kaynak klonlar `C:\Users\yagiz\Projeler\_skills\` altında bırakıldı. Güncelleme için
oradan `git pull` + yeniden kopyalama yeterli; gerek yoksa dizin güvenle silinebilir.
