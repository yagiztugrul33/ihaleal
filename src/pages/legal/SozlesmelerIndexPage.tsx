import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { CONTRACT_TEMPLATES } from "@/data/contractTemplates";

export default function SozlesmelerIndexPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-3xl font-bold text-white">Sozlesme sablonlari</h1>
        <ul className="space-y-3">
          {CONTRACT_TEMPLATES.map((c) => (
            <li key={c.slug}>
              <Link to={"/yasal/sozlesmeler/" + c.slug} className="flex gap-3 rounded-xl border border-white/10 p-4 text-white">
                <FileText className="h-5 w-5 text-teal-400" />
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}