// Tasarim sistemi olcum harness'i — Playwright (Edge kanali).
//
// Ne olcer (her rota x iki gorunum: 1280 masaustu / 375 mobil):
//   darkPanels  : alani >4000px^2, aydinlik <0.25 olan ve vurgu rengi OLMAYAN,
//                 etkilesimli olmayan yuzeyler  -> "koyu panel" sayisi
//   vurguYuzey  : ayni esikteki vurgu (#1E40AF) yuzeyler ve buton/link'ler
//   gradients   : hesaplanmis background-image'inda gradyan bulunan ogeler
//   hardcoded   : satir ici style'inda ham renk (#hex / rgb) tasiyan ogeler
//   aaFails     : WCAG 2.1 AA kontrast esigini gecemeyen metin ogeleri
//                 (4.5:1; buyuk metinde 3:1). Zemin, saydam katmanlar
//                 harmanlanarak hesaplanir.
//   overflow    : documentElement.scrollWidth - clientWidth (yatay tasma)
//   tiklaAc     : details / aria-expanded / data-state olan ogeler
//   textLen     : body.innerText uzunlugu — icerik kaybi kontrolu icin
//
// Kullanim:
//   BASE=http://localhost:4173 ROUTES=/,/ilanlar OUT=olcum.json node scripts/tasarim-olcum.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:5175';
const OUT = process.env.OUT || 'olcum.json';
const ROUTES = (process.env.ROUTES || '/,/ilanlar,/ihaleler,/arama,/nasil-calisir,/kurumsal,/sss,/giris,/mortgage,/degerleme,/rehber,/sehirler').split(',');

const AUDIT = `(()=>{
function srgb(c){c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);}
function lum(r,g,b){return 0.2126*srgb(r)+0.7152*srgb(g)+0.0722*srgb(b);}
function parse(s){const m=(s||'').match(/rgba?\\(([^)]+)\\)/);if(!m)return null;const p=m[1].split(/[,\\s\\/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};}
function blend(f,b){const a=f.a;return {r:f.r*a+b.r*(1-a),g:f.g*a+b.g*(1-a),b:f.b*a+b.b*(1-a),a:1};}
function effBg(el){let n=el,acc=null;while(n&&n.nodeType===1){const c=parse(getComputedStyle(n).backgroundColor);if(c&&c.a>0){acc=acc?blend(acc,c):c;if(acc.a>=1)return acc;}n=n.parentElement;}
 return acc?blend(acc,{r:255,g:255,b:255,a:1}):{r:255,g:255,b:255,a:1};}
function ratio(a,b){const l1=lum(a.r,a.g,a.b),l2=lum(b.r,b.g,b.b);const hi=Math.max(l1,l2),lo=Math.min(l1,l2);return (hi+0.05)/(lo+0.05);}
const all=[...document.querySelectorAll('body *')];
let darkPanels=0,gradients=0,aa=[],dark=[],vurguYuzey=0,hardcoded=0;
const etkilesim=(el)=>el.matches('button,a,[role="button"],input,select,textarea,label')||el.closest('button,a,[role="button"]');
for(const el of all){
 const cs=getComputedStyle(el);
 if(cs.display==='none'||cs.visibility==='hidden'||cs.opacity==='0')continue;
 const r=el.getBoundingClientRect();
 if(cs.backgroundImage&&cs.backgroundImage.includes('gradient'))gradients++;
 if(el.getAttribute('style')&&/#[0-9a-f]{3,8}|rgba?\\(/i.test(el.getAttribute('style')))hardcoded++;
 const bc=parse(cs.backgroundColor);
 if(bc&&bc.a>0.5&&r.width*r.height>4000){
  const L=lum(bc.r,bc.g,bc.b);
  const vurgudur=Math.abs(bc.r-30)<6&&Math.abs(bc.g-64)<6&&Math.abs(bc.b-175)<6;
  if(L<0.25){
   if(vurgudur||etkilesim(el))vurguYuzey++;
   else{darkPanels++;if(dark.length<8)dark.push(el.tagName+'|'+String(el.className).slice(0,45)+'|'+cs.backgroundColor);}
  }
 }
 const hasText=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1);
 if(hasText&&r.width>0&&r.height>0){
  const fg=parse(cs.color);if(!fg)continue;
  const bg=effBg(el);const fgb=fg.a<1?blend(fg,bg):fg;
  const cr=ratio(fgb,bg);
  const size=parseFloat(cs.fontSize);const bold=parseInt(cs.fontWeight)>=700;
  const large=size>=24||(size>=18.66&&bold);
  const need=large?3:4.5;
  if(cr<need-0.05)aa.push({t:el.tagName,c:String(el.className).slice(0,45),txt:(el.textContent||'').trim().slice(0,28),cr:+cr.toFixed(2),need});
 }
}
const de=document.documentElement;
const over=de.scrollWidth-de.clientWidth;
let offenders=[];
if(over>0){for(const el of all){const r=el.getBoundingClientRect();if(r.right>de.clientWidth+1){offenders.push(el.tagName+'|'+String(el.className).slice(0,45)+'|r='+Math.round(r.right));if(offenders.length>7)break;}}}
const tiklaAc=document.querySelectorAll('details,[aria-expanded],[data-state="open"],[data-state="closed"]').length;
const bolum=document.querySelectorAll('main section, main > div > section, section').length;
const iskelet=document.querySelectorAll('.skeleton-shimmer,[class*="animate-pulse"]').length;
const bosDurum=document.querySelectorAll('.empty-state').length;
return {darkPanels,vurguYuzey,hardcoded,tiklaAc,bolum,iskelet,bosDurum,darkTop:dark,gradients,aaFails:aa.length,aaTop:aa.slice(0,10),overflow:over,offenders,nodes:all.length,textLen:(document.body.innerText||'').length};
})()`;

const browser = await chromium.launch({ channel: 'msedge' });
const results = {};
for (const vp of [{ w: 1280, h: 900, n: 'desktop' }, { w: 375, h: 812, n: 'mobil' }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', () => {});
  for (const r of ROUTES) {
    try {
      await page.goto(BASE + r, { waitUntil: 'networkidle', timeout: 45000 });
    } catch { try { await page.goto(BASE + r, { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch {} }
    await page.waitForTimeout(1200);
    let m;
    try { m = await page.evaluate(AUDIT); } catch (e) { m = { error: String(e).slice(0, 120) }; }
    results[vp.n] = results[vp.n] || {};
    results[vp.n][r] = m;
    console.log(vp.n, r, JSON.stringify({ d: m.darkPanels, v: m.vurguYuzey, g: m.gradients, hc: m.hardcoded, aa: m.aaFails, ta: m.tiklaAc, bl: m.bolum, ov: m.overflow, len: m.textLen }));
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
console.log('YAZILDI', OUT);
