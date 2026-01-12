import fs from 'fs'
import path from 'path'

export interface LocalExam {
  id: string
  year: number
  day: number
  color: string
  area: string
}

export interface LocalQuestion {
  id: string
  number: number
  examYear: number
  examDay: number
  examColor: string
  area: string
  subject?: string
  languageOption?: string
  supportingMaterials: Array<{
    id: string
    blocks: Array<{
      id: string
      type: string
      content?: string
      url?: string
      alt?: string
      caption?: string
      metadata?: {
        source?: string
      }
    }>
    order: number
  }>
  statement: string
  alternatives: {
    A: string
    B: string
    C: string
    D: string
    E: string
  }
  correctAnswer: string
  hasMultipleTexts: boolean
  hasImages: boolean
}

export interface LocalQuestionsData {
  exam: LocalExam
  questions: LocalQuestion[]
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data')

export function getLocalQuestionsFilePath(
  year: number,
  day: number,
  color: string = 'AZUL'
): string {
  const normalizedColor = color.toUpperCase()
  const fileName = `enem-${year}-d${day}-${normalizedColor.toLowerCase()}.json`
  return path.join(DATA_DIR, String(year), fileName)
}

export function loadLocalQuestions(
  year: number,
  day: number,
  color: string = 'AZUL'
): LocalQuestionsData | null {
  try {
    const filePath = getLocalQuestionsFilePath(year, day, color)
    
    if (!fs.existsSync(filePath)) {
      console.log(`[LocalQuestions] File not found: ${filePath}`)
      return null
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(fileContent) as LocalQuestionsData
    
    console.log(`[LocalQuestions] Loaded ${data.questions.length} questions from ${filePath}`)
    return data
  } catch (error) {
    console.error(`[LocalQuestions] Error loading questions for year ${year}, day ${day}, color ${color}:`, error)
    return null
  }
}

export function getLocalQuestion(
  year: number,
  day: number,
  questionNumber: number,
  color: string = 'AZUL'
): LocalQuestion | null {
  const data = loadLocalQuestions(year, day, color)
  if (!data) return null

  return data.questions.find(q => q.number === questionNumber) || null
}

export function getAvailableLocalYears(): number[] {
  try {
    const years: number[] = []
    const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory() && /^\d{4}$/.test(entry.name)) {
        const year = parseInt(entry.name, 10)
        if (!isNaN(year)) {
          years.push(year)
        }
      }
    }
    
    return years.sort((a, b) => b - a)
  } catch (error) {
    console.error('[LocalQuestions] Error getting available years:', error)
    return []
  }
}

export function getAvailableLocalExamsForYear(year: number): Array<{ day: number; color: string }> {
  try {
    const yearDir = path.join(DATA_DIR, String(year))
    if (!fs.existsSync(yearDir)) {
      return []
    }

    const exams: Array<{ day: number; color: string }> = []
    const files = fs.readdirSync(yearDir)
    
    for (const file of files) {
      if (file.startsWith('enem-') && file.endsWith('.json')) {
        const match = file.match(/enem-(\d{4})-d(\d)-(azul|amarelo|rosa|branco|cinza)\.json/i)
        if (match) {
          const day = parseInt(match[2], 10)
          const color = match[3].toUpperCase()
          
          // Normalize color names
          const normalizedColor = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()
          
          exams.push({ day, color: normalizedColor })
        }
      }
    }
    
    return exams
  } catch (error) {
    console.error(`[LocalQuestions] Error getting exams for year ${year}:`, error)
    return []
  }
}
