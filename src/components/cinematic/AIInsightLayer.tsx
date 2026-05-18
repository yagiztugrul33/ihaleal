import { motion } from "framer-motion";
import { Brain, LineChart, Shield, Sparkles, Target, TrendingUp } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motionProps, staggerContainer, staggerItem } from "@/lib/motion/presets";

export type AIInsight = {
  id: string;
  title: string;
  body: string;
  confidence?: number;
  tone?: "positive" | "neutral" | "caution";
};

const toneStyles = {
  positive: "border-emerald-500/25 bg-emerald-500/10",
  neutral: "border-blue-500/25 bg-blue-500/10",
  caution: "border-amber-500/25 bg-amber-500/10",
};

const icons = [Sparkles, TrendingUp, Target, LineChart, Shield, Brain];

type AIInsightLayerProps = {
  insights: AIInsight[];
  title?: string;
  className?: string;
};

export function AIInsightLayer({
  insights,
  title = "Kurumsal zeka ozeti",
  className = "",
}: AIInsightLayerProps) {
  const reduced = useReducedMotion();
  const mp = motionProps(reduced);

  return (
    <motion.section
      className={`rounded-2xl border border-white/10 bg-gradient-to-br from-blue-950/40 to-[#081120]/80 p-5 sm:p-6 ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={reduced ? mp.staggerContainer : staggerContainer}
    >
      <motion.div variants={mp.staggerItem} className="flex items-center gap-2 mb-4">
        <motion.div
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10"
          animate={reduced ? undefined : { boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 24px rgba(34,211,238,0.15)", "0 0 0 rgba(34,211,238,0)"] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Brain className="w-4 h-4 text-cyan-300" aria-hidden />
        </motion.div>
        <motion.div variants={mp.staggerItem}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/90">AI intelligence</p>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </motion.div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((insight, i) => {
          const Icon = icons[i % icons.length];
          const tone = insight.tone ?? "neutral";
          return (
            <motion.article
              key={insight.id}
              variants={mp.staggerItem}
              className={`ai-insight-card relative overflow-hidden rounded-xl border p-4 ${toneStyles[tone]}`}
              whileHover={reduced ? undefined : { y: -2, transition: { duration: 0.2 } }}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" aria-hidden />
                <motion.div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{insight.body}</p>
                  {insight.confidence != null ? (
                    <div className="mt-3">
                      <motion.div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Guven</span>
                        <span className="text-cyan-300">{insight.confidence}%</span>
                      </motion.div>
                      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${insight.confidence}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </motion.section>
  );
}
