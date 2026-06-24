import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Filter } from "lucide-react"
import { useState } from "react"

type Status = "all" | "brouillon" | "envoyee" | "signee" | "expiree"

const STATUS_CONFIG: Record<string, { label: string; variant: "secondary" | "warning" | "success" | "outline" }> = {
  brouillon: { label: "Brouillon", variant: "secondary" },
  envoyee: { label: "Envoyée", variant: "warning" },
  signee: { label: "Signée", variant: "success" },
  expiree: { label: "Expirée", variant: "outline" },
}

const MOCK = [
  { id: 1, client: "SAS TechVision", type: "Comptable", date: "15/06/2026", status: "envoyee" },
  { id: 2, client: "EURL Dupont", type: "Social", date: "10/06/2026", status: "signee" },
  { id: 3, client: "SCI Les Oliviers", type: "Juridique", date: "01/06/2026", status: "brouillon" },
  { id: 4, client: "SARL Méditerranée", type: "Comptable", date: "28/05/2026", status: "envoyee" },
  { id: 5, client: "SAS InnoLab", type: "Comptable + Social", date: "20/05/2026", status: "expiree" },
]

const FILTERS: { value: Status; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "brouillon", label: "Brouillons" },
  { value: "envoyee", label: "Envoyées" },
  { value: "signee", label: "Signées" },
  { value: "expiree", label: "Expirées" },
]

export function LettresMissionPage() {
  const [filter, setFilter] = useState<Status>("all")
  const filtered = filter === "all" ? MOCK : MOCK.filter((i) => i.status === filter)

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-cr-gray-900">
        Lettres de mission
      </h1>
      <p className="mb-8 text-sm text-cr-gray-500">
        Suivi et renouvellement des lettres de mission
      </p>

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
              <th className="px-4 py-3">Type de mission</th>
              <th className="px-4 py-3">Date création</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const config = STATUS_CONFIG[item.status]
              return (
                <tr key={item.id} className="border-b border-cr-gray-100 last:border-0 hover:bg-cr-gray-50">
                  <td className="px-4 py-3 font-medium text-cr-gray-900">{item.client}</td>
                  <td className="px-4 py-3 text-cr-gray-600">{item.type}</td>
                  <td className="px-4 py-3 text-cr-gray-500">{item.date}</td>
                  <td className="px-4 py-3">
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm">
                      <Download size={14} />
                    </Button>
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
