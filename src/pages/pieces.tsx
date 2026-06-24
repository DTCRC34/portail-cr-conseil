import { Button } from "@/components/ui/button"
import { Copy, Eye, Info } from "lucide-react"

export function PiecesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-cr-gray-900">
        Demande de pièces
      </h1>
      <p className="mb-8 text-sm text-cr-gray-500">
        Intégration nouveaux clients — formulaire JotForm prérempli
      </p>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-cr-red-mid bg-cr-red-light px-4 py-3">
        <Info size={16} className="mt-0.5 shrink-0 text-cr-red" />
        <p className="text-sm text-cr-gray-700">
          Les champs Cabinet sont préremplis par nos soins avant envoi. Le client ne voit que les champs non colorés.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
            <div className="h-4 w-0.5 rounded-full bg-cr-red" />
            Champs Cabinet
          </h3>
          <div className="rounded-xl border border-cr-red-mid bg-cr-red-light/50 p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Date de début de mission", type: "date" },
                { label: "Date de fin du 1er exercice", type: "date" },
                { label: "Régime TVA", type: "select" },
                { label: "Régime fiscal", type: "select" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="mb-1 block text-xs font-medium text-cr-gray-600">
                    {field.label} <span className="text-cr-red">*</span>
                  </label>
                  {field.type === "date" ? (
                    <input
                      type="date"
                      className="w-full rounded-lg border border-cr-red-mid bg-white px-3 py-2 text-sm outline-none focus:border-cr-red"
                    />
                  ) : (
                    <select className="w-full rounded-lg border border-cr-red-mid bg-white px-3 py-2 text-sm outline-none focus:border-cr-red">
                      <option value="">Sélectionner</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cr-gray-900">
            <div className="h-4 w-0.5 rounded-full bg-cr-gray-300" />
            Champs Client
            <span className="text-xs font-normal text-cr-gray-400">(remplis par le client)</span>
          </h3>
          <div className="rounded-xl border border-cr-gray-200 bg-cr-gray-50 p-6 opacity-60">
            <div className="grid grid-cols-2 gap-4">
              {["Nom", "Prénom", "Date de naissance", "Téléphone mobile", "Email", "Raison sociale", "Numéro SIRET", "Adresse", "Forme juridique", "Code postal"].map((label) => (
                <div key={label}>
                  <label className="mb-1 block text-xs font-medium text-cr-gray-400">{label}</label>
                  <div className="rounded-lg border border-cr-gray-200 bg-white px-3 py-2 text-sm text-cr-gray-300">
                    Rempli par le client
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button variant="outline">
            <Eye size={16} />
            Aperçu du formulaire
          </Button>
          <Button>
            <Copy size={16} />
            Générer le lien JotForm
          </Button>
        </div>
      </div>
    </div>
  )
}
