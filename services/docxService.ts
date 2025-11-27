import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } from "docx";
import { SessionData, Drill } from "../types";

const createHeading = (text: string, level: HeadingLevel = HeadingLevel.HEADING_1) => {
  return new Paragraph({
    text: text,
    heading: level,
    spacing: { after: 200, before: 200 },
  });
};

const createSubHeading = (text: string) => {
    return new Paragraph({
        children: [new TextRun({ text, bold: true, size: 24 })],
        spacing: { after: 100, before: 200 },
    });
};

const createText = (text: string, bold = false) => {
  return new Paragraph({
    children: [new TextRun({ text, bold })],
    spacing: { after: 100 },
  });
};

const createDrillTable = (drill: Drill) => {
    // Header Row
    const headerRow = new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "BUT", bold: true })] })], width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ORGANISATION / CONSIGNES", bold: true })] })], width: { size: 40, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "CRITÈRES DE RÉUSSITE", bold: true })] })], width: { size: 40, type: WidthType.PERCENTAGE }, shading: { fill: "E0E0E0" } }),
        ]
    });

    const instructions = drill.instructions || [];
    const successCriteria = drill.successCriteria || [];
    const evaluationCriteria = drill.evaluationCriteria || [];

    // Content Row
    const contentRow = new TableRow({
        children: [
            new TableCell({ 
                children: [new Paragraph(drill.goal || "")],
                verticalAlign: AlignmentType.CENTER
            }),
            new TableCell({ 
                children: [
                    new Paragraph({ children: [new TextRun({ text: "Dispositif:", bold: true })] }),
                    new Paragraph(drill.method || ""),
                    new Paragraph({ text: "" }),
                    new Paragraph({ children: [new TextRun({ text: "Consignes:", bold: true })] }),
                    ...instructions.map(i => new Paragraph(`• ${i}`)),
                    new Paragraph({ text: "" }),
                    new Paragraph({ children: [new TextRun({ text: "Variantes:", bold: true })] }),
                    new Paragraph(`+ ${drill.variations?.harder || ""}`),
                    new Paragraph(`- ${drill.variations?.easier || ""}`),
                ]
            }),
            new TableCell({ 
                children: [
                    ...successCriteria.map(c => new Paragraph(`• ${c}`)),
                    new Paragraph({ text: "" }),
                    new Paragraph({ children: [new TextRun({ text: "Évaluation:", bold: true, color: "CC0000" })] }),
                    ...evaluationCriteria.map(e => new Paragraph(`[0] ${e.points_0} / [2] ${e.points_2}`))
                ]
            }),
        ]
    });

    return new Table({
        rows: [headerRow, contentRow],
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        }
    });
};

export const generateDocxBlob = async (session: SessionData): Promise<Blob> => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          createHeading(`FICHE SÉANCE EPS - ${session.sport.toUpperCase()}`, HeadingLevel.TITLE),
          
          new Table({
              rows: [
                  new TableRow({
                      children: [
                          new TableCell({ children: [createText(`Niveau: ${session.level}`, true)] }),
                          new TableCell({ children: [createText(`Durée: ${session.duration} min`, true)] }),
                      ]
                  }),
                  new TableRow({
                      children: [
                          new TableCell({ children: [createText(`Matériel: ${session.material}`)] }),
                          new TableCell({ children: [createText(`Effectif: Variable`)] }),
                      ]
                  })
              ],
              width: { size: 100, type: WidthType.PERCENTAGE }
          }),

          createHeading(`OBJECTIF: ${session.objective}`),

          // Warmup
          createHeading("1. ÉCHAUFFEMENT / PRISE EN MAIN", HeadingLevel.HEADING_2),
          createSubHeading(`${session.warmup?.title || 'Échauffement'} (${session.warmup?.duration || ''})`),
          session.warmup ? createDrillTable(session.warmup) : createText("Pas d'échauffement spécifié."),
          
          new Paragraph({ text: "", spacing: { after: 300 } }),

          // Fundamental
          createHeading("2. PARTIE FONDAMENTALE", HeadingLevel.HEADING_2),
          ...(session.fundamental || []).flatMap((drill, index) => [
              createSubHeading(`Situation ${index + 1}: ${drill.title} (${drill.duration})`),
              createDrillTable(drill),
              new Paragraph({ text: "", spacing: { after: 300 } }),
          ]),

          // Final
          createHeading("3. RETOUR AU CALME", HeadingLevel.HEADING_2),
          createSubHeading(`${session.final?.title || 'Bilan'} (${session.final?.duration || ''})`),
          createText(session.final?.method || ""),
          createText(`Bilan: ${session.final?.instructions?.join(' ') || ""}`),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};