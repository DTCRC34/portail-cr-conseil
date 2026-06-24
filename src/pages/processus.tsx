import { Badge } from "@/components/ui/badge"

const PHASES = [
  {
    title: "Phase 1 — J-10 à J-5",
    subtitle: "20–25 du mois en cours",
    steps: [
      {
        number: 1,
        title: "Saisie des éléments exceptionnels",
        description: "Les managers et associés déclarent les éléments exceptionnels à facturer via le module dédié.",
        role: "Managers / Associés",
        roleColor: "bg-cr-orange",
        tool: "Portail",
      },
      {
        number: 2,
        title: "Saisie dans le logiciel métier",
        description: "Les collaborateurs intègrent les données dans Quadra pour les honoraires récurrents.",
        role: "Collaborateurs",
        roleColor: "bg-blue-600",
        tool: "Quadra",
      },
    ],
  },
  {
    title: "Phase 2 — J-3 à J-1",
    subtitle: "26–30 du mois en cours",
    steps: [
      {
        number: 3,
        title: "Relance et vérification",
        description: "Vérification de la complétude des saisies et relance des retardataires.",
        role: "Office Manager",
        roleColor: "bg-emerald-600",
        tool: "Portail",
      },
      {
        number: 4,
        title: "Compléments et validations",
        description: "Les managers complètent et valident les éléments en attente.",
        role: "Managers",
        roleColor: "bg-cr-orange",
        tool: "Portail",
      },
    ],
  },
  {
    title: "Phase 3 — Début M+1",
    subtitle: "1–5 du mois suivant",
    steps: [
      {
        number: 5,
        title: "Génération factures récurrentes",
        description: "Création des factures récurrentes dans Pennylane.",
        role: "Office Manager",
        roleColor: "bg-emerald-600",
        tool: "Pennylane",
      },
      {
        number: 6,
        title: "Intégration des exceptionnels",
        description: "Export des éléments validés depuis le portail vers Pennylane.",
        role: "Office Manager",
        roleColor: "bg-emerald-600",
        tool: "Portail + Pennylane",
      },
      {
        number: 7,
        title: "Contrôle et validation finale",
        description: "Vérification des montants et validation par les associés pour les montants importants.",
        role: "Office Manager + Associés",
        roleColor: "bg-cr-red",
        tool: "Pennylane",
      },
    ],
  },
  {
    title: "Phase 4 — Envoi & suivi",
    subtitle: "5–10 du mois suivant",
    steps: [
      {
        number: 8,
        title: "Envoi et suivi des règlements",
        description: "Envoi des factures aux clients et suivi des paiements.",
        role: "Office Manager",
        roleColor: "bg-emerald-600",
        tool: "Pennylane",
      },
    ],
  },
]

export function ProcessusPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-cr-gray-900">
        Processus de facturation
      </h1>
      <p className="mb-10 text-sm text-cr-gray-500">
        Guide mensuel du cycle de facturation
      </p>

      <div className="space-y-10">
        {PHASES.map((phase) => (
          <section key={phase.title}>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-cr-gray-900">{phase.title}</h2>
              <p className="text-xs text-cr-gray-400">{phase.subtitle}</p>
            </div>
            <div className="relative space-y-3 pl-8 before:absolute before:left-3 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-cr-gray-200">
              {phase.steps.map((step) => (
                <div key={step.number} className="relative rounded-xl border border-cr-gray-200 bg-white p-4">
                  <div className="absolute -left-8 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-cr-gray-900 text-xs font-semibold text-white">
                    {step.number}
                  </div>
                  <h3 className="text-sm font-medium text-cr-gray-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-cr-gray-500">{step.description}</p>
                  <div className="mt-3 flex gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white ${step.roleColor}`}>
                      {step.role}
                    </span>
                    <Badge variant="outline">{step.tool}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
