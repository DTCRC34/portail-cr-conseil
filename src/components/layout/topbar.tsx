import { Bell, ChevronDown, LogOut, User } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"

export function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-cr-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-cr-red">
            <span className="text-sm font-bold text-cr-red">CR</span>
          </div>
          <span className="text-sm font-semibold text-cr-gray-900 tracking-tight">
            Portail Interne
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button className="relative rounded-lg p-2 text-cr-gray-400 transition-colors hover:bg-cr-gray-100 hover:text-cr-gray-600">
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cr-red" />
          </button>

          <div ref={ref} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-cr-gray-100"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cr-red text-xs font-semibold text-white">
                DC
              </div>
              <ChevronDown size={14} className="text-cr-gray-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-lg border border-cr-gray-200 bg-white py-1 shadow-lg">
                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-cr-gray-600 hover:bg-cr-gray-50">
                  <User size={14} />
                  Profil
                </button>
                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-cr-gray-600 hover:bg-cr-gray-50">
                  <LogOut size={14} />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
