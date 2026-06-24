import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Topbar } from "@/components/layout/topbar"
import { HomePage } from "@/pages/home"
import { FacturationPage } from "@/pages/facturation"
import { DevisPage } from "@/pages/devis"
import { PiecesPage } from "@/pages/pieces"
import { OrganigrammePage } from "@/pages/organigramme"
import { ProcessusPage } from "@/pages/processus"
import { LettresMissionPage } from "@/pages/lettres-mission"

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cr-gray-50">
        <Topbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/facturation" element={<FacturationPage />} />
          <Route path="/devis" element={<DevisPage />} />
          <Route path="/pieces" element={<PiecesPage />} />
          <Route path="/organigramme" element={<OrganigrammePage />} />
          <Route path="/processus" element={<ProcessusPage />} />
          <Route path="/lettres-mission" element={<LettresMissionPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
