import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Filter } from "lucide-react"

type Status = "all" | "draft" | "submitted" | "processed"

const STATUS_CONFIG: Record<string, { label: string; variant: "secondary" | "warning" | "success" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  submitted: { label: "Soumis", variant: "warning" },
  processed: { label: "Traité", variant: "success" },
}

const MOCK_ITEMS = [
  { id: 1, client: "SAS TechVision", prestation: "Constitution de société", montant: 1200, saisiPar: "D. Conseil", periode: "Juin 2026", status: "submitted" },
  { id: 2, client: "EURL Dupont", prestation: "Modification statutaire", montant: 450, saisiPar: "M. Associé", periode: "Juin 2026", status: "draft" },
  { id: 3, client: "SCI Les Oliviers", prestation: "Assemblée générale", montant: 800, saisiPar: "D. Conseil", periode: "Mai 2026", status: "processed" },
  { id: 4, client: "SARL Méditerranée", prestation: "Cession de parts", montant: 650, saisiPar: "P. Manager", periode: "Juin 2026", status: "submitted" },
  { id: 5, client: "SAS InnoLab", prestation: "Augmentation de capital", montant: 900, saisiPar: "M. Associé", periode: "Juin 2026", status: "submitted" },
]

const FILTERS: { value: Status; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillons" },
  { value: "submitted", label: "Soumis" },
  { value: "processed", label: "Traités" },
]

export function FacturationPage() {
  const [filter, setFilter] = useState<Status>("all")

  const filtered = filter === "all"
    ? MOCK_ITEMS
    : MOCK_ITEMS.filter((i) => i.status === filter)

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-cr-gray-900">
            Facturation exceptionnelle
          </h1>
          <p className="mt-1 text-sm text-cr-gray-500">
            Déclarer et suivre les éléments hors forfait
          </p>
        </div>
        <Button>
          <Plus size={16} />
          Nouveau
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <Filter size={14} className="text-cr-gray-400" />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-cr-gray-900 text-white"
                : "text-cr-gray-500 hover:bg-cr-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-cr-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cr-gray-100 bg-cr-gray-50 text-left text-xs font-medium text-cr-gray-500">
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Prestation</th>
              <th className="px-4 py-3 text-right">Montant HT</th>
              <th className="px-4 py-3">Saisi par</th>
              <th className="px-4 py-3">Période</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const config = STATUS_CONFIG[item.status]
              return (
                <tr
                  key={item.id}
                  className="border-b border-cr-gray-100 transition-colors last:border-0 hover:bg-cr-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-cr-gray-900">{item.client}</td>
                  <td className="px-4 py-3 text-cr-gray-600">{item.prestation}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-cr-gray-900">
                    {item.montant.toLocaleString("fr-FR")} €
                  </td>
                  <td className="px-4 py-3 text-cr-gray-500">{item.saisiPar}</td>
                  <td className="px-4 py-3 text-cr-gray-500">{item.periode}</td>
                  <td className="px-4 py-3">
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
