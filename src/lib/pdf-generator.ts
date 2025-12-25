import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import type { QuestionWithExam } from "@/types"
import { KNOWLEDGE_AREAS, SUBJECTS, type KnowledgeAreaKey, type SubjectKey } from "./constants"

const PAGE_WIDTH = 595 // A4
const PAGE_HEIGHT = 842 // A4
const MARGIN = 50
const LINE_HEIGHT = 15
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const avgCharWidth = fontSize * 0.5
  const maxChars = Math.floor(maxWidth / avgCharWidth)
  const words = text.split(" ")
  const lines: string[] = []
  let currentLine = ""

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length > maxChars) {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        lines.push(word)
        currentLine = ""
      }
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

export async function generateQuestionsPDF(
  questions: QuestionWithExam[],
  title: string = "Questões do ENEM"
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let yPosition = PAGE_HEIGHT - MARGIN

  // Title page
  page.drawText(title, {
    x: MARGIN,
    y: yPosition,
    size: 20,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  })

  yPosition -= 30
  page.drawText(`Total de questões: ${questions.length}`, {
    x: MARGIN,
    y: yPosition,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  })

  yPosition -= 40

  // Questions
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i]
    const area = KNOWLEDGE_AREAS[question.knowledgeArea as KnowledgeAreaKey]
    const subject = SUBJECTS[question.subject as SubjectKey]

    // Check if we need a new page
    if (yPosition < 200) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      yPosition = PAGE_HEIGHT - MARGIN
    }

    // Question header
    const header = `Questão ${question.questionNumber} - ${question.exam.year} | ${subject?.label} - ${area?.shortLabel}`
    page.drawText(header, {
      x: MARGIN,
      y: yPosition,
      size: 11,
      font: fontBold,
      color: rgb(0, 0, 0),
    })

    yPosition -= LINE_HEIGHT + 5

    // Context (if exists)
    if (question.context) {
      const contextLines = wrapText(question.context, MAX_WIDTH, 9)
      for (const line of contextLines) {
        if (yPosition < 100) {
          page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
          yPosition = PAGE_HEIGHT - MARGIN
        }

        page.drawText(line, {
          x: MARGIN + 10,
          y: yPosition,
          size: 9,
          font,
          color: rgb(0.3, 0.3, 0.3),
        })

        yPosition -= 12
      }

      yPosition -= 5
    }

    // Question statement
    const statementLines = wrapText(question.statement, MAX_WIDTH, 10)
    for (const line of statementLines) {
      if (yPosition < 100) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        yPosition = PAGE_HEIGHT - MARGIN
      }

      page.drawText(line, {
        x: MARGIN,
        y: yPosition,
        size: 10,
        font: fontBold,
        color: rgb(0, 0, 0),
      })

      yPosition -= LINE_HEIGHT
    }

    yPosition -= 5

    // Options
    const options = [
      { letter: "A", text: question.optionA },
      { letter: "B", text: question.optionB },
      { letter: "C", text: question.optionC },
      { letter: "D", text: question.optionD },
      { letter: "E", text: question.optionE },
    ]

    for (const option of options) {
      if (yPosition < 100) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        yPosition = PAGE_HEIGHT - MARGIN
      }

      const optionText = `${option.letter}) ${option.text}`
      const optionLines = wrapText(optionText, MAX_WIDTH - 20, 9)

      for (let j = 0; j < optionLines.length; j++) {
        if (yPosition < 100) {
          page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
          yPosition = PAGE_HEIGHT - MARGIN
        }

        page.drawText(optionLines[j], {
          x: MARGIN + (j === 0 ? 0 : 20),
          y: yPosition,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        })

        yPosition -= 13
      }
    }

    // Correct answer
    yPosition -= 5
    if (yPosition < 100) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      yPosition = PAGE_HEIGHT - MARGIN
    }

    page.drawText(`Resposta correta: ${question.correctAnswer}`, {
      x: MARGIN,
      y: yPosition,
      size: 9,
      font: fontBold,
      color: rgb(0, 0.5, 0),
    })

    yPosition -= 30

    // Separator
    if (i < questions.length - 1) {
      if (yPosition < 100) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        yPosition = PAGE_HEIGHT - MARGIN
      }

      page.drawLine({
        start: { x: MARGIN, y: yPosition },
        end: { x: PAGE_WIDTH - MARGIN, y: yPosition },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      })

      yPosition -= 20
    }
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" })
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
