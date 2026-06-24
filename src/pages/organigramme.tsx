const TEAM = {
  associes: [
    { initials: "CR", name: "C. Rougier", title: "Associé fondateur", modules: ["Devis", "Facturation"] },
    { initials: "PR", name: "P. Rougier", title: "Associée", modules: ["Lettres de mission"] },
  ],
  managers: [
    { initials: "DC", name: "D. Conseil", title: "Manager comptable", modules: ["Devis", "Facturation"] },
    { initials: "ML", name: "M. Laurent", title: "Manager social", modules: ["Devis social"] },
  ],
  collaborateurs: [
    { initials: "SB", name: "S. Bernard", title: "Collaborateur comptable" },
    { initials: "AT", name: "A. Thomas", title: "Collaboratrice comptable" },
  ],
  office: [
    { initials: "JD", name: "J. Durand", title: "Office Manager", modules: ["Facturation", "Pièces"] },
  ],
}

const ROLE_COLORS: Record<string, string> = {
  associes: "bg-cr-red",
  managers: "bg-cr-orange",
  collaborateurs: "bg-blue-600",
  office: "bg-emerald-600",
}

const ROLE_LABELS: Record<string, string> = {
  associes: "Associés",
  managers: "Managers",
  collaborateurs: "Collaborateurs",
  office: "Office Manager",
}

export function OrganigrammePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-cr-gray-900">
        Organigramme
      </h1>
      <p className="mb-10 text-sm text-cr-gray-500">
        Rôles et responsabilités de l'équipe
      </p>

      <div className="space-y-10">
        {Object.entries(TEAM).map(([role, members]) => (
          <section key={role}>
            <div className="mb-4 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${ROLE_COLORS[role]}`} />
              <h2 className="text-sm font-semibold text-cr-gray-900">{ROLE_LABELS[role]}</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div
                  key={member.initials}
                  className="flex items-start gap-4 rounded-xl border border-cr-gray-200 bg-white p-4"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${ROLE_COLORS[role]}`}>
                    {member.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cr-gray-900">{member.name}</p>
                    <p className="text-xs text-cr-gray-500">{member.title}</p>
                    {"modules" in member && member.modules && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {member.modules.map((m) => (
                          <span key={m} className="rounded-full bg-cr-gray-100 px-2 py-0.5 text-[10px] font-medium text-cr-gray-600">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
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
