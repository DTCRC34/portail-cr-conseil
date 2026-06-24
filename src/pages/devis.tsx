import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Users, Scale, Plus, Trash2, Loader2 } from "lucide-react"
import { generateDevisPdf, type DevisData } from "@/lib/generate-devis-pdf"

type Tab = "comptable" | "social" | "juridique"

const TABS: { value: Tab; label: string; icon: typeof FileText }[] = [
  { value: "comptable", label: "Comptable", icon: FileText },
  { value: "social", label: "Social", icon: Users },
  { value: "juridique", label: "Juridique", icon: Scale },
]

interface Mission {
  id: number
  name: string
  montant: number
}

const DEFAULT_MISSIONS: Mission[] = [
  { id: 1, name: "Tenue de la comptabilité", montant: 0 },
  { id: 2, name: "Juridique annuel", montant: 0 },
  { id: 3, name: "ECF", montant: 0 },
  { id: 4, name: "Plateforme agréée", montant: 0 },
  { id: 5, name: "Frais administratifs", montant: 0 },
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

function ComptableTab() {
  const [civilite, setCivilite] = useState("M.")
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [raisonSociale, setRaisonSociale] = useState("")
  const [adresse, setAdresse] = useState("")
  const [codePostal, setCodePostal] = useState("")
  const [ville, setVille] = useState("")
  const [activite, setActivite] = useState("")
  const [caAnnuel, setCaAnnuel] = useState("")
  const [formeJuridique, setFormeJuridique] = useState("")
  const [regimeTva, setRegimeTva] = useState("")
  const [dateDebutMission, setDateDebutMission] = useState("")
  const [dateFinExercice, setDateFinExercice] = useState("")
  const [missions, setMissions] = useState<Mission[]>(DEFAULT_MISSIONS.map(m => ({ ...m })))
  const [annexerGrilleSociale, setAnnexerGrilleSociale] = useState(false)
  const [generating, setGenerating] = useState(false)

  const toDevisData = useCallback((): DevisData => ({
    civilite, nom, prenom, raisonSociale, adresse, codePostal, ville,
    activite, caAnnuel, formeJuridique, regimeTva, dateDebutMission, dateFinExercice,
    missions, annexerGrilleSociale,
  }), [civilite, nom, prenom, raisonSociale, adresse, codePostal, ville,
    activite, caAnnuel, formeJuridique, regimeTva, dateDebutMission, dateFinExercice,
    missions, annexerGrilleSociale])

  const handlePreview = useCallback(async () => {
    setGenerating(true)
    try {
      const doc = await generateDevisPdf(toDevisData())
      const blob = doc.output("blob")
      const url = URL.createObjectURL(blob)
      window.open(url, "_blank")
    } finally {
      setGenerating(false)
    }
  }, [toDevisData])

  const addMission = () =>
    setMissions([...missions, { id: Date.now(), name: "", montant: 0 }])
  const removeMission = (id: number) =>
    setMissions(missions.filter((m) => m.id !== id))
  const updateMission = (id: number, field: "name" | "montant", value: string) => {
    setMissions(
      missions.map((m) =>
        m.id === id
          ? { ...m, [field]: field === "montant" ? Number(value) || 0 : value }
          : m
      )
    )
  }

  const totalHT = missions.reduce((s, m) => s + m.montant, 0)

  const caDisplay = caAnnuel.replace(/\s*€?\s*$/, "")
  const caWithEuro = caDisplay ? `${caDisplay} €` : ""

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
          <div className="h-4 w-0.5 rounded-full bg-cr-red" />
          Client
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Civilité" required>
            <select value={civilite} onChange={(e) => setCivilite(e.target.value)} className={selectClass}>
              <option value="M.">M.</option>
              <option value="Mme">Mme</option>
            </select>
          </Field>
          <Field label="Raison sociale" required>
            <input value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Nom du dirigeant" required>
            <input value={nom} onChange={(e) => setNom(e.target.value.toUpperCase())} className={inputClass} placeholder="NOM" />
          </Field>
          <Field label="Prénom" required>
            <input value={prenom} onChange={(e) => setPrenom(e.target.value)} className={inputClass} placeholder="Prénom" />
          </Field>
          <Field label="Adresse" required>
            <input value={adresse} onChange={(e) => setAdresse(e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Code postal" required>
              <input value={codePostal} onChange={(e) => setCodePostal(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Ville" required>
              <input value={ville} onChange={(e) => setVille(e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
          <div className="h-4 w-0.5 rounded-full bg-cr-red" />
          Entreprise
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Activité de l'entreprise" required>
            <input value={activite} onChange={(e) => setActivite(e.target.value)} className={inputClass} />
          </Field>
          <Field label="CA annuel estimé" required>
            <div className="relative">
              <input
                value={caAnnuel}
                onChange={(e) => setCaAnnuel(e.target.value)}
                className={inputClass + " pr-8"}
                placeholder="ex : 54K"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cr-gray-400">€</span>
            </div>
            {caWithEuro && (
              <p className="mt-1 text-xs text-cr-gray-400">Affiché : {caWithEuro}</p>
            )}
          </Field>
          <Field label="Forme juridique">
            <select value={formeJuridique} onChange={(e) => setFormeJuridique(e.target.value)} className={selectClass}>
              <option value="">Sélectionner</option>
              <option>Entreprise individuelle</option>
              <option>SARL</option>
              <option>SAS</option>
              <option>SASU</option>
              <option>EURL</option>
              <option>SCI</option>
              <option>Autre</option>
            </select>
          </Field>
          <Field label="Régime TVA" required>
            <select value={regimeTva} onChange={(e) => setRegimeTva(e.target.value)} className={selectClass}>
              <option value="">Sélectionner</option>
              <option>Mensuel</option>
              <option>Trimestriel</option>
              <option>Annuel</option>
              <option>Franchise en base</option>
            </select>
          </Field>
          <Field label="Date de début de mission" required>
            <input type="date" value={dateDebutMission} onChange={(e) => setDateDebutMission(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Date de fin du 1er exercice" required>
            <input type="date" value={dateFinExercice} onChange={(e) => setDateFinExercice(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
          <div className="h-4 w-0.5 rounded-full bg-cr-red" />
          Missions
        </h3>
        <div className="space-y-2">
          {missions.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border border-cr-gray-200 bg-white px-4 py-3">
              <input
                value={m.name}
                onChange={(e) => updateMission(m.id, "name", e.target.value)}
                className="flex-1 bg-transparent text-sm text-cr-gray-900 outline-none placeholder:text-cr-gray-400"
                placeholder="Nom de la mission"
              />
              <input
                value={m.montant || ""}
                onChange={(e) => updateMission(m.id, "montant", e.target.value)}
                type="number"
                className="w-28 rounded-md border border-cr-gray-200 bg-cr-gray-50 px-3 py-1.5 text-right text-sm tabular-nums text-cr-gray-900 outline-none focus:border-cr-red"
                placeholder="0"
              />
              <span className="text-xs text-cr-gray-400">€/mois</span>
              <button onClick={() => removeMission(m.id)} className="text-cr-gray-400 hover:text-cr-red">
                <Trash2 size={14} />
              </button>
            </div>
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
          {totalHT.toLocaleString("fr-FR")} €
        </span>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-cr-gray-200 bg-white px-4 py-3 transition-colors hover:border-cr-gray-300">
        <input
          type="checkbox"
          checked={annexerGrilleSociale}
          onChange={(e) => setAnnexerGrilleSociale(e.target.checked)}
          className="accent-cr-red"
        />
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
            { label: "CDI ou CDD avec clauses spécifiques", price: "Sur devis" },
            { label: "Avenant à un contrat de travail", price: "50 €" },
            { label: "Simulation bulletin de salaire", price: "15 €" },
            { label: "Procédures disciplinaires", price: "Sur devis" },
            { label: "Procédures licenciements", price: "Sur devis" },
            { label: "Rupture conventionnelle", price: "375 €" },
            { label: "Déclaration arrêt maladie", price: "30 €" },
            { label: "Déclaration accident de travail", price: "40 €" },
            { label: "Solde de tout compte", price: "50 €" },
            { label: "Décision unilatérale employeur : Prime PPV", price: "Sur devis" },
            { label: "Contrôle URSSAF sur pièces", price: "300 €" },
            { label: "Contrôle URSSAF sur place (< 6 sal.)", price: "450 €" },
            { label: "Contrôle URSSAF sur place (≥ 6 sal.)", price: "Sur devis" },
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

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
          <div className="h-4 w-0.5 rounded-full bg-cr-red" />
          Adhésions
        </h3>
        <div className="space-y-2">
          {[
            { label: "Adhésion mutuelle et paramétrage", price: "50 €" },
            { label: "Adhésion prévoyance et paramétrage", price: "50 €" },
            { label: "Adhésion médecine du travail", price: "25 €" },
            { label: "Forfait adhésion organismes secteur bâtiment", price: "100 €" },
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

      <section>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
          <div className="h-4 w-0.5 rounded-full bg-cr-red" />
          Missions exceptionnelles RH
        </h3>
        <div className="space-y-2">
          {[
            { label: "MySilae + Accès coffre fort numérique", price: "2 € / bulletin" },
            { label: "Paiement salaires : envoi fichier prélèvement", price: "2 € HT/mois" },
            { label: "Hotline droit social", price: "100 € HT/h" },
            { label: "Convention transfert", price: "250 €" },
            { label: "Audit RH et/ou social", price: "Sur devis" },
            { label: "Charte télétravail", price: "400 €" },
            { label: "Accord d'entreprise", price: "Sur devis" },
            { label: "Règlement intérieur", price: "750 €" },
            { label: "Mise en place TR carte (DUE + paramétrage)", price: "300 €" },
            { label: "Mise en place TR papier (DUE + paramétrage)", price: "200 €" },
            { label: "Entretien annuel", price: "800 €" },
            { label: "Convention MAD + avenant", price: "300 €" },
            { label: "Fiches de poste", price: "Sur devis" },
            { label: "Aide à l'affichage obligatoire", price: "150 €" },
            { label: "Accompagnement DUERP", price: "Sur devis" },
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
