import jsPDF from "jspdf"

export interface DevisData {
  civilite: string
  nom: string
  prenom: string
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
  annexerGrilleSociale: boolean
}

async function loadImage(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function drawHexLogo(doc: jsPDF, x: number, y: number, size: number) {
  const cx = x + size / 2
  const cy = y + size / 2
  const r = size / 2 - 2

  const points: [number, number][] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }

  doc.setDrawColor("#CC0000")
  doc.setLineWidth(1.2)
  for (let i = 0; i < 6; i++) {
    const gradientFactor = i / 5
    const r2 = Math.round(204 + (232 - 204) * gradientFactor)
    const g = Math.round(0 + (86 - 0) * gradientFactor)
    const b = Math.round(0 + (32 - 0) * gradientFactor)
    doc.setDrawColor(r2, g, b)
    const next = (i + 1) % 6
    doc.line(points[i][0], points[i][1], points[next][0], points[next][1])
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(size * 0.35)
  doc.setTextColor("#CC0000")
  doc.text("CR", cx, cy + size * 0.12, { align: "center" })
}

function drawFullLogo(doc: jsPDF, x: number, y: number) {
  drawHexLogo(doc, x, y, 22)
  doc.setFontSize(8)
  doc.setTextColor("#CC0000")
  doc.setFont("helvetica", "normal")
  doc.text("C&R", x + 24, y + 9)
  doc.setTextColor("#333333")
  doc.setFont("helvetica", "bold")
  doc.text("CONSEIL", x + 24, y + 14)
}

const BODY_COLOR = "#333333"
const RED = "#EE0000"

export async function generateDevisPdf(data: DevisData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageW = 210
  const marginL = 18
  const marginR = 18
  const contentW = pageW - marginL - marginR

  let footerDataUrl: string | null = null
  try {
    footerDataUrl = await loadImage("/footer-cr.jpg")
  } catch {
    // optional
  }

  function addHeaderFooter() {
    drawFullLogo(doc, marginL, 8)
    if (footerDataUrl) {
      doc.addImage(footerDataUrl, "JPEG", 5, 275, 200, 16)
    }
  }

  // --- PAGE 1 ---
  addHeaderFooter()

  let y = 38

  // Client info — right-aligned
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(BODY_COLOR)
  doc.text(data.raisonSociale || "[RAISON SOCIALE]", pageW - marginR, y, { align: "right" })
  y += 6
  doc.setFont("helvetica", "normal")
  const civiliteLabel = data.civilite === "Mme" ? "Madame" : "Monsieur"
  doc.text(
    `À l'attention de ${civiliteLabel} ${data.nom || "[NOM]"} ${data.prenom || "[PRÉNOM]"}`,
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
  doc.setFontSize(11)
  doc.setTextColor(BODY_COLOR)

  const intro1 =
    "C&R Conseil est un cabinet d'expertise comptable et de conseils aux entreprises et dirigeants. Gestion de vos factures, déclarations fiscales, suivi de votre trésorerie, optimisation de votre rémunération, rédaction de vos procès-verbaux... C'est simple. On s'occupe de tout."
  const lines1 = doc.splitTextToSize(intro1, contentW)
  doc.text(lines1, marginL, y)
  y += lines1.length * 5.5 + 4

  const intro2 =
    "Toutefois, loin des prestations uniques et standardisées, nous souhaitons devenir le partenaire incontournable de votre vie de dirigeant. Nous nous adaptons à votre métier, aux enjeux de votre entreprise, et à vos spécificités propres. Un travail en commun qui participera à la pérennisation et au développement de votre activité !"
  const lines2 = doc.splitTextToSize(intro2, contentW)
  doc.text(lines2, marginL, y)
  y += lines2.length * 5.5 + 4

  const intro3 =
    "C&R Conseil, c'est la volonté d'être bien plus qu'un simple cabinet de comptabilité."
  doc.text(intro3, marginL, y)
  y += 12

  // Présentation de votre entreprise table
  const tableX = marginL
  const rowH = 8

  // Header row
  doc.setFillColor(RED)
  doc.rect(tableX, y, contentW, rowH, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor("#FFFFFF")
  doc.text("Présentation de votre entreprise", tableX + 3, y + 5.5)
  y += rowH

  const caDisplay = data.caAnnuel
    ? data.caAnnuel.replace(/\s*€?\s*$/, "") + " €"
    : ""

  const infoRows = [
    ["Activité de l'entreprise", data.activite],
    ["Chiffre d'affaires annuel estimé", caDisplay],
    ["Forme juridique de l'entreprise", data.formeJuridique],
    ["Régime TVA", data.regimeTva],
    ["Date de début de mission", data.dateDebutMission],
    ["Date de fin du premier exercice", data.dateFinExercice],
  ]

  doc.setFontSize(11)
  infoRows.forEach((row, i) => {
    if (i % 2 === 0) {
      doc.setFillColor("#F2F2F2")
      doc.rect(tableX, y, contentW, rowH, "F")
    }
    doc.setFont("helvetica", "normal")
    doc.setTextColor(BODY_COLOR)
    doc.text(row[0], tableX + 3, y + 5.5)
    doc.setFont("helvetica", "bold")
    doc.text(row[1] || "", tableX + contentW - 3, y + 5.5, { align: "right" })
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
  doc.setDrawColor(BODY_COLOR)
  doc.setLineWidth(0.3)
  doc.line(marginL, y, pageW - marginR, y)
  y += 14

  // Missions table
  doc.setFillColor(RED)
  doc.rect(tableX, y, contentW, rowH, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor("#FFFFFF")
  doc.text("Liste des missions", tableX + 3, y + 5.5)
  doc.text("Montant mensuel HT", tableX + contentW - 3, y + 5.5, { align: "right" })
  y += rowH

  const totalHT = data.missions.reduce((s, m) => s + m.montant, 0)

  doc.setFontSize(11)
  data.missions.forEach((mission, i) => {
    if (i % 2 === 0) {
      doc.setFillColor("#F2F2F2")
      doc.rect(tableX, y, contentW, rowH, "F")
    }
    doc.setFont("helvetica", "normal")
    doc.setTextColor(BODY_COLOR)
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
  doc.text(`${totalHT.toLocaleString("fr-FR")} €`, tableX + contentW - 3, y + 6.5, { align: "right" })
  y += rowH + 12

  // Closing text
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(BODY_COLOR)
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
  doc.text("Nous restons à votre disposition pour échanger et discuter de cette proposition.", marginL, y)
  y += 12
  doc.text("Bien à vous,", marginL, y)
  y += 24
  doc.text("Signature client", marginL, y)
  y += 8
  doc.text("Précédée de la mention « Bon pour accord »", marginL, y)

  // --- ANNEXE GRILLE SOCIALE ---
  if (data.annexerGrilleSociale) {
    doc.addPage()
    addHeaderFooter()
    y = 38

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(RED)
    doc.text("ANNEXE — GRILLE TARIFAIRE PÔLE SOCIAL 2025", marginL, y)
    y += 2
    doc.setDrawColor(BODY_COLOR)
    doc.setLineWidth(0.3)
    doc.line(marginL, y, pageW - marginR, y)
    y += 10

    function sectionHeader(title: string) {
      doc.setFillColor(RED)
      doc.rect(tableX, y, contentW, 7, "F")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor("#FFFFFF")
      doc.text(title, tableX + 3, y + 5)
      y += 7
    }

    function tarifRow(label: string, price: string, idx: number) {
      if (idx % 2 === 0) {
        doc.setFillColor("#F2F2F2")
        doc.rect(tableX, y, contentW, 6.5, "F")
      }
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9.5)
      doc.setTextColor(BODY_COLOR)
      doc.text(label, tableX + 3, y + 4.5)
      doc.setFont("helvetica", "bold")
      doc.text(price, tableX + contentW - 3, y + 4.5, { align: "right" })
      y += 6.5
    }

    // Bulletins de paie
    sectionHeader("Établissement des bulletins de paie mensuels")
    const bulletins = [
      ["1 salarié", "32 € HT"],
      ["2 à 5 salariés", "28 € HT"],
      ["6 à 9 salariés", "24 € HT"],
      ["10 à 19 salariés", "22 € HT"],
      ["+ de 20 salariés", "Sur devis"],
    ]
    bulletins.forEach((r, i) => tarifRow(r[0], r[1], i))
    y += 4

    // Paramétrage
    sectionHeader("Paramétrage des dossiers de paie")
    const param = [
      ["De 1 à 2 salariés — Annuel", "50 € HT"],
      ["De 1 à 2 salariés — Reprise de dossier", "95 € HT"],
      ["De 3 à 5 salariés — Annuel", "70 € HT"],
      ["De 3 à 5 salariés — Reprise de dossier", "140 € HT"],
      ["De 6 à 10 salariés — Annuel", "95 € HT"],
      ["De 6 à 10 salariés — Reprise de dossier", "195 € HT"],
      ["+ de 20 salariés — Annuel", "120 € HT"],
      ["+ de 20 salariés — Reprise de dossier", "Sur devis"],
    ]
    param.forEach((r, i) => tarifRow(r[0], r[1], i))
    y += 4

    // Missions ponctuelles
    sectionHeader("Missions ponctuelles paie")
    const ponctuelles = [
      ["DPAE", "10 € HT"], ["CDD", "100 € HT"], ["CDI", "100 € HT"],
      ["CDI ou CDD avec clauses spécifiques", "Sur devis"],
      ["Avenant à un contrat de travail", "50 € HT"],
      ["Simulation bulletin de salaire", "15 € HT"],
      ["Procédures disciplinaires", "Sur devis"],
      ["Procédures licenciements", "Sur devis"],
      ["Rupture conventionnelle", "375 € HT"],
      ["Déclaration arrêt maladie", "30 € HT"],
      ["Déclaration accident de travail", "40 € HT"],
      ["Établissement solde de tout compte", "50 € HT"],
      ["Décision unilatérale employeur : Prime PPV", "Sur devis"],
      ["Contrôle URSSAF sur pièces", "300 € HT"],
      ["Contrôle URSSAF sur place (< 6 sal.)", "450 € HT"],
      ["Contrôle URSSAF sur place (≥ 6 sal.)", "Sur devis"],
    ]
    ponctuelles.forEach((r, i) => tarifRow(r[0], r[1], i))

    // Page 2 of annexe
    doc.addPage()
    addHeaderFooter()
    y = 38

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(RED)
    doc.text("ANNEXE — GRILLE TARIFAIRE PÔLE SOCIAL 2025 (suite)", marginL, y)
    y += 2
    doc.setDrawColor(BODY_COLOR)
    doc.setLineWidth(0.3)
    doc.line(marginL, y, pageW - marginR, y)
    y += 10

    // Adhésions
    sectionHeader("Adhésions")
    const adhesions = [
      ["Adhésion mutuelle et paramétrage", "50 € HT"],
      ["Adhésion prévoyance et paramétrage", "50 € HT"],
      ["Adhésion médecine du travail", "25 € HT"],
      ["Forfait adhésion organismes divers secteur bâtiment", "100 € HT"],
    ]
    adhesions.forEach((r, i) => tarifRow(r[0], r[1], i))
    y += 4

    // Études mandataire
    sectionHeader("Études mandataire")
    const etudes = [
      ["Dossier Pôle emploi", "100 € HT"],
      ["Dossier AGEFIPH (aide salarié handicapé)", "90 € HT"],
      ["Gestion aide salarié apprenti", "100 € HT"],
      ["Autorisation provisoire de travail", "80 € HT"],
      ["Courrier fin période d'essai", "50 € HT"],
      ["Prise en charge formation", "95 € HT"],
    ]
    etudes.forEach((r, i) => tarifRow(r[0], r[1], i))
    y += 4

    // Missions exceptionnelles RH
    sectionHeader("Missions exceptionnelles RH")
    const rh = [
      ["MySilae + Accès coffre fort numérique", "2 € / bulletin"],
      ["Paiement salaires : envoi fichier de prélèvement", "2 € HT/mois"],
      ["Hotline droit social", "100 € HT/h"],
      ["Convention transfert", "250 € HT"],
      ["Audit RH et/ou social", "Sur devis"],
      ["Charte télétravail", "400 € HT"],
      ["Accord d'entreprise", "Sur devis"],
      ["Règlement intérieur", "750 € HT"],
      ["Mise en place TR carte (DUE + paramétrage)", "300 € HT"],
      ["Mise en place TR papier (DUE + paramétrage)", "200 € HT"],
      ["Entretien annuel", "800 € HT"],
      ["Convention MAD + avenant", "300 € HT"],
      ["Fiches de poste", "Sur devis"],
      ["Aide à l'affichage obligatoire", "150 € HT"],
      ["Accompagnement DUERP", "Sur devis"],
    ]
    rh.forEach((r, i) => tarifRow(r[0], r[1], i))
  }

  return doc
}
