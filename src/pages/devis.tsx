import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Users, Scale, Plus, Trash2 } from "lucide-react"

type Tab = "comptable" | "social" | "juridique"

const TABS: { value: Tab; label: string; icon: typeof FileText }[] = [
  { value: "comptable", label: "Comptable", icon: FileText },
  { value: "social", label: "Social", icon: Users },
  { value: "juridique", label: "Juridique", icon: Scale },
]

function MissionRow({ name, montant, onRemove }: { name: string; montant: number; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-cr-gray-200 bg-white px-4 py-3">
      <input
        defaultValue={name}
        className="flex-1 bg-transparent text-sm text-cr-gray-900 outline-none placeholder:text-cr-gray-400"
        placeholder="Nom de la mission"
      />
      <input
        defaultValue={montant || ""}
        type="number"
        className="w-28 rounded-md border border-cr-gray-200 bg-cr-gray-50 px-3 py-1.5 text-right text-sm tabular-nums text-cr-gray-900 outline-none focus:border-cr-red"
        placeholder="0"
      />
      <span className="text-xs text-cr-gray-400">€/mois</span>
      <button onClick={onRemove} className="text-cr-gray-400 hover:text-cr-red">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function ComptableTab() {
  const [missions, setMissions] = useState([
    { id: 1, name: "Tenue de la comptabilité", montant: 250 },
    { id: 2, name: "Frais administratifs", montant: 50 },
  ])

  const addMission = () =>
    setMissions([...missions, { id: Date.now(), name: "", montant: 0 }])
  const removeMission = (id: number) =>
    setMissions(missions.filter((m) => m.id !== id))

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
          <div className="h-4 w-0.5 rounded-full bg-cr-red" />
          Client
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {["Civilité", "Nom du dirigeant", "Raison sociale", "Adresse", "Code postal", "Ville"].map((label) => (
            <div key={label}>
              <label className="mb-1 block text-xs font-medium text-cr-gray-500">{label} <span className="text-cr-red">*</span></label>
              <input className="w-full rounded-lg border border-cr-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-cr-red" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
          <div className="h-4 w-0.5 rounded-full bg-cr-red" />
          Missions
        </h3>
        <div className="space-y-2">
          {missions.map((m) => (
            <MissionRow key={m.id} name={m.name} montant={m.montant} onRemove={() => removeMission(m.id)} />
          ))}
        </div>
        <button
          onClick={addMission}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-cr-red hover:text-cr-red-dark"
        >
          <Plus size={14} />
          Ajouter une mission
        </button>
      </section>

      <div className="flex items-center justify-between rounded-xl bg-cr-red-light px-6 py-4">
        <span className="text-sm font-medium text-cr-gray-700">Total mensuel HT</span>
        <span className="text-xl font-semibold tabular-nums text-cr-red">
          {missions.reduce((s, m) => s + m.montant, 0).toLocaleString("fr-FR")} €
        </span>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Aperçu PDF</Button>
        <Button>Générer le devis</Button>
      </div>
    </div>
  )
}

function SocialTab() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
          <div className="h-4 w-0.5 rounded-full bg-cr-red" />
          Bulletins de paie mensuels
        </h3>
        <div className="space-y-2">
          {[
            { label: "1 salarié", price: "32 €/bulletin" },
            { label: "2 à 5 salariés", price: "28 €/bulletin" },
            { label: "6 à 9 salariés", price: "24 €/bulletin" },
            { label: "10 à 19 salariés", price: "22 €/bulletin" },
            { label: "+ de 20 salariés", price: "Sur devis" },
          ].map((opt) => (
            <label key={opt.label} className="flex cursor-pointer items-center justify-between rounded-lg border border-cr-gray-200 bg-white px-4 py-3 transition-colors hover:border-cr-gray-300">
              <div className="flex items-center gap-3">
                <input type="radio" name="bulletins" className="accent-cr-red" />
                <span className="text-sm text-cr-gray-900">{opt.label}</span>
              </div>
              <span className="text-sm font-medium tabular-nums text-cr-gray-600">{opt.price}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
          <div className="h-4 w-0.5 rounded-full bg-cr-red" />
          Missions ponctuelles paie
        </h3>
        <div className="space-y-2">
          {[
            { label: "DPAE", price: "10 €" },
            { label: "CDD", price: "100 €" },
            { label: "CDI", price: "100 €" },
            { label: "Avenant à un contrat de travail", price: "50 €" },
            { label: "Rupture conventionnelle", price: "375 €" },
            { label: "Solde de tout compte", price: "50 €" },
          ].map((opt) => (
            <label key={opt.label} className="flex cursor-pointer items-center justify-between rounded-lg border border-cr-gray-200 bg-white px-4 py-3 transition-colors hover:border-cr-gray-300">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="accent-cr-red" />
                <span className="text-sm text-cr-gray-900">{opt.label}</span>
              </div>
              <span className="text-sm font-medium tabular-nums text-cr-gray-600">{opt.price}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Aperçu PDF</Button>
        <Button>Générer le devis</Button>
      </div>
    </div>
  )
}

function JuridiqueTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Scale size={40} className="mb-4 text-cr-gray-300" />
      <p className="text-sm text-cr-gray-500">
        Les missions juridiques font l'objet de lettres de mission, pas de devis.
      </p>
      <Button variant="outline" className="mt-4">
        Voir les lettres de mission
      </Button>
    </div>
  )
}

export function DevisPage() {
  const [tab, setTab] = useState<Tab>("comptable")

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-cr-gray-900">
        Génération de devis
      </h1>
      <p className="mb-8 text-sm text-cr-gray-500">
        Créer un devis comptable, social ou juridique
      </p>

      <div className="mb-8 flex gap-1 rounded-lg bg-cr-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              tab === t.value
                ? "bg-white text-cr-gray-900 shadow-sm"
                : "text-cr-gray-500 hover:text-cr-gray-700"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "comptable" && <ComptableTab />}
      {tab === "social" && <SocialTab />}
      {tab === "juridique" && <JuridiqueTab />}
    </div>
  )
}
