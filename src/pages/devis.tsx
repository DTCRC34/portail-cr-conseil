import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Users, Scale, Plus, Trash2, Loader2 } from "lucide-react"
import { generateDevisPdf } from "@/lib/generate-devis-pdf"

type Tab = "comptable" | "social" | "juridique"

const TABS: { value: Tab; label: string; icon: typeof FileText }[] = [
  { value: "comptable", label: "Comptable", icon: FileText },
  { value: "social", label: "Social", icon: Users },
  { value: "juridique", label: "Juridique", icon: Scale },
]

const inputClass =
  "w-full rounded-lg border border-cr-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-cr-red"
const selectClass = inputClass

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-cr-gray-500">
        {label} {required && <span className="text-cr-red">*</span>}
      </label>
      {children}
    </div>
  )
}

function ClientFields({ state }: { state: ReturnType<typeof useClientState> }) {
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
        <div className="h-4 w-0.5 rounded-full bg-cr-red" />
        Client
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Civilité" required>
          <select value={state.civilite} onChange={(e) => state.setCivilite(e.target.value)} className={selectClass}>
            <option value="M.">M.</option>
            <option value="Mme">Mme</option>
          </select>
        </Field>
        <Field label="Raison sociale" required>
          <input value={state.raisonSociale} onChange={(e) => state.setRaisonSociale(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Nom du dirigeant" required>
          <input value={state.nom} onChange={(e) => state.setNom(e.target.value.toUpperCase())} className={inputClass} placeholder="NOM" />
        </Field>
        <Field label="Prénom" required>
          <input value={state.prenom} onChange={(e) => state.setPrenom(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Adresse" required>
          <input value={state.adresse} onChange={(e) => state.setAdresse(e.target.value)} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Code postal" required>
            <input value={state.codePostal} onChange={(e) => state.setCodePostal(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Ville" required>
            <input value={state.ville} onChange={(e) => state.setVille(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </div>
    </section>
  )
}

function useClientState() {
  const [civilite, setCivilite] = useState("M.")
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [raisonSociale, setRaisonSociale] = useState("")
  const [adresse, setAdresse] = useState("")
  const [codePostal, setCodePostal] = useState("")
  const [ville, setVille] = useState("")
  return { civilite, setCivilite, nom, setNom, prenom, setPrenom, raisonSociale, setRaisonSociale, adresse, setAdresse, codePostal, setCodePostal, ville, setVille }
}

// ─── COMPTABLE ───

const DEFAULT_MISSIONS = [
  { id: 1, name: "Tenue de la comptabilité", montant: 0 },
  { id: 2, name: "Juridique annuel", montant: 0 },
  { id: 3, name: "ECF", montant: 0 },
  { id: 4, name: "Plateforme agréée", montant: 0 },
  { id: 5, name: "Frais administratifs", montant: 0 },
]

function ComptableTab() {
  const client = useClientState()
  const [activite, setActivite] = useState("")
  const [caAnnuel, setCaAnnuel] = useState("")
  const [formeJuridique, setFormeJuridique] = useState("")
  const [regimeTva, setRegimeTva] = useState("")
  const [dateDebutMission, setDateDebutMission] = useState("")
  const [dateFinExercice, setDateFinExercice] = useState("")
  const [missions, setMissions] = useState(DEFAULT_MISSIONS.map(m => ({ ...m })))
  const [annexerGrilleSociale, setAnnexerGrilleSociale] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handlePreview = useCallback(async () => {
    setGenerating(true)
    try {
      const doc = await generateDevisPdf({
        type: "comptable",
        ...client, activite, caAnnuel, formeJuridique, regimeTva,
        dateDebutMission, dateFinExercice, annexerGrilleSociale,
        missions: missions.map(m => ({ name: m.name, montant: m.montant })),
      })
      window.open(URL.createObjectURL(doc.output("blob")), "_blank")
    } finally { setGenerating(false) }
  }, [client, activite, caAnnuel, formeJuridique, regimeTva, dateDebutMission, dateFinExercice, missions, annexerGrilleSociale])

  const addMission = () => setMissions([...missions, { id: Date.now(), name: "", montant: 0 }])
  const removeMission = (id: number) => setMissions(missions.filter(m => m.id !== id))
  const updateMission = (id: number, field: "name" | "montant", value: string) => {
    setMissions(missions.map(m => m.id === id ? { ...m, [field]: field === "montant" ? Number(value) || 0 : value } : m))
  }
  const totalHT = missions.reduce((s, m) => s + m.montant, 0)
  const caDisplay = caAnnuel.replace(/\s*€?\s*$/, "")

  return (
    <div className="space-y-8">
      <ClientFields state={client} />

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
          <div className="h-4 w-0.5 rounded-full bg-cr-red" />
          Entreprise
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Activité de l'entreprise" required>
            <input value={activite} onChange={e => setActivite(e.target.value)} className={inputClass} />
          </Field>
          <Field label="CA annuel estimé" required>
            <div className="relative">
              <input value={caAnnuel} onChange={e => setCaAnnuel(e.target.value)} className={inputClass + " pr-8"} placeholder="ex : 54K" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cr-gray-400">€</span>
            </div>
            {caDisplay && <p className="mt-1 text-xs text-cr-gray-400">Affiché : {caDisplay} €</p>}
          </Field>
          <Field label="Forme juridique">
            <select value={formeJuridique} onChange={e => setFormeJuridique(e.target.value)} className={selectClass}>
              <option value="">Sélectionner</option>
              <option>Entreprise individuelle</option><option>SARL</option><option>SAS</option><option>SASU</option><option>EURL</option><option>SCI</option><option>Autre</option>
            </select>
          </Field>
          <Field label="Régime TVA" required>
            <select value={regimeTva} onChange={e => setRegimeTva(e.target.value)} className={selectClass}>
              <option value="">Sélectionner</option>
              <option>Mensuel</option><option>Trimestriel</option><option>Annuel</option><option>Franchise en base</option>
            </select>
          </Field>
          <Field label="Date de début de mission" required>
            <input type="date" value={dateDebutMission} onChange={e => setDateDebutMission(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Date de fin du 1er exercice" required>
            <input type="date" value={dateFinExercice} onChange={e => setDateFinExercice(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
          <div className="h-4 w-0.5 rounded-full bg-cr-red" />
          Missions
        </h3>
        <div className="space-y-2">
          {missions.map(m => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border border-cr-gray-200 bg-white px-4 py-3">
              <input value={m.name} onChange={e => updateMission(m.id, "name", e.target.value)} className="flex-1 bg-transparent text-sm text-cr-gray-900 outline-none placeholder:text-cr-gray-400" placeholder="Nom de la mission" />
              <input value={m.montant || ""} onChange={e => updateMission(m.id, "montant", e.target.value)} type="number" className="w-28 rounded-md border border-cr-gray-200 bg-cr-gray-50 px-3 py-1.5 text-right text-sm tabular-nums text-cr-gray-900 outline-none focus:border-cr-red" placeholder="0" />
              <span className="text-xs text-cr-gray-400">€/mois</span>
              <button onClick={() => removeMission(m.id)} className="text-cr-gray-400 hover:text-cr-red"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <button onClick={addMission} className="mt-3 flex items-center gap-1.5 text-sm font-medium text-cr-red hover:text-cr-red-dark">
          <Plus size={14} /> Ajouter une mission
        </button>
      </section>

      <div className="flex items-center justify-between rounded-xl bg-cr-red-light px-6 py-4">
        <span className="text-sm font-medium text-cr-gray-700">Total mensuel HT</span>
        <span className="text-xl font-semibold tabular-nums text-cr-red">{totalHT.toLocaleString("fr-FR")} €</span>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-cr-gray-200 bg-white px-4 py-3 transition-colors hover:border-cr-gray-300">
        <input type="checkbox" checked={annexerGrilleSociale} onChange={e => setAnnexerGrilleSociale(e.target.checked)} className="accent-cr-red" />
        <div>
          <span className="text-sm font-medium text-cr-gray-900">Ajouter la grille tarifaire du pôle social</span>
          <p className="text-xs text-cr-gray-500">Annexe au PDF les tarifs des prestations sociales 2025</p>
        </div>
      </label>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handlePreview} disabled={generating}>
          {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          Aperçu PDF
        </Button>
        <Button>Générer le devis</Button>
      </div>
    </div>
  )
}

// ─── SOCIAL ───

interface SocialCatalogItem {
  label: string
  price: string
  numericPrice: number | null
}

interface SocialSection {
  title: string
  type: "radio" | "checkbox"
  items: SocialCatalogItem[]
}

const SOCIAL_CATALOG: SocialSection[] = [
  {
    title: "Bulletins de paie mensuels",
    type: "radio",
    items: [
      { label: "1 salarié — 32 €/bulletin", price: "32 € HT", numericPrice: 32 },
      { label: "2 à 5 salariés — 28 €/bulletin", price: "28 € HT", numericPrice: 28 },
      { label: "6 à 9 salariés — 24 €/bulletin", price: "24 € HT", numericPrice: 24 },
      { label: "10 à 19 salariés — 22 €/bulletin", price: "22 € HT", numericPrice: 22 },
      { label: "+ de 20 salariés — Sur devis", price: "Sur devis", numericPrice: null },
    ],
  },
  {
    title: "Paramétrage dossier de paie",
    type: "radio",
    items: [
      { label: "1 à 2 salariés — Annuel — 50 €", price: "50 € HT", numericPrice: 50 },
      { label: "1 à 2 salariés — Reprise — 95 €", price: "95 € HT", numericPrice: 95 },
      { label: "3 à 5 salariés — Annuel — 70 €", price: "70 € HT", numericPrice: 70 },
      { label: "3 à 5 salariés — Reprise — 140 €", price: "140 € HT", numericPrice: 140 },
      { label: "6 à 10 salariés — Annuel — 95 €", price: "95 € HT", numericPrice: 95 },
      { label: "6 à 10 salariés — Reprise — 195 €", price: "195 € HT", numericPrice: 195 },
      { label: "+ de 20 salariés — Annuel — 120 €", price: "120 € HT", numericPrice: 120 },
      { label: "+ de 20 salariés — Reprise — Sur devis", price: "Sur devis", numericPrice: null },
    ],
  },
  {
    title: "Missions ponctuelles paie",
    type: "checkbox",
    items: [
      { label: "DPAE", price: "10 €", numericPrice: 10 },
      { label: "CDD", price: "100 €", numericPrice: 100 },
      { label: "CDI", price: "100 €", numericPrice: 100 },
      { label: "CDI ou CDD avec clauses spécifiques", price: "Sur devis", numericPrice: null },
      { label: "Avenant à un contrat de travail", price: "50 €", numericPrice: 50 },
      { label: "Simulation bulletin de salaire", price: "15 €", numericPrice: 15 },
      { label: "Procédures disciplinaires", price: "Sur devis", numericPrice: null },
      { label: "Procédures licenciements", price: "Sur devis", numericPrice: null },
      { label: "Rupture conventionnelle", price: "375 €", numericPrice: 375 },
      { label: "Déclaration arrêt maladie", price: "30 €", numericPrice: 30 },
      { label: "Déclaration accident de travail", price: "40 €", numericPrice: 40 },
      { label: "Solde de tout compte", price: "50 €", numericPrice: 50 },
      { label: "Décision unilatérale employeur : Prime PPV", price: "Sur devis", numericPrice: null },
      { label: "Contrôle URSSAF sur pièces", price: "300 €", numericPrice: 300 },
      { label: "Contrôle URSSAF sur place (< 6 sal.)", price: "450 €", numericPrice: 450 },
      { label: "Contrôle URSSAF sur place (≥ 6 sal.)", price: "Sur devis", numericPrice: null },
    ],
  },
  {
    title: "Adhésions",
    type: "checkbox",
    items: [
      { label: "Adhésion mutuelle et paramétrage", price: "50 €", numericPrice: 50 },
      { label: "Adhésion prévoyance et paramétrage", price: "50 €", numericPrice: 50 },
      { label: "Adhésion médecine du travail", price: "25 €", numericPrice: 25 },
      { label: "Forfait adhésion organismes secteur bâtiment", price: "100 €", numericPrice: 100 },
    ],
  },
  {
    title: "Missions exceptionnelles RH",
    type: "checkbox",
    items: [
      { label: "MySilae + Accès coffre fort numérique", price: "2 € / bulletin", numericPrice: null },
      { label: "Paiement salaires : envoi fichier prélèvement", price: "2 € HT/mois", numericPrice: null },
      { label: "Hotline droit social", price: "100 € HT/h", numericPrice: null },
      { label: "Convention transfert", price: "250 €", numericPrice: 250 },
      { label: "Audit RH et/ou social", price: "Sur devis", numericPrice: null },
      { label: "Charte télétravail", price: "400 €", numericPrice: 400 },
      { label: "Accord d'entreprise", price: "Sur devis", numericPrice: null },
      { label: "Règlement intérieur", price: "750 €", numericPrice: 750 },
      { label: "Mise en place TR carte (DUE + paramétrage)", price: "300 €", numericPrice: 300 },
      { label: "Mise en place TR papier (DUE + paramétrage)", price: "200 €", numericPrice: 200 },
      { label: "Entretien annuel", price: "800 €", numericPrice: 800 },
      { label: "Convention MAD + avenant", price: "300 €", numericPrice: 300 },
      { label: "Fiches de poste", price: "Sur devis", numericPrice: null },
      { label: "Aide à l'affichage obligatoire", price: "150 €", numericPrice: 150 },
      { label: "Accompagnement DUERP", price: "Sur devis", numericPrice: null },
    ],
  },
]

function SocialTab() {
  const client = useClientState()
  const [activite, setActivite] = useState("")
  const [nombreSalaries, setNombreSalaries] = useState("")
  const [dateDebutMission, setDateDebutMission] = useState("")
  const [generating, setGenerating] = useState(false)

  const [selections, setSelections] = useState<Record<string, Set<number>>>(() => {
    const init: Record<string, Set<number>> = {}
    SOCIAL_CATALOG.forEach(s => { init[s.title] = new Set() })
    return init
  })

  const toggleItem = (sectionTitle: string, idx: number, type: "radio" | "checkbox") => {
    setSelections(prev => {
      const next = { ...prev }
      const set = new Set(prev[sectionTitle])
      if (type === "radio") {
        set.clear()
        set.add(idx)
      } else {
        if (set.has(idx)) set.delete(idx); else set.add(idx)
      }
      next[sectionTitle] = set
      return next
    })
  }

  const selectedMissions = SOCIAL_CATALOG.flatMap(section =>
    Array.from(selections[section.title] || []).map(idx => {
      const item = section.items[idx]
      return { name: item.label, montant: item.numericPrice }
    })
  )

  const handlePreview = useCallback(async () => {
    setGenerating(true)
    try {
      const doc = await generateDevisPdf({
        type: "social",
        ...client, activite, nombreSalaries, dateDebutMission,
        missions: selectedMissions,
      })
      window.open(URL.createObjectURL(doc.output("blob")), "_blank")
    } finally { setGenerating(false) }
  }, [client, activite, nombreSalaries, dateDebutMission, selectedMissions])

  return (
    <div className="space-y-8">
      <ClientFields state={client} />

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
          <div className="h-4 w-0.5 rounded-full bg-cr-red" />
          Entreprise
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Activité de l'entreprise" required>
            <input value={activite} onChange={e => setActivite(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Nombre de salariés" required>
            <input value={nombreSalaries} onChange={e => setNombreSalaries(e.target.value)} className={inputClass} placeholder="ex : 3" />
          </Field>
          <Field label="Date de début de mission" required>
            <input type="date" value={dateDebutMission} onChange={e => setDateDebutMission(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
          <div className="h-4 w-0.5 rounded-full bg-cr-red" />
          Missions
        </h3>

        {SOCIAL_CATALOG.map(section => (
          <div key={section.title} className="mb-6">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-cr-gray-400">{section.title}</h4>
            <div className="space-y-1.5">
              {section.items.map((item, idx) => {
                const checked = selections[section.title]?.has(idx) ?? false
                return (
                  <label key={idx} className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-2.5 transition-colors ${checked ? "border-cr-red bg-cr-red-light" : "border-cr-gray-200 bg-white hover:border-cr-gray-300"}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type={section.type}
                        name={section.type === "radio" ? section.title : undefined}
                        checked={checked}
                        onChange={() => toggleItem(section.title, idx, section.type)}
                        className="accent-cr-red"
                      />
                      <span className="text-sm text-cr-gray-900">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-cr-gray-600">{item.price}</span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {selectedMissions.length > 0 && (
        <div className="rounded-xl border border-cr-gray-200 bg-white p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-cr-gray-400">Récapitulatif ({selectedMissions.length} missions sélectionnées)</h4>
          <ul className="space-y-1">
            {selectedMissions.map((m, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-cr-gray-700">{m.name}</span>
                <span className="font-medium tabular-nums text-cr-gray-900">{m.montant !== null ? `${m.montant} €` : "Sur devis"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handlePreview} disabled={generating}>
          {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          Aperçu PDF
        </Button>
        <Button>Générer le devis</Button>
      </div>
    </div>
  )
}

// ─── JURIDIQUE ───

function JuridiqueTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Scale size={40} className="mb-4 text-cr-gray-300" />
      <p className="text-sm text-cr-gray-500">
        Les missions juridiques font l'objet de lettres de mission, pas de devis.
      </p>
      <Button variant="outline" className="mt-4">Voir les lettres de mission</Button>
    </div>
  )
}

// ─── PAGE ───

export function DevisPage() {
  const [tab, setTab] = useState<Tab>("comptable")

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-cr-gray-900">Génération de devis</h1>
      <p className="mb-8 text-sm text-cr-gray-500">Créer un devis comptable, social ou juridique</p>

      <div className="mb-8 flex gap-1 rounded-lg bg-cr-gray-100 p-1">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${tab === t.value ? "bg-white text-cr-gray-900 shadow-sm" : "text-cr-gray-500 hover:text-cr-gray-700"}`}
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
