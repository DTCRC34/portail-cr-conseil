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

const BODY_COLOR = "#333333"
const RED = "#EE0000"

export async function generateDevisPdf(data: DevisData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageW = 210
  const pageH = 297
  const marginL = 18
  const marginR = 18
  const contentW = pageW - marginL - marginR

  let logoDataUrl: string | null = null
  let footerDataUrl: string | null = null
  let watermarkDataUrl: string | null = null

  try {
    [logoDataUrl, footerDataUrl, watermarkDataUrl] = await Promise.all([
      loadImageAsDataUrl("/logo-cr-conseil.png"),
      loadImageAsDataUrl("/footer-cr.jpg"),
      loadImageAsDataUrl("/watermark-cr.jpg"),
    ])
  } catch {
    // images optional
  }

  function addHeaderFooter() {
    if (watermarkDataUrl) {
      const wmW = 130
      const wmH = wmW * (2191 / 1879)
      doc.addImage(watermarkDataUrl, "JPEG", (pageW - wmW) / 2, (pageH - wmH) / 2, wmW, wmH, undefined, "NONE")
    }
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", marginL, 6, 40, 25)
    }
    if (footerDataUrl) {
      doc.addImage(footerDataUrl, "JPEG", 5, 278, 200, 14)
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
    pageW - marginR, y, { align: "right" }
  )
  y += 6
  doc.text(data.adresse || "[ADRESSE]", pageW - marginR, y, { align: "right" })
  y += 6
  doc.text(
    `${data.codePostal || "[CODE POSTAL]"} ${data.ville || "[VILLE]"}`,
    pageW - marginR, y, { align: "right" }
  )
  y += 8

  const today = new Date()
  const dateStr = today.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
  doc.text(`Lattes, le ${dateStr}`, pageW - marginR, y, { align: "right" })
  y += 20

  // DEVIS title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(RED)
  doc.text("DEVIS", marginL, y)
  y += 12

  // Intro paragraphs — justified
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(BODY_COLOR)

  const intro1 = "C&R Conseil est un cabinet d'expertise comptable et de conseils aux entreprises et dirigeants. Gestion de vos factures, déclarations fiscales, suivi de votre trésorerie, optimisation de votre rémunération, rédaction de vos procès-verbaux... C'est simple. On s'occupe de tout."
  const lines1 = doc.splitTextToSize(intro1, contentW)
  doc.text(lines1, marginL, y, { align: "justify", maxWidth: contentW })
  y += lines1.length * 5.5 + 4

  const intro2 = "Toutefois, loin des prestations uniques et standardisées, nous souhaitons devenir le partenaire incontournable de votre vie de dirigeant. Nous nous adaptons à votre métier, aux enjeux de votre entreprise, et à vos spécificités propres. Un travail en commun qui participera à la pérennisation et au développement de votre activité !"
  const lines2 = doc.splitTextToSize(intro2, contentW)
  doc.text(lines2, marginL, y, { align: "justify", maxWidth: contentW })
  y += lines2.length * 5.5 + 4

  const intro3 = "C&R Conseil, c'est la volonté d'être bien plus qu'un simple cabinet de comptabilité."
  doc.text(intro3, marginL, y, { align: "justify", maxWidth: contentW })
  y += 12

  // Présentation de votre entreprise table
  const tableX = marginL
  const rowH = 8

  doc.setFillColor(RED)
  doc.rect(tableX, y, contentW, rowH, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor("#FFFFFF")
  doc.text("Présentation de votre entreprise", tableX + 3, y + 5.5)
  y += rowH

  const caDisplay = data.caAnnuel ? data.caAnnuel.replace(/\s*€?\s*$/, "") + " €" : ""

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
      tableX + contentW - 3, y + 5.5, { align: "right" }
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
  y += rowH + 2

  // Two blank lines before closing text
  y += 16

  // Closing text — justified
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(BODY_COLOR)
  doc.text("Afin de valider cette proposition, merci de nous adresser :", marginL, y, { align: "justify", maxWidth: contentW })
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
  doc.text("Nous restons à votre disposition pour échanger et discuter de cette proposition.", marginL, y, { align: "justify", maxWidth: contentW })
  y += 12
  doc.text("Bien à vous,", marginL, y)
  y += 8

  // Sender name
  const senderCivilite = data.civilite === "Mme" ? "Mme" : "M."
  doc.setFont("helvetica", "bold")
  doc.text(`${senderCivilite} ${data.prenom || ""} ${data.nom || ""}`.trim(), marginL, y)
  y += 16

  // Signature block — right-aligned with grey frame
  const sigBoxW = 70
  const sigBoxH = 30
  const sigBoxX = pageW - marginR - sigBoxW

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(BODY_COLOR)
  doc.text("Signature client", sigBoxX + sigBoxW / 2, y, { align: "center" })
  y += 4

  doc.setDrawColor("#CCCCCC")
  doc.setLineWidth(0.4)
  doc.rect(sigBoxX, y, sigBoxW, sigBoxH)
  doc.setFillColor("#FAFAFA")
  doc.rect(sigBoxX, y, sigBoxW, sigBoxH, "F")
  doc.setDrawColor("#CCCCCC")
  doc.rect(sigBoxX, y, sigBoxW, sigBoxH, "S")

  y += sigBoxH + 4
  doc.setFontSize(9)
  doc.setTextColor("#999999")
  doc.text("Précédée de la mention « Bon pour accord »", sigBoxX + sigBoxW / 2, y, { align: "center" })

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

    sectionHeader("Établissement des bulletins de paie mensuels")
    ;[["1 salarié", "32 € HT"], ["2 à 5 salariés", "28 € HT"], ["6 à 9 salariés", "24 € HT"], ["10 à 19 salariés", "22 € HT"], ["+ de 20 salariés", "Sur devis"]].forEach((r, i) => tarifRow(r[0], r[1], i))
    y += 4

    sectionHeader("Paramétrage des dossiers de paie")
    ;[["De 1 à 2 salariés — Annuel", "50 € HT"], ["De 1 à 2 salariés — Reprise de dossier", "95 € HT"], ["De 3 à 5 salariés — Annuel", "70 € HT"], ["De 3 à 5 salariés — Reprise de dossier", "140 € HT"], ["De 6 à 10 salariés — Annuel", "95 € HT"], ["De 6 à 10 salariés — Reprise de dossier", "195 € HT"], ["+ de 20 salariés — Annuel", "120 € HT"], ["+ de 20 salariés — Reprise de dossier", "Sur devis"]].forEach((r, i) => tarifRow(r[0], r[1], i))
    y += 4

    sectionHeader("Missions ponctuelles paie")
    ;[["DPAE", "10 € HT"], ["CDD", "100 € HT"], ["CDI", "100 € HT"], ["CDI ou CDD avec clauses spécifiques", "Sur devis"], ["Avenant à un contrat de travail", "50 € HT"], ["Simulation bulletin de salaire", "15 € HT"], ["Procédures disciplinaires", "Sur devis"], ["Procédures licenciements", "Sur devis"], ["Rupture conventionnelle", "375 € HT"], ["Déclaration arrêt maladie", "30 € HT"], ["Déclaration accident de travail", "40 € HT"], ["Établissement solde de tout compte", "50 € HT"], ["Décision unilatérale employeur : Prime PPV", "Sur devis"], ["Contrôle URSSAF sur pièces", "300 € HT"], ["Contrôle URSSAF sur place (< 6 sal.)", "450 € HT"], ["Contrôle URSSAF sur place (≥ 6 sal.)", "Sur devis"]].forEach((r, i) => tarifRow(r[0], r[1], i))

    // Page 2 annexe
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

    sectionHeader("Adhésions")
    ;[["Adhésion mutuelle et paramétrage", "50 € HT"], ["Adhésion prévoyance et paramétrage", "50 € HT"], ["Adhésion médecine du travail", "25 € HT"], ["Forfait adhésion organismes divers secteur bâtiment", "100 € HT"]].forEach((r, i) => tarifRow(r[0], r[1], i))
    y += 4

    sectionHeader("Études mandataire")
    ;[["Dossier Pôle emploi", "100 € HT"], ["Dossier AGEFIPH (aide salarié handicapé)", "90 € HT"], ["Gestion aide salarié apprenti", "100 € HT"], ["Autorisation provisoire de travail", "80 € HT"], ["Courrier fin période d'essai", "50 € HT"], ["Prise en charge formation", "95 € HT"]].forEach((r, i) => tarifRow(r[0], r[1], i))
    y += 4

    sectionHeader("Missions exceptionnelles RH")
    ;[["MySilae + Accès coffre fort numérique", "2 € / bulletin"], ["Paiement salaires : envoi fichier de prélèvement", "2 € HT/mois"], ["Hotline droit social", "100 € HT/h"], ["Convention transfert", "250 € HT"], ["Audit RH et/ou social", "Sur devis"], ["Charte télétravail", "400 € HT"], ["Accord d'entreprise", "Sur devis"], ["Règlement intérieur", "750 € HT"], ["Mise en place TR carte (DUE + paramétrage)", "300 € HT"], ["Mise en place TR papier (DUE + paramétrage)", "200 € HT"], ["Entretien annuel", "800 € HT"], ["Convention MAD + avenant", "300 € HT"], ["Fiches de poste", "Sur devis"], ["Aide à l'affichage obligatoire", "150 € HT"], ["Accompagnement DUERP", "Sur devis"]].forEach((r, i) => tarifRow(r[0], r[1], i))
  }

  return doc
}
