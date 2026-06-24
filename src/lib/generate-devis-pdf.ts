import jsPDF from "jspdf"

export interface DevisData {
  civilite: string
  nomDirigeant: string
  raisonSociale: string
  adresse: string
  codePostal: string
  ville: string
  activite: string
  caAnnuel: string
  formeJuridique: string
  regimeTva: string
  dateDebutMission: string
  dateFinExercice: string
  missions: { name: string; montant: number }[]
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export async function generateDevisPdf(data: DevisData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageW = 210
  const marginL = 18
  const marginR = 18
  const contentW = pageW - marginL - marginR
  const RED = "#EE0000"
  const DARK = "#1A1A1A"

  let logoImg: HTMLImageElement | null = null
  let footerImg: HTMLImageElement | null = null
  try {
    logoImg = await loadImage("/logo-cr.jpg")
    footerImg = await loadImage("/footer-cr.jpg")
  } catch {
    // images optional
  }

  function addHeaderFooter() {
    if (logoImg) {
      doc.addImage(logoImg, "JPEG", marginL, 8, 50, 20)
    }
    if (footerImg) {
      doc.addImage(footerImg, "JPEG", 5, 275, 200, 16)
    }
  }

  // --- PAGE 1 ---
  addHeaderFooter()

  let y = 38

  // Client info — right-aligned
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(DARK)
  doc.text(data.raisonSociale || "[RAISON SOCIALE]", pageW - marginR, y, { align: "right" })
  y += 6
  doc.setFont("helvetica", "normal")
  const civiliteLabel = data.civilite === "Mme" ? "Madame" : "Monsieur"
  doc.text(
    `À l'attention de ${civiliteLabel} ${data.nomDirigeant || "[NOM]"}`,
    pageW - marginR,
    y,
    { align: "right" }
  )
  y += 6
  doc.text(data.adresse || "[ADRESSE]", pageW - marginR, y, { align: "right" })
  y += 6
  doc.text(
    `${data.codePostal || "[CODE POSTAL]"} ${data.ville || "[VILLE]"}`,
    pageW - marginR,
    y,
    { align: "right" }
  )
  y += 8

  const today = new Date()
  const dateStr = today.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  doc.text(`Lattes, le ${dateStr}`, pageW - marginR, y, { align: "right" })
  y += 20

  // DEVIS title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(RED)
  doc.text("DEVIS", marginL, y)
  y += 12

  // Intro paragraphs
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(DARK)

  const intro1 =
    "C&R Conseil est un cabinet d'expertise comptable et de conseils aux entreprises et dirigeants. Gestion de vos factures, déclarations fiscales, suivi de votre trésorerie, optimisation de votre rémunération, rédaction de vos procès-verbaux... C'est simple. On s'occupe de tout."
  const lines1 = doc.splitTextToSize(intro1, contentW)
  doc.text(lines1, marginL, y)
  y += lines1.length * 5 + 4

  const intro2 =
    "Toutefois, loin des prestations uniques et standardisées, nous souhaitons devenir le partenaire incontournable de votre vie de dirigeant. Nous nous adaptons à votre métier, aux enjeux de votre entreprise, et à vos spécificités propres. Un travail en commun qui participera à la pérennisation et au développement de votre activité !"
  const lines2 = doc.splitTextToSize(intro2, contentW)
  doc.text(lines2, marginL, y)
  y += lines2.length * 5 + 4

  const intro3 =
    "C&R Conseil, c'est la volonté d'être bien plus qu'un simple cabinet de comptabilité."
  doc.text(intro3, marginL, y)
  y += 12

  // Présentation de votre entreprise table
  const tableX = marginL
  const col1W = 60
  const col2W = contentW - col1W
  const rowH = 8

  // Header row
  doc.setFillColor(RED)
  doc.rect(tableX, y, contentW, rowH, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor("#FFFFFF")
  doc.text("Présentation de votre entreprise", tableX + 3, y + 5.5)
  y += rowH

  // Info rows
  const infoRows = [
    ["Activité de l'entreprise", data.activite],
    ["Chiffre d'affaires annuel estimé", data.caAnnuel],
    ["Forme juridique de l'entreprise", data.formeJuridique],
    ["Régime TVA", data.regimeTva],
    ["Régime fiscal", ""],
    ["Date de début de mission", data.dateDebutMission],
    ["Date de fin du premier exercice", data.dateFinExercice],
  ]

  infoRows.forEach((row, i) => {
    if (i % 2 === 0) {
      doc.setFillColor("#F2F2F2")
      doc.rect(tableX, y, contentW, rowH, "F")
    }
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(DARK)
    doc.text(row[0], tableX + 3, y + 5.5)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(DARK)
    doc.text(row[1] || "", tableX + col1W + col2W - 3, y + 5.5, {
      align: "right",
    })
    y += rowH
  })

  // --- PAGE 2 ---
  doc.addPage()
  addHeaderFooter()
  y = 38

  // NOTRE PROPOSITION
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(RED)
  doc.text("NOTRE PROPOSITION", marginL, y)
  y += 2
  doc.setDrawColor(DARK)
  doc.setLineWidth(0.3)
  doc.line(marginL, y, pageW - marginR, y)
  y += 14

  // Missions table
  const mCol1W = contentW * 0.6
  const mCol2W = contentW * 0.4

  // Header
  doc.setFillColor(RED)
  doc.rect(tableX, y, contentW, rowH, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor("#FFFFFF")
  doc.text("Liste des missions", tableX + 3, y + 5.5)
  doc.text("Montant mensuel HT", tableX + mCol1W + mCol2W - 3, y + 5.5, {
    align: "right",
  })
  y += rowH

  // Mission rows
  const totalHT = data.missions.reduce((s, m) => s + m.montant, 0)

  data.missions.forEach((mission, i) => {
    if (i % 2 === 0) {
      doc.setFillColor("#F2F2F2")
      doc.rect(tableX, y, contentW, rowH, "F")
    }
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(DARK)
    doc.text(mission.name || "—", tableX + 3, y + 5.5)
    doc.setFont("helvetica", "bold")
    doc.text(
      mission.montant ? `${mission.montant.toLocaleString("fr-FR")} €` : "€",
      tableX + contentW - 3,
      y + 5.5,
      { align: "right" }
    )
    y += rowH
  })

  // Total row
  y += 4
  doc.setFillColor(RED)
  doc.rect(tableX, y, contentW, rowH + 2, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor("#FFFFFF")
  doc.text("TOTAL MENSUEL HT", tableX + 3, y + 6.5)
  doc.text(
    `${totalHT.toLocaleString("fr-FR")} €`,
    tableX + contentW - 3,
    y + 6.5,
    { align: "right" }
  )
  y += rowH + 12

  // Closing text
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(DARK)
  doc.text("Afin de valider cette proposition, merci de nous adresser :", marginL, y)
  y += 8

  const items = [
    "Un « Bon pour accord » par retour de mail ;",
    "Un KBIS de la société ;",
    "Un RIB bancaire ;",
    "Copie de la pièce d'identité du dirigeant ;",
    "Le cas échéant, les coordonnées du contact du cabinet comptable actuel.",
  ]
  items.forEach((item) => {
    doc.text(`•  ${item}`, marginL + 4, y)
    y += 7
  })

  y += 8
  doc.text(
    "Nous restons à votre disposition pour échanger et discuter de cette proposition.",
    marginL,
    y
  )
  y += 12
  doc.text("Bien à vous,", marginL, y)
  y += 24
  doc.text("Signature client", marginL, y)
  y += 8
  doc.text("Précédée de la mention « Bon pour accord »", marginL, y)

  return doc
}
