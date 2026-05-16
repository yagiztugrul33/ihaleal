import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator, Banknote, Percent, Clock, Calendar, ChevronDown, TrendingUp, TrendingDown, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const INTEREST_RATES = {
  "12": 3.49, "24": 3.79, "36": 3.99, "60": 4.29, "120": 4.79, "180": 5.29, "240": 5.79
};

export default function Mortgage() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [propertyValue, setPropertyValue] = useState(5000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [termMonths, setTermMonths] = useState(120);
  const [interestRate, setInterestRate] = useState(INTEREST_RATES["120" as keyof typeof INTEREST_RATES]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const downPayment = Math.round((propertyValue * downPaymentPercent) / 100);
  const loanAmount = propertyValue - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = termMonths;

  const monthlyPayment = useMemo(() => {
    if (monthlyRate === 0) return loanAmount / numberOfPayments;
    return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }, [loanAmount, monthlyRate, numberOfPayments]);

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  // Generate amortization schedule (first 12 months + every 12th month)
  const amortizationData = useMemo(() => {
    const data = [];
    let remaining = loanAmount;
    let totalInterestPaid = 0;
    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = remaining * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remaining = Math.max(0, remaining - principalPayment);
      totalInterestPaid += interestPayment;

      if (month <= 12 || month % 12 === 0 || month === numberOfPayments) {
        data.push({
          month: month,
          year: Math.ceil(month / 12),
          payment: Math.round(monthlyPayment),
          principal: Math.round(principalPayment),
          interest: Math.round(interestPayment),
          remaining: Math.round(remaining),
          totalInterest: Math.round(totalInterestPaid),
        });
      }
    }
    return data;
  }, [loanAmount, monthlyRate, numberOfPayments, monthlyPayment]);

  const minIncomeRequired = monthlyPayment * 2.5; // Banks typically require 40% DTI ratio

  return (
    <div ref={ref} className="min-h-screen pt-24 pb-16 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2 mb-2">
            <ArrowLeft className="w-4 h-4" /> Geri
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Calculator className="w-8 h-8 text-blue-400" />
            Mortgage / Kredi Hesaplayici
          </h1>
          <p className="text-slate-400 mt-2">Gayrimenkul aliminda aylik taksit ve toplam maliyeti hesaplayin.</p>
        </div>

        <div className={`grid lg:grid-cols-5 gap-6 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {/* Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900/50 border-slate-200/80 p-5">
              <h3 className="font-bold text-white mb-5">Kredi Parametreleri</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block flex justify-between">
                    <span>Gayrimenkul Degeri</span>
                    <span className="text-white font-semibold">TRY {propertyValue.toLocaleString()}</span>
                  </label>
                  <Slider value={[propertyValue]} onValueChange={(v) => setPropertyValue(v[0])} min={500000} max={50000000} step={100000} className="my-3" />
                  <Input type="number" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} className="bg-slate-950 border-slate-200 text-white" />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block flex justify-between">
                    <span>Peşinat Orani</span>
                    <span className="text-white font-semibold">%{downPaymentPercent}</span>
                  </label>
                  <Slider value={[downPaymentPercent]} onValueChange={(v) => setDownPaymentPercent(v[0])} min={10} max={50} step={5} className="my-3" />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Peşinat: TRY {downPayment.toLocaleString()}</span>
                    <span>Kredi: TRY {loanAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Vade</label>
                  <select 
                    value={termMonths} 
                    onChange={(e) => {
                      const months = Number(e.target.value);
                      setTermMonths(months);
                      setInterestRate(INTEREST_RATES[months.toString() as keyof typeof INTEREST_RATES] || 5.0);
                    }} 
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-200 text-white text-sm"
                  >
                    <option value={12}>1 Yil (12 Ay)</option>
                    <option value={24}>2 Yil (24 Ay)</option>
                    <option value={36}>3 Yil (36 Ay)</option>
                    <option value={60}>5 Yil (60 Ay)</option>
                    <option value={120}>10 Yil (120 Ay)</option>
                    <option value={180}>15 Yil (180 Ay)</option>
                    <option value={240}>20 Yil (240 Ay)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block flex justify-between">
                    <span>Faiz Orani (Yillik)</span>
                    <span className="text-white font-semibold">%{interestRate}</span>
                  </label>
                  <Slider value={[interestRate * 100]} onValueChange={(v) => setInterestRate(v[0] / 100)} min={100} max={1500} step={5} className="my-3" />
                  <Input type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="bg-slate-950 border-slate-200 text-white" />
                </div>
              </div>
            </Card>

            {/* Bank Info */}
            <Card className="bg-slate-900/50 border-slate-200/80 p-5">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                Banka Gereksinimleri
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Min. Aylik Gelir</span>
                  <span className="text-amber-400 font-semibold">TRY {Math.round(minIncomeRequired).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peşinat Orani</span>
                  <span className="text-white">Min %20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kredi/Tapu Orani</span>
                  <span className="text-white">Max %80</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Main Results */}
            <Card className="bg-slate-900/50 border-slate-200/80 p-5">
              <h3 className="font-bold text-white mb-4">Kredi Ozeti</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ResultCard icon={<Banknote className="w-5 h-5 text-blue-400" />} label="Aylik Taksit" value={`TRY ${Math.round(monthlyPayment).toLocaleString()}`} sub="Duzgun odeme" color="text-blue-400" />
                <ResultCard icon={<Percent className="w-5 h-5 text-amber-400" />} label="Toplam Faiz" value={`TRY ${Math.round(totalInterest).toLocaleString()}`} sub={`%${((totalInterest / loanAmount) * 100).toFixed(1)} maliyet`} color="text-amber-400" />
                <ResultCard icon={<Clock className="w-5 h-5 text-emerald-400" />} label="Toplam Odeme" value={`TRY ${Math.round(totalPayment).toLocaleString()}`} sub={`${termMonths / 12} yil`} color="text-emerald-400" />
                <ResultCard icon={<Banknote className="w-5 h-5 text-violet-400" />} label="Kredi Tutari" value={`TRY ${loanAmount.toLocaleString()}`} sub={`%${downPaymentPercent} pesinat`} color="text-violet-400" />
              </div>
            </Card>

            {/* Amortization Graph */}
            <Card className="bg-slate-900/50 border-slate-200/80 p-5">
              <h3 className="text-lg font-bold text-white mb-4">Odeme Planı — Kalan Borc Grafiği</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={amortizationData}>
                    <defs>
                      <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickFormatter={(v) => `${v}.ay`} />
                    <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                      formatter={(value: number, name: string) => {
                        if (name === "Kalan Borc") return [`TRY ${value.toLocaleString()}`, name];
                        if (name === "Toplam Faiz") return [`TRY ${value.toLocaleString()}`, name];
                        return [value, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Area type="monotone" dataKey="remaining" name="Kalan Borc" stroke="#3b82f6" fill="url(#colorRemaining)" strokeWidth={2} />
                    <Area type="monotone" dataKey="totalInterest" name="Toplam Faiz" stroke="#f59e0b" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Yearly Breakdown Table */}
            <Card className="bg-slate-900/50 border-slate-200/80 overflow-hidden">
              <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                <h3 className="font-bold text-white">Yillik Odeme Ozeti</h3>
                <span className="text-xs text-slate-500">Her yil sonu</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/80">
                      <th className="text-left p-3 text-slate-400 font-medium">Yil</th>
                      <th className="text-right p-3 text-slate-400 font-medium">Aylik Taksit</th>
                      <th className="text-right p-3 text-slate-400 font-medium">Anapara</th>
                      <th className="text-right p-3 text-slate-400 font-medium">Faiz</th>
                      <th className="text-right p-3 text-slate-400 font-medium">Kalan Borc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationData.filter((_, i) => i % 2 === 0 || i === amortizationData.length - 1).map((row, idx) => (
                      <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="p-3 text-white font-medium">{row.year}. Yil</td>
                        <td className="p-3 text-right text-white">TRY {row.payment.toLocaleString()}</td>
                        <td className="p-3 text-right text-emerald-400">TRY {row.principal.toLocaleString()}</td>
                        <td className="p-3 text-right text-amber-400">TRY {row.interest.toLocaleString()}</td>
                        <td className="p-3 text-right text-blue-400">TRY {row.remaining.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Tips */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">Dusuk Faiz Ipuclari</span>
                </div>
                <p className="text-xs text-slate-400">Daha kisa vade secerseniz toplam faiz maliyeti duser. 10 yil yerine 5 yil vade ile yaklasik %40 daha az faiz odersiniz.</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-400">Pesinat Artirma</span>
                </div>
                <p className="text-xs text-slate-400">Pesinati %30a cikarmak aylik taksiti yaklasik %15 dusurur ve toplam faiz maliyetini %25 azaltir.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-8 text-center leading-relaxed">
          * Bu hesaplama bilgilendirme amaclidir. Gercek kredi kosullari bankaya ve kredi notunuza gore degisiklik gosterebilir.
        </p>
      </div>
    </div>
  );
}

function ResultCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-slate-200/80">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-slate-400">{label}</span></div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
    </div>
  );
}
