# Claude Code Skill Kurulumu

**Kurulum tarihi:** 2026-08-05
**Kurulum yöntemi:** Düz dosya kopyası (git submodule DEĞİL). Kaynak repolar `C:\Users\yagiz\Projeler\_skills\` altına sığ (`--depth 1`) klonlandı, skill klasörleri `.claude/skills/` altına kopyalandı.
**Hedef dizin:** `.claude/skills/` — toplam **35 skill klasörü**.

Doğrulama, `npx skills@latest list` komutuyla yapıldı; komut 35 skill'in tamamını
`Agents: Claude Code / Source: local` olarak tanıdı. Ayrıca her `SKILL.md` dosyasının
YAML frontmatter'ında `name` ve `description` alanlarının varlığı programatik olarak
kontrol edildi: **35/35 geçti, 0 hata**.

---

## 1. claude-mem — KURULDU (kısmi: sadece skill dosyaları)

- **Kaynak repo:** https://github.com/thedotmack/claude-mem
- **Kaynak commit:** `f85bb28c4788ed6372e3406b3fc92cfbecf6df08`
- **Sürüm:** plugin.json → 13.13.1
- **Kaynak yol:** `plugin/skills/` → 19 skill klasörü

**Kanıt satırı** (`.claude/skills/mem-search/SKILL.md` frontmatter):

```
name: mem-search
description: Search claude-mem's persistent cross-session memory database. Use when user asks "did we already solve this?", "how did we do X last time?", or needs work from previous sessions.
```

**Kurulan skill'ler (19):**
`babysit`, `cloud-sync`, `design-is`, `do`, `how-it-works`, `knowledge-agent`,
`learn-codebase`, `make-plan`, `mem-search`, `mode-creator`, `oh-my-issues`,
`pathfinder`, `smart-explore`, `standup`, `timeline-report`, `version-bump`,
`weekly-digests`, `what-the`, `wowerpoint`

> **ÖNEMLİ UYARI — oturumlar arası hafıza HENÜZ AKTİF DEĞİL.**
> claude-mem'in asıl işlevi (oturumlar arası kalıcı hafıza) skill dosyalarından değil,
> `npx claude-mem install` komutunun kurduğu **global hook'lar + arka plan worker
> servisi + SQLite veritabanından** gelir. Bu adım YAPILMADI (gerekçe aşağıda).
> Şu an kurulu olan sadece skill markdown dosyalarıdır; `mem-search` gibi skill'ler
> worker çalışmadan sorgulayacak veritabanı bulamaz.
> Detay için "SABAH ONAY KUYRUĞU" bölümüne bakın.

> **Not:** Yukarıdaki 19 skill'in bir kısmı (`version-bump`, `cloud-sync`,
> `wowerpoint`, `design-is`, `mode-creator`, `oh-my-issues`, `what-the`)
> claude-mem projesinin kendi geliştirme akışına özeldir; bu projede işe yaramaz.
> Skill listesini sadeleştirmek isterseniz bu klasörleri silmek güvenlidir.

---

## 2. superpowers — KURULDU

- **Kaynak repo:** https://github.com/obra/superpowers
- **Kaynak commit:** `44c9b2d6e889982ac18c27d05a19fefe335194e1`
- **Kaynak yol:** `skills/` → 14 skill klasörü

**Kanıt satırı** (`.claude/skills/using-superpowers/SKILL.md` frontmatter):

```
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions
```

**Kurulan skill'ler (14):**
`brainstorming`, `dispatching-parallel-agents`, `executing-plans`,
`finishing-a-development-branch`, `receiving-code-review`, `requesting-code-review`,
`subagent-driven-development`, `systematic-debugging`, `test-driven-development`,
`using-git-worktrees`, `using-superpowers`, `verification-before-completion`,
`writing-plans`, `writing-skills`

> **Not:** Skill'ler saf markdown olduğu için kopyalandıkları haliyle çalışır.
> Upstream repo ayrıca bir `SessionStart` hook'u sunuyor (`hooks/hooks.json`) —
> bu hook her oturum başında `using-superpowers` skill'ini otomatik enjekte eder.
> Hook KURULMADI (global Claude Code yapılandırması gerektirir). Skill'leri adıyla
> veya açıklamasıyla tetiklemek yine de çalışır.

---

## 3. impeccable — KURULDU

- **Kaynak repo:** https://github.com/pbakaus/impeccable
- **Kaynak commit:** `ae5e95101a6979e7f7973a4ff57680b3c7adc1ec`
- **Sürüm:** SKILL.md → 4.0.4
- **Kaynak yol:** `.claude/skills/impeccable/` → 1 skill klasörü (SKILL.md + `reference/` + `scripts/`, ~3.4 MB)

**Kanıt satırı** (`.claude/skills/impeccable/SKILL.md` frontmatter):

```
name: impeccable
description: Use when the user wants to design, redesign, shape, critique, audit, polish, clarify, distill, harden, optimize, adapt, animate, colorize, extract, or otherwise improve a frontend interface. ...
version: 4.0.4
```

**Çalıştırma doğrulaması** — kendi teşhis komutu bu repoda çalıştırıldı:

```
$ node .claude/skills/impeccable/scripts/doctor.mjs
Impeccable doctor: C:\Users\yagiz\Projeler\ihaleal

No drift found. Every artifact matches what this version reads.
```

> **Not:** Upstream `npx impeccable install` komutu KULLANILMADI; o komut
> ayrıca provider'a özel hook manifest'i yazıyor. Sadece skill klasörü kopyalandı.
> İlk kullanımda `/impeccable init` çalıştırılması önerilir (PRODUCT.md / DESIGN.md üretir).

---

## 4. find-skills — KURULDU

- **Kaynak repo:** https://github.com/vercel-labs/skills
- **Kaynak commit:** `ab4fc49265c443279a5deae20297e631470da68c`
- **Kaynak yol:** `skills/find-skills/` → 1 skill klasörü

**Kanıt satırı** (`.claude/skills/find-skills/SKILL.md` frontmatter):

```
name: find-skills
description: Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. ...
```

**Çalıştırma doğrulaması** — sağladığı CLI bu repoda çalıştırıldı:

```
$ npx --yes skills@latest list
Project Skills
babysit                          ~\Projeler\ihaleal\.claude\skills\babysit
  Agents: Claude Code  Source: local
... (35 kayıt)
```

---

## DOĞRULANAMADI / SABAH ONAY KUYRUĞU

### K1 — claude-mem motoru (hook + worker) kurulmadı — ONAY GEREKİYOR

**Durum:** Skill dosyaları kuruldu, **hafıza motoru kurulmadı**.

**Ne yapılmadı:** `npx claude-mem install`

**Neden yapılmadı:** Bu komut proje dizinine değil, **global Claude Code
yapılandırmasına** yazar:
- `~/.claude` altına plugin cache'i ve hook kaydı ekler
  (`Setup`, `SessionStart`, `UserPromptSubmit` vb. otomatik çalışan komutlar),
- kalıcı bir arka plan **worker servisi** başlatır,
- yerel bir SQLite hafıza veritabanı oluşturur.

Global yapılandırma değişikliği ve kalıcı arka plan servisi başlatılması, sizin
doğrudan onayınızı gerektiren bir işlemdir; bir görev talimatı bunun yerine geçmez.

**Doğrulanan mevcut durum:** `~/.claude/plugins` yok, `~/.claude-mem` yok,
`~/.claude/settings.json` içinde claude-mem hook kaydı yok → motor **kurulu değil**.

**Onaylarsanız çalıştırılacak komut** (proje kökünde fark etmez, global kurulum):
```bash
npx claude-mem install
```
Alternatif (Claude Code içinden, plugin marketplace yoluyla):
```
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```
Her iki yolda da sonrasında Claude Code yeniden başlatılmalı.

### K2 — superpowers SessionStart hook'u kurulmadı — ONAY GEREKİYOR

Upstream, her oturum başında `using-superpowers` skill'ini enjekte eden bir
`SessionStart` hook'u öneriyor (resmi plugin marketplace üzerinden). Hook kurulumu
global Claude Code yapılandırması değiştirdiği için yapılmadı. Skill'lerin kendisi
çalışır durumda.

Onaylarsanız:
```
/plugin marketplace add obra/superpowers
```

### K3 — `.gitignore` değişikliği (ihaleal)

Bu repoda `.claude/` tümüyle ignore ediliyordu. `.claude/skills/` klasörünün
commit'lenebilmesi için `.gitignore` şu şekilde daraltıldı:

```
.claude/*
!.claude/skills/
```

Böylece Claude Code'un oturum/plan gibi lokal state dosyaları ignore kalmaya devam
ederken sadece `skills/` versiyonlanır. Bu davranışı istemiyorsanız geri alınabilir.

### K4 — `_skills` klon dizini

Kaynak klonlar `C:\Users\yagiz\Projeler\_skills\` altında bırakıldı (silinmedi).
Güncelleme yapmak isterseniz oradan `git pull` + yeniden kopyalama yeterli.
Gerek yoksa bu dizin güvenle silinebilir.
