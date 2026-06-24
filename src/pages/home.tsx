import { Link } from "react-router-dom"
import {
  FileText,
  ClipboardList,
  Paperclip,
  Euro,
  Users,
  Route,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const modules = [
  {
    title: "Génération de devis",
    subtitle: "Comptable ou social",
    icon: FileText,
    href: "/devis",
  },
  {
    title: "Lettres de mission",
    subtitle: "Suivi et renouvellement",
    icon: ClipboardList,
    href: "/lettres-mission",
    badge: "2 nouvelles",
  },
  {
    title: "Demande de pièces",
    subtitle: "Intégration nouveaux clients",
    icon: Paperclip,
    href: "/pieces",
  },
  {
    title: "Facturation exceptionnelle",
    subtitle: "Déclarer un élément hors forfait",
    icon: Euro,
    href: "/facturation",
    badge: "4 en attente",
  },
  {
    title: "Organigramme",
    subtitle: "Rôles et responsabilités",
    icon: Users,
    href: "/organigramme",
  },
  {
    title: "Processus",
    subtitle: "Guide mensuel de facturation",
    icon: Route,
    href: "/processus",
  },
] satisfies { title: string; subtitle: string; icon: typeof FileText; href: string; badge?: string }[]

export function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-cr-gray-900">
          Portail Interne
        </h1>
        <p className="mt-3 text-lg text-cr-gray-500">
          Cabinet C&R Conseil — Lattes, France
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            to={mod.href}
            className="group relative flex flex-col rounded-xl border border-cr-gray-200 bg-white p-6 transition-all duration-150 hover:border-cr-gray-300 hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cr-red-light text-cr-red">
                <mod.icon size={20} />
              </div>
              {mod.badge && <Badge>{mod.badge}</Badge>}
            </div>
            <h2 className="text-sm font-semibold text-cr-gray-900">
              {mod.title}
            </h2>
            <p className="mt-1 text-sm text-cr-gray-500">{mod.subtitle}</p>
            <div className="mt-4 flex items-center text-xs font-medium text-cr-gray-400 transition-colors group-hover:text-cr-red">
              Accéder →
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
