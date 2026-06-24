import jsPDF from "jspdf"

export interface DevisData {
  type: "comptable" | "social"
  civilite: string
  nom: string
  prenom: string
  raisonSociale: string
  adresse: string
  codePostal: string
  ville: string
  activite: string
  caAnnuel?: string
  formeJuridique?: string
  regimeTva?: string
  dateFinExercice?: string
  annexerGrilleSociale?: boolean
  nombreSalaries?: string
  dateDebutMission: string
  missions: { name: string; montantMensuel: number | null; montantAnnuel: number | null }[]
  redacteurCivilite: string
  redacteurNom: string
  redacteurPrenom: string
}

async function loadImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function formatDateFr(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${dd}/${mm}/${d.getFullYear()}`
}

function fmtPrice(v: number | null): string {
  if (v === null) return "Sur devis"
  if (v === 0) return "—"
  return `${v.toLocaleString("fr-FR")} €`
}

const BODY_COLOR = "#333333"
const RED = "#EE0000"

export async function generateDevisPdf(data: DevisData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageW = 210
  const pageH = 297
  const marginL = 18
  const marginR = 18
  const contentW = pageW - marginL - marginR
  const tableX = marginL
  const rowH = 8

  let logoDataUrl: string | null = null
  let footerDataUrl: string | null = null
  let watermarkDataUrl: string | null = null

  try {
    [logoDataUrl, footerDataUrl, watermarkDataUrl] = await Promise.all([
      loadImageAsDataUrl("/logo-cr-conseil.png"),
      loadImageAsDataUrl("/footer-cr.jpg"),
      loadImageAsDataUrl("/watermark-cr.jpg"),
    ])
  } catch { /* optional */ }

  function addHeaderFooter() {
    if (watermarkDataUrl) {
      const wmW = 130
      const wmH = wmW * (2191 / 1879)
      doc.addImage(watermarkDataUrl, "JPEG", (pageW - wmW) / 2, (pageH - wmH) / 2, wmW, wmH, undefined, "NONE")
    }
    if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginL, 6, 40, 25)
    if (footerDataUrl) doc.addImage(footerDataUrl, "JPEG", 5, 278, 200, 14)
  }

  function infoTable(rows: [string, string][]) {
    doc.setFontSize(11)
    rows.forEach((row, i) => {
      if (i % 2 === 0) { doc.setFillColor("#F2F2F2"); doc.rect(tableX, y, contentW, rowH, "F") }
      doc.setFont("helvetica", "normal"); doc.setTextColor(BODY_COLOR)
      doc.text(row[0], tableX + 3, y + 5.5)
      doc.setFont("helvetica", "bold")
      doc.text(row[1] || "", tableX + contentW - 3, y + 5.5, { align: "right" })
      y += rowH
    })
  }

  // === PAGE 1 ===
  addHeaderFooter()
  let y = 38

  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(BODY_COLOR)
  doc.text(data.raisonSociale || "[RAISON SOCIALE]", pageW - marginR, y, { align: "right" })
  y += 6
  doc.setFont("helvetica", "normal")
  const civ = data.civilite === "Mme" ? "Madame" : "Monsieur"
  doc.text(`À l'attention de ${civ} ${data.nom || "[NOM]"} ${data.prenom || "[PRÉNOM]"}`, pageW - marginR, y, { align: "right" })
  y += 6
  doc.text(data.adresse || "[ADRESSE]", pageW - marginR, y, { align: "right" })
  y += 6
  doc.text(`${data.codePostal || "[CP]"} ${data.ville || "[VILLE]"}`, pageW - marginR, y, { align: "right" })
  y += 8
  doc.text(`Lattes, le ${formatDateFr(new Date())}`, pageW - marginR, y, { align: "right" })
  y += 20

  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(RED)
  doc.text(data.type === "social" ? "DEVIS — PÔLE SOCIAL" : "DEVIS", marginL, y)
  y += 12

  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(BODY_COLOR)
  const intro1 = "C&R Conseil est un cabinet d'expertise comptable et de conseils aux entreprises et dirigeants. Gestion de vos factures, déclarations fiscales, suivi de votre trésorerie, optimisation de votre rémunération, rédaction de vos procès-verbaux... C'est simple. On s'occupe de tout."
  const l1 = doc.splitTextToSize(intro1, contentW)
  doc.text(l1, marginL, y, { align: "justify", maxWidth: contentW }); y += l1.length * 5.5 + 4

  const intro2 = "Toutefois, loin des prestations uniques et standardisées, nous souhaitons devenir le partenaire incontournable de votre vie de dirigeant. Nous nous adaptons à votre métier, aux enjeux de votre entreprise, et à vos spécificités propres. Un travail en commun qui participera à la pérennisation et au développement de votre activité !"
  const l2 = doc.splitTextToSize(intro2, contentW)
  doc.text(l2, marginL, y, { align: "justify", maxWidth: contentW }); y += l2.length * 5.5 + 4

  doc.text("C&R Conseil, c'est la volonté d'être bien plus qu'un simple cabinet de comptabilité.", marginL, y, { align: "justify", maxWidth: contentW })
  y += 12

  // Enterprise table
  doc.setFillColor(RED); doc.rect(tableX, y, contentW, rowH, "F")
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor("#FFFFFF")
  doc.text("Présentation de votre entreprise", tableX + 3, y + 5.5); y += rowH

  if (data.type === "comptable") {
    const caDisplay = data.caAnnuel ? data.caAnnuel.replace(/\s*€?\s*$/, "") + " €" : ""
    infoTable([
      ["Activité de l'entreprise", data.activite],
      ["Chiffre d'affaires annuel estimé", caDisplay],
      ["Forme juridique de l'entreprise", data.formeJuridique || ""],
      ["Régime TVA", data.regimeTva || ""],
      ["Date de début de mission", data.dateDebutMission],
      ["Date de fin du premier exercice", data.dateFinExercice || ""],
    ])
  } else {
    infoTable([
      ["Activité de l'entreprise", data.activite],
      ["Nombre de salariés", data.nombreSalaries || ""],
      ["Date de début de mission", data.dateDebutMission],
    ])
  }

  // === PAGE 2 — MISSIONS ===
  doc.addPage(); addHeaderFooter(); y = 38
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(RED)
  doc.text("NOTRE PROPOSITION", marginL, y); y += 2
  doc.setDrawColor(BODY_COLOR); doc.setLineWidth(0.3)
  doc.line(marginL, y, pageW - marginR, y); y += 14

  // Missions table with 3 columns: mission | mensuel | annuel
  const col1W = contentW * 0.50
  const col2W = contentW * 0.25

  doc.setFillColor(RED); doc.rect(tableX, y, contentW, rowH, "F")
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor("#FFFFFF")
  doc.text("Liste des missions", tableX + 3, y + 5.5)
  doc.text("Mensuel HT", tableX + col1W + col2W - 3, y + 5.5, { align: "right" })
  doc.text("Annuel HT", tableX + contentW - 3, y + 5.5, { align: "right" })
  y += rowH

  doc.setFontSize(10)
  data.missions.forEach((mission, i) => {
    if (y > 250) { doc.addPage(); addHeaderFooter(); y = 38 }
    if (i % 2 === 0) { doc.setFillColor("#F2F2F2"); doc.rect(tableX, y, contentW, rowH, "F") }
    doc.setFont("helvetica", "normal"); doc.setTextColor(BODY_COLOR)
    doc.text(mission.name || "—", tableX + 3, y + 5.5)
    doc.setFont("helvetica", "bold")
    doc.text(fmtPrice(mission.montantMensuel), tableX + col1W + col2W - 3, y + 5.5, { align: "right" })
    doc.text(fmtPrice(mission.montantAnnuel), tableX + contentW - 3, y + 5.5, { align: "right" })
    y += rowH
  })

  // Total row
  const totalM = data.missions.reduce((s, m) => s + (m.montantMensuel || 0), 0)
  const totalA = data.missions.reduce((s, m) => s + (m.montantAnnuel || 0), 0)
  y += 4
  doc.setFillColor(RED); doc.rect(tableX, y, contentW, rowH + 2, "F")
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor("#FFFFFF")
  doc.text("TOTAL HT", tableX + 3, y + 6.5)
  doc.text(`${totalM.toLocaleString("fr-FR")} €`, tableX + col1W + col2W - 3, y + 6.5, { align: "right" })
  doc.text(`${totalA.toLocaleString("fr-FR")} €`, tableX + contentW - 3, y + 6.5, { align: "right" })
  y += rowH + 2 + 16

  // Closing
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(BODY_COLOR)
  doc.text("Afin de valider cette proposition, merci de nous adresser :", marginL, y, { align: "justify", maxWidth: contentW }); y += 8

  for (const item of [
    "Un « Bon pour accord » par retour de mail ;",
    "Un KBIS de la société ;",
    "Un RIB bancaire ;",
    "Copie de la pièce d'identité du dirigeant ;",
    "Le cas échéant, les coordonnées du contact du cabinet comptable actuel.",
  ]) { doc.text(`•  ${item}`, marginL + 4, y); y += 7 }

  y += 8
  doc.text("Nous restons à votre disposition pour échanger et discuter de cette proposition.", marginL, y, { align: "justify", maxWidth: contentW }); y += 12
  doc.text("Bien à vous,", marginL, y); y += 8
  const rc = data.redacteurCivilite === "Mme" ? "Mme" : "M."
  doc.setFont("helvetica", "bold")
  doc.text(`${rc} ${data.redacteurPrenom} ${data.redacteurNom}`.trim(), marginL, y); y += 16

  // Signature
  const sigBoxW = 70; const sigBoxH = 30
  const sigBoxX = pageW - marginR - sigBoxW
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(BODY_COLOR)
  doc.text("Signature client", sigBoxX + sigBoxW / 2, y, { align: "center" }); y += 5
  doc.setFontSize(9); doc.setTextColor("#999999")
  doc.text("NOM Prénom du signataire : ___________________________", sigBoxX, y); y += 6
  doc.setFillColor("#FAFAFA"); doc.rect(sigBoxX, y, sigBoxW, sigBoxH, "F")
  doc.setDrawColor("#CCCCCC"); doc.setLineWidth(0.4); doc.rect(sigBoxX, y, sigBoxW, sigBoxH, "S")
  y += sigBoxH + 4
  doc.setFontSize(9); doc.setTextColor("#999999")
  doc.text("Précédée de la mention « Bon pour accord »", sigBoxX + sigBoxW / 2, y, { align: "center" })

  // Annexe
  if (data.type === "comptable" && data.annexerGrilleSociale) {
    appendGrilleSociale(doc, addHeaderFooter, tableX, contentW)
  }

  return doc
}

function appendGrilleSociale(doc: jsPDF, addHeaderFooter: () => void, tableX: number, contentW: number) {
  const marginL = 18; const marginR = 18; const pageW = 210
  let y: number

  function sectionHeader(title: string) {
    doc.setFillColor(RED); doc.rect(tableX, y, contentW, 7, "F")
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor("#FFFFFF")
    doc.text(title, tableX + 3, y + 5); y += 7
  }
  function tarifRow(label: string, price: string, idx: number) {
    if (y > 260) { doc.addPage(); addHeaderFooter(); y = 38 }
    if (idx % 2 === 0) { doc.setFillColor("#F2F2F2"); doc.rect(tableX, y, contentW, 6.5, "F") }
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(BODY_COLOR)
    doc.text(label, tableX + 3, y + 4.5)
    doc.setFont("helvetica", "bold")
    doc.text(price, tableX + contentW - 3, y + 4.5, { align: "right" }); y += 6.5
  }

  doc.addPage(); addHeaderFooter(); y = 38
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(RED)
  doc.text("ANNEXE — GRILLE TARIFAIRE PÔLE SOCIAL 2025", marginL, y); y += 2
  doc.setDrawColor(BODY_COLOR); doc.setLineWidth(0.3); doc.line(marginL, y, pageW - marginR, y); y += 10

  sectionHeader("Bulletins de paie mensuels")
  ;[["1 salarié","32 € HT"],["2 à 5 salariés","28 € HT"],["6 à 9 salariés","24 € HT"],["10 à 19 salariés","22 € HT"],["+ de 20 salariés","Sur devis"]].forEach((r,i)=>tarifRow(r[0],r[1],i)); y+=4
  sectionHeader("Paramétrage des dossiers de paie")
  ;[["1 à 2 sal. — Annuel","50 € HT"],["1 à 2 sal. — Reprise","95 € HT"],["3 à 5 sal. — Annuel","70 € HT"],["3 à 5 sal. — Reprise","140 € HT"],["6 à 10 sal. — Annuel","95 € HT"],["6 à 10 sal. — Reprise","195 € HT"],["+ 20 sal. — Annuel","120 € HT"],["+ 20 sal. — Reprise","Sur devis"]].forEach((r,i)=>tarifRow(r[0],r[1],i)); y+=4
  sectionHeader("Missions ponctuelles paie")
  ;[["DPAE","10 € HT"],["CDD","100 € HT"],["CDI","100 € HT"],["CDI/CDD clauses spécifiques","Sur devis"],["Avenant contrat","50 € HT"],["Simulation bulletin","15 € HT"],["Procédures disciplinaires","Sur devis"],["Procédures licenciements","Sur devis"],["Rupture conventionnelle","375 € HT"],["Déclaration arrêt maladie","30 € HT"],["Déclaration accident travail","40 € HT"],["Solde de tout compte","50 € HT"],["DUE : Prime PPV","Sur devis"],["Contrôle URSSAF pièces","300 € HT"],["Contrôle URSSAF place (< 6)","450 € HT"],["Contrôle URSSAF place (≥ 6)","Sur devis"]].forEach((r,i)=>tarifRow(r[0],r[1],i)); y+=4
  sectionHeader("Adhésions")
  ;[["Adhésion mutuelle","50 € HT"],["Adhésion prévoyance","50 € HT"],["Adhésion médecine du travail","25 € HT"],["Forfait organismes bâtiment","100 € HT"]].forEach((r,i)=>tarifRow(r[0],r[1],i)); y+=4
  sectionHeader("Études mandataire")
  ;[["Dossier Pôle emploi","100 € HT"],["Dossier AGEFIPH","90 € HT"],["Aide apprenti","100 € HT"],["Autorisation provisoire travail","80 € HT"],["Courrier fin période d'essai","50 € HT"],["Prise en charge formation","95 € HT"]].forEach((r,i)=>tarifRow(r[0],r[1],i)); y+=4
  sectionHeader("Missions exceptionnelles RH")
  ;[["MySilae + Coffre fort","2 € / bulletin"],["Fichier prélèvement salaires","2 € HT/mois"],["Hotline droit social","100 € HT/h"],["Convention transfert","250 € HT"],["Audit RH/social","Sur devis"],["Charte télétravail","400 € HT"],["Accord d'entreprise","Sur devis"],["Règlement intérieur","750 € HT"],["TR carte","300 € HT"],["TR papier","200 € HT"],["Entretien annuel","800 € HT"],["Convention MAD + avenant","300 € HT"],["Fiches de poste","Sur devis"],["Affichage obligatoire","150 € HT"],["Accompagnement DUERP","Sur devis"]].forEach((r,i)=>tarifRow(r[0],r[1],i))
}
