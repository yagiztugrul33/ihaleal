import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IHALEAL_PLATFORM_RULES } from "@/data/anayasa400IhalealRules";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, AlertTriangle, Info, CheckCircle2, Search, Scale, Gavel, Landmark, Building2, FileText, ClipboardCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  {
    id: 1,
    title: "İhaleAL — Nihai sistem ve platform",
    range: `1–${IHALEAL_PLATFORM_RULES.length}`,
    color: "blue",
    icon: Shield,
    rules: IHALEAL_PLATFORM_RULES,
  },
  {
    id: 2, title: "İhale — Usul ve İlkeler", range: "201-240", color: "cyan",
    icon: FileText,
    rules: [
      { id: 201, sev: "K", title: "4734 Sayılı Kanun Amacı", desc: "Kamu kaynaklarının etkili kullanımı, rekabet, güvenirlik ve şeffaflık sağlanır.", ref: "4734 md.1" },
      { id: 202, sev: "K", title: "Eşit Muamele ve Fırsat Eşitliği", desc: "İhalelerde eşit muamele ve fırsat eşitliği esastır; ayrımcılık yapılamaz.", ref: "4734 md.5" },
      { id: 203, sev: "K", title: "Gizlilik İlkesi", desc: "Gizlilik kanunda öngörülen istisnalar dışında ihlal edilemez; teklifler açılana kadar gizli kalır.", ref: "4734 md.5" },
      { id: 204, sev: "K", title: "İhale Konusu İşin Teknik Şartnamesi", desc: "Teknik şartname idarenin hazırlığındadır; rekabeti ve adaleti bozacak hükümler konulamaz.", ref: "4734 md.11" },
      { id: 205, sev: "K", title: "İhale Komisyonu", desc: "İhale komisyonu usulüne uygun oluşturulmalı ve kararları yazılı olmalıdır.", ref: "4734 md.9" },
      { id: 206, sev: "K", title: "Açık İhale Usulü", desc: "Açık ihale usulü genel olarak en yaygın usuldür; ilan edilir ve herkes katılabilir.", ref: "4734 md.13" },
      { id: 207, sev: "K", title: "Belli İstekliler Arasında İhale", desc: "Ön yeterlilik değerlendirmesi içerir; yeterlilik kriterleri işin niteliğine uygun olmalıdır.", ref: "4734 md.14" },
      { id: 208, sev: "K", title: "Pazarlık Usulü", desc: "Pazarlık usulü kanunda öngörülen hallerde kullanılabilir.", ref: "4734 md.15" },
      { id: 209, sev: "K", title: "Doğrudan Temin", desc: "Sınırlı tutar ve şartlarla mümkündür; güncel tebliğler izlenmelidir.", ref: "4734 md.16" },
      { id: 210, sev: "K", title: "İhale Dokümanı", desc: "İhale dokümanı; idari şartname, teknik şartname ve sözleşme tasarısını içerir.", ref: "4734 md.10" },
      { id: 211, sev: "K", title: "İhale İlanları", desc: "İhale ilanları usul ve sürelere uygun yayımlanmalıdır; dijital ortam zorunlu olabilir.", ref: "4734 md.12" },
      { id: 212, sev: "K", title: "Teklif Süresi", desc: "Tekliflerin süresi içinde ve usule uygun verilmesi esastır; geç teklifler değerlendirmeye alınmaz.", ref: "4734 md.32" },
      { id: 213, sev: "K", title: "Anormal Düşük Teklif", desc: "Anormal düşük teklifler için açıklama isteme usulü düzenlenmiştir.", ref: "4734 md.41" },
      { id: 214, sev: "K", title: "En Avantajlı Teklif", desc: "Ekonomik en uygun teklif veya en düşük bedel kriterlerine göre belirlenir.", ref: "4734 md.41" },
      { id: 215, sev: "K", title: "Değerlendirme Kriterleri", desc: "Değerlendirme kriterleri ilanda ve şartnamede açıkça belirtilmelidir.", ref: "4734 md.41" },
      { id: 216, sev: "K", title: "Geçici Teminat", desc: "Tekliflerin geçerliliğini güvence altına alır; geçici teminat mektupları için usuller tebliğlerde düzenlenir.", ref: "4734 md.33" },
      { id: 217, sev: "K", title: "Kesin Teminat", desc: "Kesin teminat sözleşmenin ifası için alınır; teminatın gelir kaydedilmesi aykırılık hallerinde gündeme gelir.", ref: "4734 md.34" },
      { id: 218, sev: "K", title: "Sözleşme İmzalanması", desc: "İhale kararının onayını ve usulü tamamlamayı gerektirir; şartnameyle uyumlu olmalıdır.", ref: "4734 md.47" },
      { id: 219, sev: "K", title: "İhale İptali", desc: "İhaleyi iptal etme yetkisi kanunda gösterilen haller ve usulle sınırlıdır.", ref: "4734 md.43" },
      { id: 220, sev: "K", title: "İhale Kararının İptali Davası", desc: "İdari yargı mercilerinde açılabilir; idari işlem iptali usulü uygulanır.", ref: "4734 md.54" },
      { id: 221, sev: "U", title: "İhale Kapsamındaki İdareler", desc: "Kanun kapsamındaki idareler ve kurumlar eki listelerle ilişkilidir; kapsam dışı işlemler için özel düzenlemeler vardır.", ref: "4734 md.2-3" },
      { id: 222, sev: "U", title: "Yasaklılık Halleri", desc: "İhaleye katılımda yasaklılık halleri kanunda ve ikincil mevzuatta düzenlenir.", ref: "4734 md.11" },
      { id: 223, sev: "U", title: "Ortak Girişim", desc: "Ortak girişimler belirli şartlarla ihaleye katılabilir; ortaklık sözleşmesi belgelerde açık olmalıdır.", ref: "4734 md.11" },
      { id: 224, sev: "U", title: "Alt Yüklenici", desc: "Alt yüklenici kullanımı sözleşme ve şartnamelerle sınırlanabilir.", ref: "4734 md.8, 48" },
      { id: 225, sev: "U", title: "Elektronik İhale", desc: "Elektronik ihale uygulamaları mevzuatta öngörülen çerçevede zorunlu olabilir.", ref: "4734 md.6" },
      { id: 226, sev: "U", title: "İhale Dokümanı Değişiklikleri", desc: "İhale dokümanı değişiklikleri ilan ve tebliğ usulüne tabidir.", ref: "4734 md.10" },
      { id: 227, sev: "U", title: "İhale Sürelerinin Hesaplanması", desc: "İhale sürelerinin hesaplanması takvim günü veya iş günü olarak ilanda belirtilmelidir.", ref: "4734 md.12" },
      { id: 228, sev: "U", title: "Soru Sorma ve Açıklama", desc: "Soru sorma ve açıklama usulleri şeffaflığı güçlendirir.", ref: "4734 md.12" },
      { id: 229, sev: "U", title: "İhale Gün ve Saati", desc: "İhale gün ve saatinin net belirtilmesi usul hatasını önler.", ref: "4734 md.12" },
      { id: 230, sev: "U", title: "İhale Komisyonu Üyelerinin Yasaklılığı", desc: "İhale komisyonu üyelerinin yasaklılık halleri kanunda sayılır.", ref: "4734 md.9" },
      { id: 231, sev: "U", title: "İhale Yetkilisi", desc: "İhale yetkilisinin imzası ve onay süreçleri iç kontrol sisteminin parçasıdır.", ref: "4734 md.9" },
      { id: 232, sev: "U", title: "İhale Evraklarının Saklama Süresi", desc: "İhale evraklarının saklama süreleri ve arşivleme usulü önemlidir.", ref: "4734 md.10" },
      { id: 233, sev: "U", title: "Denetim Elemanlarının Erişimi", desc: "Denetim elemanlarının erişimi ve gizlilik dengelenmelidir.", ref: "4734 md.9" },
      { id: 234, sev: "U", title: "İhalede Yabancı Dil Kullanımı", desc: "Yabancı dil kullanımı ilan ve dokümanlarda belirsizlik yaratmamalıdır.", ref: "4734 md.10" },
      { id: 235, sev: "U", title: "İhale Konusu İşin Bölünmesi", desc: "İşin bölünmesi kanunda öngörülen haller dışında sakıncalıdır; parçalı ihale ve lot uygulamaları rekabeti artırabilir.", ref: "4734 md.7" },
      { id: 236, sev: "U", title: "AB Müktesebatına Uyum", desc: "AB müktesebatına uyum çalışmaları ihale mevzuatında reformlara yol açmıştır.", ref: "4734 md.1" },
      { id: 237, sev: "U", title: "Yerli Malı ve Yerli İstekliler", desc: "Yerli malı ve yerli isteklilere ilişkin düzenlemeler mevzuatta yer alır; güncel teşvikler izlenmelidir.", ref: "4734 md.63" },
      { id: 238, sev: "U", title: "KOBİ Düzenlemeleri", desc: "KOBİ'lere yönelik düzenlemeler politika olarak ihale mevzuatına yansıyabilir.", ref: "4734 md.1" },
      { id: 239, sev: "U", title: "Çevre ve İş Güvenliği", desc: "Çevre ve iş güvenliği şartları teknik şartnamelerde zorunlu hale getirilebilir.", ref: "4734 md.11" },
      { id: 240, sev: "U", title: "İhale Mevzuatında Tanımlar", desc: "İstekli, yüklenici, idare gibi tanımlar karıştırılmamalıdır.", ref: "4734 md.4" },
    ]
  },
  {
    id: 3, title: "İhale — Teklif ve Teminat", range: "241-280", color: "violet",
    icon: ClipboardCheck,
    rules: [
      { id: 241, sev: "K", title: "Teklif Bağlayıcılığı", desc: "Teklif veren teklifini süresi içinde geri çekemez; geri çekme geçici teminatın gelir kaydedilmesine yol açar.", ref: "4734 md.32" },
      { id: 242, sev: "K", title: "Geç Teklifler", desc: "Geç teklifler değerlendirmeye alınmaz; zarf açma tutanağı bu durumu kaydetmelidir.", ref: "4734 md.32" },
      { id: 243, sev: "K", title: "Belirsiz ve Çelişkili Teklifler", desc: "Belirsiz ve çelişkili teklifler reddedilebilir; teklif mektubu usulüne uygun olmalıdır.", ref: "4734 md.32" },
      { id: 244, sev: "K", title: "Teminatın İadesi", desc: "Teminatın iadesi sözleşme ve mevzuattaki şartların gerçekleşmesine bağlıdır.", ref: "4734 md.33-34" },
      { id: 245, sev: "K", title: "Teminat Gelir Kaydı", desc: "Teminatın gelir kaydedilmesi aykırılık hallerinde gündeme gelir; usulü tebliğlerde düzenlenir.", ref: "4734 md.33" },
      { id: 246, sev: "K", title: "Komisyon Kararları Çoğunlukla", desc: "Komisyon kararları çoğunlukla alınır; karşı oy gerekçesi yazılabilir.", ref: "4734 md.9" },
      { id: 247, sev: "K", title: "Tekliflerin Açılması", desc: "Zarf açma tutanağı usulün vazgeçilmez parçasıdır; teklif mektubu ve geçici teminat uygunluğu ön kontrolde incelenir.", ref: "4734 md.32" },
      { id: 248, sev: "U", title: "Otomatik Teklif", desc: "Sistem otomatik artırma yapabilir; kullanıcı maksimum limit belirleyebilir.", ref: "4734 md.32" },
      { id: 249, sev: "U", title: "Gizli Teklif", desc: "Kapalı zarf usulü teklifler sadece ihale sonunda açılır.", ref: "4734 md.13" },
      { id: 250, sev: "U", title: "Teknik Puanlama", desc: "Teknik puanlama önceden ilan edilen katsayı ve kriterlere bağlı kalmalıdır.", ref: "4734 md.41" },
      { id: 251, sev: "U", title: "İstekliler Arasında Ayrımcılık", desc: "İstekliler arasında ayrımcılık yapılamaz; yerel ve uluslararası isteklilere eşit şartlar sağlanmalıdır.", ref: "4734 md.5" },
      { id: 252, sev: "U", title: "Birim Fiyat Teklifleri", desc: "Birim fiyat tekliflerinde aritmetik hataların düzeltilmesi usule bağlıdır.", ref: "4734 md.37" },
      { id: 253, sev: "U", title: "Alternatif Teklif", desc: "Alternatif tekliflere izin verilip verilmeyeceği ilanda belirtilmelidir.", ref: "4734 md.32" },
      { id: 254, sev: "U", title: "İhale Bedeli Üzerinden İmza", desc: "İhale bedeli üzerinden imza teklif mektubu ve teminat uygunluğuyla mümkündür.", ref: "4734 md.47" },
      { id: 255, sev: "U", title: "Yaklaşık Maliyet", desc: "Yaklaşık maliyetin gizliliği ve oluşturulma usulü mevzuatta düzenlenir.", ref: "4734 md.8" },
      { id: 256, sev: "U", title: "İhale Sonuçlarının Duyurusu", desc: "İhale sonuçlarının şeffaf duyurusu rekabeti destekler.", ref: "4734 md.42" },
      { id: 257, sev: "U", title: "İhale Bedeli ve Yaklaşık Maliyet", desc: "İhale bedeli ve yaklaşık maliyet arasındaki ilişki anormal teklif incelemesinde önemlidir.", ref: "4734 md.8, 41" },
      { id: 258, sev: "U", title: "İhale Komisyonu Raporu", desc: "İhale komisyonu raporu kararın dayanağıdır.", ref: "4734 md.9" },
      { id: 259, sev: "U", title: "İhale Onay Belgesi", desc: "İhale onay belgesi ve idari süreçler iç denetime tabidir.", ref: "4734 md.43" },
      { id: 260, sev: "U", title: "Dijital İmza ve Zaman Damgası", desc: "E-teklif sistemlerinde dijital imza ve zaman damgası uyuşmazlıklarında delil hukuku önemlidir.", ref: "4734 md.6" },
      { id: 261, sev: "B", title: "Teklif Mektubu Standartları", desc: "Teklif mektubu şartnamedeki standart formata uygun olmalıdır.", ref: "4734 md.32" },
      { id: 262, sev: "B", title: "Teklif Birim Fiyat Cetvelleri", desc: "Birim fiyat cetvellerinde tutarsızlıklar değerlendirme aşamasında ele alınır.", ref: "4734 md.37" },
      { id: 263, sev: "B", title: "Yaklaşık Maliyetin Altındaki Teklifler", desc: "Yaklaşık maliyetin altındaki teklifler için ayrıntılı inceleme zorunlu olabilir.", ref: "4734 md.41" },
      { id: 264, sev: "B", title: "İhale Komisyonunda Çekimser Oy", desc: "Çekimser oy usulü ve tutanak düzeni önemlidir.", ref: "4734 md.9" },
      { id: 265, sev: "B", title: "Elektronik İhale Güvenliği", desc: "E-imza, zaman damgası ve veri bütünlüğü sağlanmalıdır.", ref: "4734 md.6" },
      { id: 266, sev: "B", title: "İhalede Yabancı Para", desc: "Yabancı para kullanımı kur ve ödeme şekline bağlıdır.", ref: "4734 md.29" },
      { id: 267, sev: "B", title: "İhaleye Katılmaktan Çekilme", desc: "İhaleye katılmaktan çekilme belirli aşamalarda farklı sonuç doğurur.", ref: "4734 md.32" },
      { id: 268, sev: "B", title: "Geçici Teminat İradı", desc: "Geçici teminatın irad kaydı teklifin geri çekilmesi gibi hallerde gündeme gelir.", ref: "4734 md.33" },
      { id: 269, sev: "B", title: "İhale İptali Halinde Teminat", desc: "İhale iptali halinde teminatlar iade edilir; istisnalar kanunda düzenlenir.", ref: "4734 md.43" },
      { id: 270, sev: "B", title: "İhale Kararının Düzeltilmesi", desc: "İhale kararının düzeltilmesi maddi hata ve usul hatalarında farklıdır.", ref: "4734 md.42" },
      { id: 271, sev: "B", title: "İhale Dokümanında Çelişki", desc: "İhale dokümanında çelişki halinde genel hiyerarşi kuralları uygulanır.", ref: "4734 md.10" },
      { id: 272, sev: "B", title: "Özel Teknik Şartnameler", desc: "Özel teknik şartnamelerde standartlara uygunluk beyanı istenebilir.", ref: "4734 md.11" },
      { id: 273, sev: "B", title: "Laboratuvar Raporları", desc: "Laboratuvar raporları ve sertifikalar mal yeterliliğinde delil oluşturur.", ref: "4734 md.11" },
      { id: 274, sev: "B", title: "CE İşareti", desc: "CE işareti gibi uygunluk göstergeleri teknik şartnamede netleştirilmelidir.", ref: "4734 md.11" },
      { id: 275, sev: "B", title: "Yerli Malı Belgesi", desc: "Yerli malı belgesi ve benzeri belgelerin süresi ve geçerliliği kontrol edilir.", ref: "4734 md.63" },
      { id: 276, sev: "B", title: "Marka ve Model Dayatması", desc: "Marka ve model dayatması rekabeti kısıtlıyorsa meşru gerekçeye dayanmalıdır.", ref: "4734 md.11" },
      { id: 277, sev: "B", title: "Avans Ödemeleri", desc: "Avans ödemeleri teminat ve mahsup şartlarıyla güvence altına alınır.", ref: "4734 md.29" },
      { id: 278, sev: "B", title: "İş Deneyimi Belgesi", desc: "İş deneyimi belgesi ve referanslar yeterlilik değerlendirmesinde kullanılır.", ref: "4734 md.11" },
      { id: 279, sev: "B", title: "Personel ve Teçhizat Yeterliliği", desc: "Personel ve teçhizat yeterliliği işin türüne göre istenir.", ref: "4734 md.11" },
      { id: 280, sev: "B", title: "Mali Yeterlilik", desc: "Mali yeterlilik bilanço, cirolar veya banka referansı ile gösterilebilir.", ref: "4734 md.11" },
    ]
  },
  {
    id: 4, title: "İhale — Sözleşme ve İfası", range: "281-320", color: "teal",
    icon: FileText,
    rules: [
      { id: 281, sev: "K", title: "Sözleşme Hükümleri Şartnameyle Uyumlu", desc: "Sözleşme hükümleri şartnameyle uyumlu olmalıdır; sözleşme tasarısı ile nihai sözleşme arasında çelişki olmamalıdır.", ref: "4734 md.47" },
      { id: 282, sev: "K", title: "İş Artışı ve Üst Sınır", desc: "İş artışı kanuni sınırlar ve sözleşme hükümleriyle bağlıdır; üst sınırlar aşılamaz.", ref: "4734 md.8" },
      { id: 283, sev: "K", title: "Süre Uzatımı", desc: "Süre uzatımı talepleri yazılı ve gerekçeli olmalıdır; kanuni üst sınırlar kritiktir.", ref: "4734 md.10" },
      { id: 284, sev: "K", title: "Mücbir Sebep", desc: "Mücbir sebep ifayı imkânsızlaştıran olaylar için düzenlenir; bildirim süre ve şekil şartlarına tabidir.", ref: "4734 md.10" },
      { id: 285, sev: "K", title: "Yüklenicinin Temerrüdü", desc: "Yüklenicinin temerrüdü süre ve ihtar şartlarına tabidir; aykırılık halinde idarenin hakları devreye girer.", ref: "4734 md.10" },
      { id: 286, sev: "K", title: "Ceza-i Şart ve Gecikme Cezası", desc: "Ceza-i şart ve gecikme cezaları sözleşmede öngörülebilir; orantılı olmalıdır.", ref: "4734 md.10" },
      { id: 287, sev: "K", title: "Hakediş ve Ödeme", desc: "Hakediş ve ödeme usulleri şeffaf ve denetlenebilir olmalıdır; stopaj ve vergi mevzuatı uygulanır.", ref: "4734 md.10" },
      { id: 288, sev: "K", title: "Kesin Hesap ve Kabul", desc: "Kesin hesap ve geçici kabul süreçleri teknik şartnamelere bağlıdır.", ref: "4734 md.10" },
      { id: 289, sev: "K", title: "Garanti Süreleri", desc: "Garanti süreleri ve ayıplı ifa idare ile yüklenici arasında düzenlenir.", ref: "4734 md.10" },
      { id: 290, sev: "K", title: "İdarenin Sözleşmeyi Fesih Hakkı", desc: "Aykırılık halinde idarenin sözleşmeyi fesih, teminat geliri vb. hakları kanunda çerçevelenir.", ref: "4734 md.10" },
      { id: 291, sev: "U", title: "Birim Fiyatlı ve Götürü Bedel", desc: "Birim fiyatlı ve götürü bedelli sözleşmelerin risk dağılımı farklıdır.", ref: "4734 md.10" },
      { id: 292, sev: "U", title: "Keşif Artışları", desc: "Keşif artışları kanuni oran ve usul sınırları içinde yapılabilir.", ref: "4734 md.8" },
      { id: 293, sev: "U", title: "Fiyat Farkı Ödemesi", desc: "Fiyat farkı ödeme mekanizmaları sözleşme ve mevzuatla belirlenir.", ref: "4734 md.10" },
      { id: 294, sev: "U", title: "Sözleşme İmzalanması", desc: "İhale bedeli üzerinden sözleşme imzalanması esastır.", ref: "4734 md.47" },
      { id: 295, sev: "U", title: "İhale Bedelinin Altında Sözleşme", desc: "İhale bedelinin altında sözleşme imkânı kanuni şartlara bağlıdır.", ref: "4734 md.47" },
      { id: 296, sev: "U", title: "İdarenin Denetim Yetkileri", desc: "İdarenin denetim yetkileri sözleşmede açıkça yazılmalıdır.", ref: "4734 md.48" },
      { id: 297, sev: "U", title: "Yüklenicinin Alt İşveren Bildirimi", desc: "Alt işveren bildirimi ve onay süreçleri şeffaf olmalıdır.", ref: "4734 md.48" },
      { id: 298, sev: "U", title: "İş Güvenliği Uzmanı", desc: "İş güvenliği uzmanı ve işyeri hekimi atamaları mevzuata uygun olmalıdır.", ref: "4734 md.11" },
      { id: 299, sev: "U", title: "Çevre İzin ve Lisansları", desc: "Çevre izin ve lisansları yapım işlerinde ön koşul olabilir.", ref: "4734 md.11" },
      { id: 300, sev: "U", title: "Gizlilik Sözleşmeleri", desc: "Gizlilik sözleşmeleri danışmanlık ve yazılım ihalelerinde sık kullanılır.", ref: "4734 md.10" },
      { id: 301, sev: "B", title: "Hakkaniyet ve İyiniyet", desc: "Hakkaniyet ve iyiniyet sözleşme yorumunda gözetilir.", ref: "TBK md.2" },
      { id: 302, sev: "B", title: "Kamu Zararının Tespiti", desc: "Kamu zararının tespiti ve sorumluların belirlenmesi denetim raporlarıyla başlar.", ref: "4734 md.9" },
      { id: 303, sev: "B", title: "İş Artışı ve Süre Uzatımı Üst Sınır", desc: "İş artışı ve süre uzatımı birlikte değerlendirildiğinde üst sınırlar kritiktir.", ref: "4734 md.8" },
      { id: 304, sev: "B", title: "Sözleşme Değişikliği", desc: "Sözleşme değişiklikleri yazılı ve usule uygun olmalıdır.", ref: "4734 md.10" },
      { id: 305, sev: "B", title: "Teminatın İadesi", desc: "Kesin teminatın iadesi sözleşme şartlarının yerine getirilmesine bağlıdır.", ref: "4734 md.34" },
      { id: 306, sev: "B", title: "Kesin Teminat Geliri", desc: "Kesin teminatın geliri sözleşmenin ifa edilmemesi halinde mümkün olabilir.", ref: "4734 md.34" },
      { id: 307, sev: "B", title: "Avans Mahsubu", desc: "Avans ödemeleri ileriki hakedişlerden mahsup edilir.", ref: "4734 md.29" },
      { id: 308, sev: "B", title: "Stopaj ve Vergi", desc: "Hakediş ödemelerinde stopaj ve vergi mevzuatı birlikte uygulanır.", ref: "4734 md.10" },
      { id: 309, sev: "B", title: "Fiyat Farkı Formülleri", desc: "Fiyat farkı hesaplarında endeks ve formüller sözleşmede sabitlenmelidir.", ref: "4734 md.10" },
      { id: 310, sev: "B", title: "İhale İptali Halinde Zarar", desc: "İhale iptali halinde zararın giderilmesi talepleri idari yargıda görülür.", ref: "4734 md.43" },
      { id: 311, sev: "B", title: "Geçici Kabul", desc: "Kesin kabul öncesi geçici kabul aşaması kusur ve eksikliklerin tespiti içindir.", ref: "4734 md.10" },
      { id: 312, sev: "B", title: "Ayıplı İfa", desc: "Garanti süresindeki ayıplar için idarenin talep hakları vardır.", ref: "4734 md.10" },
      { id: 313, sev: "B", title: "İdarenin Tek Taraflı Hakları", desc: "İdarenin tek taraflı hakları kanunda açıkça öngörülmüş olmalıdır.", ref: "4734 md.10" },
      { id: 314, sev: "B", title: "Sözleşme Yorumu", desc: "Sözleşme yorumunda hakkaniyet ve iyiniyet gözetilir.", ref: "TBK md.2" },
      { id: 315, sev: "B", title: "Alt İşveren Sorumluluğu", desc: "Alt işverenin sorumluluğu ana yükleniciyle birlikte değerlendirilir.", ref: "4734 md.48" },
      { id: 316, sev: "B", title: "Yapım İşleri İş Programı", desc: "Yapım işlerinde iş programı ve termin cezaları sık kullanılır.", ref: "4734 md.10" },
      { id: 317, sev: "B", title: "Hizmet Alımları Performans", desc: "Hizmet alımlarında performans göstergeleri ve hizmet seviyesi anlaşmaları önemlidir.", ref: "4734 md.10" },
      { id: 318, sev: "B", title: "Mal Alımları Teslimat", desc: "Mal alımlarında teslimat ve muayene kabulleri ayrıntılı düzenlenir.", ref: "4734 md.10" },
      { id: 319, sev: "B", title: "Demirbaş ve Stok", desc: "Demirbaş ve stok yönetimi sözleşme konusu malın niteliğine bağlıdır.", ref: "4734 md.10" },
      { id: 320, sev: "B", title: "Yazılım Lisansları", desc: "Yazılım lisansları ve fikri mülkiyet hakları sözleşmede açıkça düzenlenmelidir.", ref: "4734 md.10" },
    ]
  },
  {
    id: 5, title: "İhale — Şikayet ve İptal", range: "321-360", color: "rose",
    icon: XCircle,
    rules: [
      { id: 321, sev: "K", title: "Şikayet ve İtiraz Yolları", desc: "İhale süreçlerinde şikayet ve itiraz yolları Kanun'da öngörülmüştür.", ref: "4734 md.53" },
      { id: 322, sev: "K", title: "Kamu İhale Kurulu", desc: "Kamu İhale Kurulu ihale mevzuatının uygulanmasını denetler ve karar verir.", ref: "4734 md.54" },
      { id: 323, sev: "K", title: "Kurul Kararlarının Bağlayıcılığı", desc: "Kurul kararları idareleri bağlar; usulüne uygun yeniden değerlendirme gerekebilir.", ref: "4734 md.54" },
      { id: 324, sev: "K", title: "İhale Usulünün İhlali", desc: "İhale usulünün ihlali iptal ve idari yaptırımlara yol açabilir.", ref: "4734 md.53" },
      { id: 325, sev: "K", title: "Yürütmenin Durdurulması", desc: "Yürütmenin durdurulması talebi telafi edilemez zarar şartlarıyla sınırlıdır.", ref: "4734 md.54" },
      { id: 326, sev: "K", title: "İdari İşlem İptali", desc: "İdari işlem iptali usul ve esas bakımından Danıştay içtihadıyla şekillenir.", ref: "4734 md.54" },
      { id: 327, sev: "K", title: "İhale Kararı İptal Davası", desc: "İdari yargı mercilerinde açılabilir; süreler ve yetkili mahkeme usule tabidir.", ref: "4734 md.54" },
      { id: 328, sev: "K", title: "Kurul İncelemelerinde Dosya Eksikliği", desc: "Dosya eksikliği iade ve tamamlama talebine yol açabilir.", ref: "4734 md.54" },
      { id: 329, sev: "U", title: "Kurul Kararlarına Karşı İptal Davası", desc: "Kurul kararlarına karşı iptal davası açılabilir.", ref: "4734 md.54" },
      { id: 330, sev: "U", title: "İhale Sonrası Şikayet Süreleri", desc: "İhale sonrası şikayet süreleri kaçırılmamalıdır.", ref: "4734 md.53" },
      { id: 331, sev: "U", title: "İdare Mahkemelerinde Dava Dilekçesi", desc: "Dava dilekçesi ve delil listesi düzenli olmalıdır.", ref: "4734 md.54" },
      { id: 332, sev: "U", title: "Danıştay İçtihadı Birleştirme", desc: "Danıştay içtihadı birleştirme kararları belirsizlikleri giderir.", ref: "4734 md.54" },
      { id: 333, sev: "U", title: "Kesinleşme ve Temyiz", desc: "İdare mahkemesi kararları kesinleşme ve temyiz/bozma süreçlerine tabidir.", ref: "4734 md.54" },
      { id: 334, sev: "U", title: "İhale Mevzuatındaki Değişiklikler", desc: "İhale mevzuatındaki değişiklikler yürürlük tarihi itibarıyla uygulanır.", ref: "4734 md.1" },
      { id: 335, sev: "U", title: "Geçiş Hükümleri", desc: "Geçiş hükümleri devam eden ihalelere etki edebilir.", ref: "4734 md.1" },
      { id: 336, sev: "U", title: "İhale Uyuşmazlıklarında Başvuru Sırası", desc: "Önce idari başvuru sonra yargı sırası önemlidir.", ref: "4734 md.53-54" },
      { id: 337, sev: "U", title: "İhalede Usul Güvenliği", desc: "Usul güvenliği yeniden ihale ve telafi usulleriyle sağlanabilir.", ref: "4734 md.43" },
      { id: 338, sev: "U", title: "İhale Kararının Düzeltilmesi", desc: "İhale kararının düzeltilmesi maddi hata ve usul hatalarında farklıdır.", ref: "4734 md.42" },
      { id: 339, sev: "U", title: "İhalede Rekabeti Kısıtlayan Anlaşmalar", desc: "Rekabeti kısıtlayan anlaşmalar rekabet hukuku açısından risk taşır.", ref: "4734 md.5" },
      { id: 340, sev: "U", title: "İstekliler Arasında Bilgi Alışverişi", desc: "Gizlilik ve adil rekabet ilkeleriyle sınırlıdır.", ref: "4734 md.5" },
      { id: 341, sev: "B", title: "Kamu İhale Kurulu Başvuru Süresi", desc: "Kurul başvurularında süre ve şekil şartları sıkıdır.", ref: "4734 md.53" },
      { id: 342, sev: "B", title: "Rekabet Kurumu İlişkisi", desc: "Rekabeti kısıtlayan ihale davranışları Rekabet Kurumu'na da bildirilebilir.", ref: "4054 sayılı RK" },
      { id: 343, sev: "B", title: "İhalede Sahte Belge", desc: "Sahte belge ve yanıltıcı beyanlar ağır yaptırımlara konu olur.", ref: "4734 md.11" },
      { id: 344, sev: "B", title: "Kara Liste Uygulamaları", desc: "Kara liste uygulamaları yasaklılık süreleriyle ilişkilidir.", ref: "4734 md.11" },
      { id: 345, sev: "B", title: "İhaleye Fesat Karıştırma", desc: "İhaleye fesat karıştırma suçları ceza hukukunda düzenlenir.", ref: "TCK md.235" },
      { id: 346, sev: "B", title: "Rüşvet ve İrtikap", desc: "Rüşvet ve irtikap iddiaları hem ceza hem idari süreçleri tetikler.", ref: "TCK md.252" },
      { id: 347, sev: "B", title: "İhale Komisyonu Tutanakları", desc: "Komisyon tutanakları yargıda delil niteliği taşır.", ref: "4734 md.9" },
      { id: 348, sev: "B", title: "Dijital İmza ve E-Tebligat", desc: "Dijital imza ve e-teklif sistemleri usul güvenliği için önemlidir.", ref: "4734 md.6" },
      { id: 349, sev: "B", title: "İhale İptali ve Zarar", desc: "İhale iptali halinde zararın giderilmesi talepleri idari yargıda görülür.", ref: "4734 md.43" },
      { id: 350, sev: "B", title: "Yürütmenin Durdurulması Şartları", desc: "Telafi edilemez zarar ve hukuka aykırılık ağırlığı şarttır.", ref: "4734 md.54" },
      { id: 351, sev: "B", title: "İhalede Şikayet Hakkı", desc: "Her isteklinin şikayet hakkı vardır; süreler sıkıdır.", ref: "4734 md.53" },
      { id: 352, sev: "B", title: "Kurul İnceleme Süreci", desc: "Kurul incelemeleri yazılı ve usule uygun olarak yürütülür.", ref: "4734 md.54" },
      { id: 353, sev: "B", title: "İdare Mahkemesi Yetkisi", desc: "İdare mahkemeleri ihale kararlarının iptalini denetler.", ref: "4734 md.54" },
      { id: 354, sev: "B", title: "Danıştay İçtihadı", desc: "Danıştay içtihadı ihale hukukunu şekillendirir.", ref: "4734 md.54" },
      { id: 355, sev: "B", title: "İhale Mevzuatı Takibi", desc: "Resmî Gazete'de yayımlanan değişiklikler düzenli takip edilmelidir.", ref: "4734 md.1" },
      { id: 356, sev: "B", title: "İhale Şikayetinde Süre Aşımı", desc: "Süre aşımı şikayet hakkını düşürür.", ref: "4734 md.53" },
      { id: 357, sev: "B", title: "Kurul Kararının Yerine Getirilmesi", desc: "Kurul kararları idareleri bağlar; uygulanmaması hukuki yaptırıma yol açar.", ref: "4734 md.54" },
      { id: 358, sev: "B", title: "İhale Usul İhlali ve Disiplin", desc: "İhale mevzuatı ihlalleri disiplin ve görevden uzaklaştırma süreçlerini doğurabilir.", ref: "4734 md.9" },
      { id: 359, sev: "B", title: "Kamu Görevlilerinin Yargılanması", desc: "Kamu görevlilerinin yargılanması CMK ve özel kanunlara tabidir.", ref: "CMK md.160" },
      { id: 360, sev: "B", title: "İhalede Delil Hukuku", desc: "İhale komisyonu tutanakları ve elektronik kayıtlar delil oluşturur.", ref: "4734 md.9" },
    ]
  },
  {
    id: 6, title: "İhale — Özel Haller", range: "361-400", color: "slate",
    icon: Building2,
    rules: [
      { id: 361, sev: "K", title: "4735 Yapım İşleri Özel Rejim", desc: "4735 sayılı Kanun yapım işlerinde anahtar teslimi usulü gibi özel rejimleri içerir.", ref: "4735 md.1" },
      { id: 362, sev: "K", title: "Yap-İşlet-Devret", desc: "Yap-işlet-devret ve benzeri modeller ayrı kanunlarla düzenlenir.", ref: "3996 sayılı Kanun" },
      { id: 363, sev: "K", title: "Kamu-Özel İşbirliği", desc: "Kamu-özel işbirliği projelerinde ihale ve sözleşme hukuku birlikte işler.", ref: "3359 sayılı Kanun" },
      { id: 364, sev: "K", title: "Çerçeve Anlaşmalar", desc: "Çerçeve anlaşmalar ve dinamik alım sistemleri özel düzenlemelere tabidir.", ref: "4734 md.3" },
      { id: 365, sev: "K", title: "Merkezî Alım ve Havuz Sistemleri", desc: "Merkezî alım ve havuz sistemleri idareler arası işbirliğini artırır.", ref: "4734 md.3" },
      { id: 366, sev: "U", title: "Danışmanlık Hizmetleri", desc: "Danışmanlık hizmetleri için özel usuller düzenlenmiştir.", ref: "4734 md.3" },
      { id: 367, sev: "U", title: "Yapım İşleri", desc: "Yapım işleri ile mal ve hizmet alımları farklı düzenleme ve eşiklere tabi olabilir.", ref: "4734 md.2" },
      { id: 368, sev: "U", title: "Mal Alımları", desc: "Mal alımları teslimat ve muayene kabulleri ayrıntılı düzenlenir.", ref: "4734 md.2" },
      { id: 369, sev: "U", title: "Hizmet Alımları", desc: "Hizmet alımlarında performans göstergeleri ve hizmet seviyesi anlaşmaları önemlidir.", ref: "4734 md.2" },
      { id: 370, sev: "U", title: "Kiralama ve Leasing", desc: "Kiralama ve leasing benzeri yapılar ihale konusu işin niteliğine göre seçilir.", ref: "4734 md.2" },
      { id: 371, sev: "U", title: "Danışmanlık ve Fikri Mülkiyet", desc: "Danışmanlık hizmetlerinde fikri mülkiyet ve gizlilik maddeleri önemlidir.", ref: "4734 md.10" },
      { id: 372, sev: "U", title: "Müşavirlik ve Kontrollük", desc: "Müşavirlik ve kontrollük hizmetleri yapım süreçlerinde çakışan rolleri önlemelidir.", ref: "4734 md.10" },
      { id: 373, sev: "U", title: "Bakım-Onarım Sözleşmeleri", desc: "Bakım-onarım sözleşmelerinde yedek parça temini ve hizmet süreleri kritiktir.", ref: "4734 md.2" },
      { id: 374, sev: "U", title: "4734 ve İstisna Halleri", desc: "İstisna ve muafiyet halleri kanunda sınırlı sayıda sayılır.", ref: "4734 md.3" },
      { id: 375, sev: "B", title: "İhalede Dijital Arşiv", desc: "Dijital arşiv ve e-imza doğrulama süreçleri denetim kolaylığı sağlar.", ref: "4734 md.6" },
      { id: 376, sev: "B", title: "Veri İşleme ve Alt İşleyen", desc: "Veri işleme ve alt işleyen ilişkileri KVKK açısından düzenlenmelidir.", ref: "6698 sayılı KVKK" },
      { id: 377, sev: "B", title: "İhalede Kişisel Veriler", desc: "İhale sürecinde kişisel verilerin işlenmesi KVKK'ya uygun olmalıdır.", ref: "6698 sayılı KVKK" },
      { id: 378, sev: "B", title: "İhale Mevzuatı Çalışma Yöntemi", desc: "Kanun, Cumhurbaşkanlığı kararnameleri ve tebliğleri birlikte okuyun.", ref: "" },
      { id: 379, sev: "B", title: "Resmî Gazete Takibi", desc: "Resmî Gazete'de yayımlanan değişiklikleri düzenli takip edin.", ref: "" },
      { id: 380, sev: "B", title: "İlke-İstisna-Sonuç Üçlüsü", desc: "Sınav için madde ezberinden çok ilke-istisna-sonuç üçlüsünü kurarak çalışın.", ref: "" },
      { id: 381, sev: "B", title: "İflas ve Yasaklılık", desc: "İflas, konkordato ve benzeri haller yasaklılık veya elenen durumlar oluşturabilir.", ref: "4734 md.11" },
      { id: 382, sev: "B", title: "Yüklenici Değişikliği", desc: "Yüklenici değişikliği sözleşme hükümlerine ve idare onayına tabidir.", ref: "4734 md.48" },
      { id: 383, sev: "B", title: "İş Güvenliği Koordinatörü", desc: "İş güvenliği koordinatörü gibi roller yapım işlerinde zorunlu olabilir.", ref: "4734 md.11" },
      { id: 384, sev: "B", title: "Çevre Etki Değerlendirmesi", desc: "Çevresel etki değerlendirmesi gerektiren projelerde ayrı izin süreçleri vardır.", ref: "2872 sayılı Çevre Kanunu" },
      { id: 385, sev: "B", title: "Kamu İhale Sözleşmesi Hukuku", desc: "Kamu ihale sözleşmesi özel hukuk unsurları taşısa da kamu hukuku bağları güçlüdür.", ref: "4734 md.47" },
      { id: 386, sev: "B", title: "Açık Eksiltme", desc: "Açık eksiltme ve ihale usulü farklı hukuki yapılardır.", ref: "4734 md.13" },
      { id: 387, sev: "B", title: "İhalede KVKK Uyumu", desc: "İhale sürecinde KVKK'ya uygun veri işleme esastır.", ref: "6698 sayılı KVKK" },
      { id: 388, sev: "B", title: "İhale Dokümanı Hiyerarşisi", desc: "İdari şartname, teknik şartname ve sözleşme arasında çelişki halinde hiyerarşi uygulanır.", ref: "4734 md.10" },
      { id: 389, sev: "B", title: "E-İhale Sistem Güvenliği", desc: "E-ihale sistemlerinde güvenlik ve veri bütünlüğü kritik öneme sahiptir.", ref: "4734 md.6" },
      { id: 390, sev: "B", title: "İhale ve Eşit Muamele", desc: "Rekabet ve eşit muamele kamu kaynaklarının kullanımında anayasal değerlerle uyumludur.", ref: "Anayasa md.10" },
      { id: 391, sev: "B", title: "Kamu Yararı ve İhale", desc: "Kamu yararı sınırlama ve kamulaştırmada merkezi kavramdır.", ref: "Anayasa md.46" },
      { id: 392, sev: "B", title: "Hukuk Devleti ve İhale", desc: "Hukuk devleti belirlilik ve öngörülebilirlik ister; ihale mevzuatı buna hizmet eder.", ref: "Anayasa md.2" },
      { id: 393, sev: "B", title: "İdarenin Hukuka Bağlılığı", desc: "İdarenin hukuka bağlılığı ilkesi tüm kamu ihale süreçlerinin üst ilkesidir.", ref: "Anayasa md.125" },
      { id: 394, sev: "B", title: "İyi İdare İlkeleri", desc: "İyi yönetim ilkeleri şeffaflık ve hesap verebilirlik idare hukukunun parçasıdır.", ref: "Anayasa md.125" },
      { id: 395, sev: "B", title: "İdarenin Takdir Yetkisi", desc: "İdarenin takdir yetkisi keyfilik ve ayrımcılık yasağıyla sınırlıdır.", ref: "Anayasa md.125" },
      { id: 396, sev: "B", title: "İdari İşlemlerde Gerekçe", desc: "İdari işlemlerde gerekçe gösterme yükümlülüğü yargı denetimini kolaylaştırır.", ref: "Anayasa md.125" },
      { id: 397, sev: "B", title: "Usul Ekonomisi", desc: "Usul ekonomisi yargı mercilerinde de gözetilir.", ref: "Anayasa md.36" },
      { id: 398, sev: "B", title: "Yargı Yolunun Etkinliği", desc: "Yargı yolunun etkinliği başvurunun sonuçlandırılması ve icra ile öçülür.", ref: "Anayasa md.40" },
      { id: 399, sev: "B", title: "Geçici Tedbirler", desc: "Geçici tedbirler temel haklara müdahalede sıkı denetime tabidir.", ref: "Anayasa md.15" },
      { id: 400, sev: "B", title: "KVKK ve Kamu İhaleleri", desc: "İhale sürecinde KVKK'ya uygun veri işleme; kişisel verilerin korunması esastır.", ref: "6698 sayılı KVKK" },
    ]
  },
];

export function Anayasa400() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState(1);
  const [search, setSearch] = useState("");

  const current = categories.find(c => c.id === activeCat) || categories[0];

  const filteredRules = search
    ? categories.flatMap(c => c.rules).filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.desc.toLowerCase().includes(search.toLowerCase()) ||
        r.ref?.toLowerCase().includes(search.toLowerCase())
      )
    : current.rules;

  const totalKritik = categories.flatMap(c => c.rules).filter(r => r.sev === "K").length;
  const totalUyari = categories.flatMap(c => c.rules).filter(r => r.sev === "U").length;
  const totalBilgi = categories.flatMap(c => c.rules).filter(r => r.sev === "B").length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Button variant="ghost" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6">
            <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Ana Sayfa
          </Button>
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-[20px] [background:var(--gradient-cta)] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-normal text-white mb-2">ihaleal.com — Platform ve KİK çerçevesi</h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              İlk blokta İhaleAL Nihai sistem + ücret/komisyon kuralları (koddaki fees ve MASTER_RULES özetleri);{" "}
              <strong className="text-slate-300">201–400</strong> aralığı 4734 sayılı Kanun hatırlatıcı maddeleridir.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-rose-400" /> Kritik: {totalKritik} madde</span>
              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-400" /> Uyarı: {totalUyari} madde</span>
              <span className="flex items-center gap-1"><Info className="w-3 h-3 text-cyan-400" /> Bilgi: {totalBilgi} madde</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Toplam:{" "}
                {categories.flatMap((c) => c.rules).length} madde
              </span>
            </div>
            <div className="mx-auto mt-6 max-w-3xl rounded-[20px] border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-start text-sm leading-relaxed text-cyan-50">
              <p className="font-normal text-cyan-100">Bu sayfa “ihaleal” kullanım sözleşmesi değildir</p>
              <p className="mt-2 text-slate-300">
                <strong className="text-slate-200">İlk kategori</strong>, depodaki{" "}
                <code className="text-cyan-200/90">NihaiAnayasa</code>, <code className="text-cyan-200/90">fees.ts</code>,{" "}
                <code className="text-cyan-200/90">masterFinancialEngine</code> ve komisyon motorundan türetilmiş platform kurallarının özetidir. Tam alt madde listesi için{" "}
                <Link to="/nihai-anayasa" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                  Nihai sistem anayasası
                </Link>{" "}
                sayfasına gidin.
              </p>
              <p className="mt-2 text-slate-400">
                Yasal şartlar:{" "}
                <Link to="/kullanim-kosullari" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                  Kullanım Koşulları
                </Link>
                {" · "}
                <Link to="/güvenlik" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                  Güvenlik
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6 max-w-md mx-auto">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Madde ara (başlık, açıklama, referans)..."
            className="bg-slate-900/50 border-slate-200 text-white ps-10"
          />
        </div>

        {/* Category Tabs */}
        {!search && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map(cat => {
              const Icon = cat.icon || Shield;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`px-4 py-2 rounded-[20px] text-sm font-normal transition-all flex items-center gap-2 ${
                    activeCat === cat.id
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.title} <span className="text-xs opacity-60">({cat.range})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Category Header */}
        {!search && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              {(() => {
                const Icon = current.icon || Shield;
                return <Icon className="w-5 h-5 text-blue-400" />;
              })()}
              <h2 className="text-xl font-normal text-white">{current.title}</h2>
              <span className="text-sm text-slate-500">{current.rules.length} madde</span>
            </div>
            <div className="h-px bg-white/10 w-full" />
          </div>
        )}

        {/* Rules */}
        <div className="space-y-3">
          {filteredRules.map((rule, i) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
              className="glass rounded-[20px] p-4 flex items-start gap-4"
            >
              <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${
                rule.sev === "K" ? "bg-rose-500/10" : rule.sev === "U" ? "bg-amber-500/10" : "bg-cyan-500/10"
              }`}>
                {rule.sev === "K" ? <AlertTriangle className="w-5 h-5 text-rose-400" /> :
                 rule.sev === "U" ? <AlertTriangle className="w-5 h-5 text-amber-400" /> :
                 <Info className="w-5 h-5 text-cyan-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-normal px-2 py-0.5 rounded-[3px] ${
                    rule.sev === "K" ? "bg-rose-500/20 text-rose-300" :
                    rule.sev === "U" ? "bg-amber-500/20 text-amber-300" :
                    "bg-cyan-500/20 text-cyan-300"
                  }`}>
                    {rule.sev === "K" ? "KRİTİK" : rule.sev === "U" ? "UYARI" : "BİLGİ"}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Madde {rule.id}</span>
                  {rule.ref && <span className="text-[10px] text-slate-600">{rule.ref}</span>}
                </div>
                <h3 className="text-sm font-normal text-white mb-1">{rule.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{rule.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRules.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>Arama kriterine uygun madde bulunamadı.</p>
          </div>
        )}

        <div className="mt-10 rounded-[20px] border border-slate-200 bg-white/[0.02] p-6 text-center">
          <p className="text-sm text-slate-400 mb-4">
            Üst kısım İhaleAL platform kurallarının özeti; madde numaraları 201–400 olan blok 4734 sayılı Kanun hatırlatıcılarıdır. Bağlayıcı metinler için kullanım koşulları ve güncel mevzuat esas alınmalıdır.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="border-slate-200 text-slate-300 hover:text-white">
            <ArrowLeft className="rtl:rotate-180 w-4 h-4 me-2" /> Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Anayasa400;
