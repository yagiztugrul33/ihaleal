# GARANTİ YOL KURALLARI

**Kullanıcı kararı:** "Geç olsun güç olmasın, geri dönüş olmasın, titiz davranacağız." Her iş bu disiplinden geçer.

---

1. **Her canlı işlem öncesi ön-kontrol** (canlı teyit + sürpriz kontrolü + patch gerekirse). Faz 1-3b + bond guard + bundle paterni.

2. **Her deploy sonrası TAM smoke + regression zinciri** (KYC + tüm önceki fazlar). Regression yok rekoru korunur.

3. **Bağımsız müfettiş turu zorunlu** — bir araç (Cursor) iş yapar, diğeri (Claude Code) bağımsız denetler. Her büyük tur sonrası.

4. **Mock→gerçek geçiş sırası:** önce facade (server-authoritative), sonra UI, sonra canlı test (negatif senaryo: KYC'siz/deposit'siz → reddediliyor mu), sonra kullanıcı onayı.

5. **Her canlı/geri-alınamaz adımda kullanıcı "BAS" onayı.**

6. **Reverse SQL / rollback her deploy için hazır.**

7. **Sessiz kaldırılmış güvenlik kontrolü taraması her büyük tur öncesi** (bond guard + commission + ges + ai_quota örnekleri).

8. **Titiz ≠ yavaş:** acele yok ama duruş yok, her tur kanıtlı ilerleme.

9. **Kanıt olmadan adım yok** — "muhtemelen iyi" yetmez, "şu sorguyla teyit ettim" gerekir.

10. **Kullanıcı yokken canlı işlem/deploy/geri-alınamaz karar YOK.** Onay noktaları görünür ve kullanıcıda.
